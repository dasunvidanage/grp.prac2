const Nomination = require('../models/Nomination');
const Candidate = require('../models/Candidate');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const Election = require('../models/Election');
const fs = require('fs');
const path = require('path');

exports.createNomination = (req, res) => {
  const { election_id, candidate_id, proposer_id, seconder_id, manifesto, language_proficiency, category, position, photo, photoName } = req.body;
  const studentId = (req.session.studentId || req.headers['x-student-id'] || '').toUpperCase();

  console.log('Creating nomination for Election:', election_id, 'Candidate:', candidate_id);
  
  if (!election_id) {
    return res.status(400).json({ error: 'Election ID is required.' });
  }

  // Check if nominations are open for this specific election
  Election.findById(election_id, (err, election) => {
    if (err || !election) return res.status(404).json({ error: 'Election not found.' });
    
    if (!election.has_nominations) {
        return res.status(403).json({ error: 'This election does not accept nominations.' });
    }

    const isSelf = election.nomination_type === 'self';

    if (!candidate_id || (!isSelf && (!proposer_id || !seconder_id)) || !manifesto || !language_proficiency || !category || !position) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const normCandId = candidate_id.toUpperCase();
    const normPropId = isSelf ? normCandId : proposer_id.toUpperCase();
    const normSecId = isSelf ? normCandId : seconder_id.toUpperCase();

    if (!isSelf && (normCandId === normPropId || normCandId === normSecId || normPropId === normSecId)) {
      return res.status(400).json({ error: 'Candidate, Proposer, and Seconder must be different students.' });
    }

    // Handle Local Image Saving
    let finalPhotoPath = '../assets/images/candidate_pfp.png';
    if (photo && photo.startsWith('data:image')) {
        try {
            const base64Data = photo.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `nomination_${Date.now()}_${photoName || 'photo.png'}`;
            const uploadPath = path.join(__dirname, '../../assets/images', fileName);
            
            fs.writeFileSync(uploadPath, buffer);
            finalPhotoPath = `../assets/images/${fileName}`;
            console.log('Image saved to:', uploadPath);
        } catch (imageErr) {
            console.error('Error saving nomination image:', imageErr);
            // Fallback to default if saving fails
        }
    }

    const nominationData = {
      election_id,
      candidate_id: normCandId, 
      proposer_id: normPropId, 
      seconder_id: normSecId, 
      manifesto, language_proficiency, category, position, 
      photo: finalPhotoPath
    };

    Nomination.create(nominationData, (err, nominationId) => {
      if (err) {
        console.error('Error in Nomination.create:', err);
        return res.status(500).json({ error: 'Failed to create nomination.' });
      }
      
      // Auto-approve for the creator
      if (studentId === normCandId) Nomination.updateConsent(nominationId, 'candidate', 'approved', () => {});
      
      if (isSelf) {
        // Auto-approve proposer and seconder for self-nomination
        Nomination.updateConsent(nominationId, 'proposer', 'approved', () => {});
        Nomination.updateConsent(nominationId, 'seconder', 'approved', () => {});
      } else {
        if (studentId === normPropId) Nomination.updateConsent(nominationId, 'proposer', 'approved', () => {});
        if (studentId === normSecId) Nomination.updateConsent(nominationId, 'seconder', 'approved', () => {});
      }

      res.json({ message: 'Nomination created successfully.', nominationId });
    });
  });
};

exports.getPendingNominations = (req, res) => {
  const studentId = (req.session.studentId || req.headers['x-student-id'] || '').toUpperCase();
  Nomination.getPendingForUser(studentId, (err, nominations) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch nominations.' });
    res.json(nominations);
  });
};

exports.giveConsent = (req, res) => {
  const { nominationId, role, status } = req.body; 
  const studentId = (req.session.studentId || req.headers['x-student-id'] || '').toUpperCase();
  const stringStatus = status ? 'approved' : 'rejected';

  Nomination.findById(nominationId, (err, nomination) => {
    if (err || !nomination) return res.status(404).json({ error: 'Nomination not found.' });

    if (role === 'candidate' && nomination.candidate_id.toUpperCase() !== studentId) return res.status(403).json({ error: 'Unauthorized.' });
    if (role === 'proposer' && nomination.proposer_id.toUpperCase() !== studentId) return res.status(403).json({ error: 'Unauthorized.' });
    if (role === 'seconder' && nomination.seconder_id.toUpperCase() !== studentId) return res.status(403).json({ error: 'Unauthorized.' });

    Nomination.updateConsent(nominationId, role, stringStatus, (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update consent.' });
      res.json({ message: 'Consent updated successfully.' });
    });
  });
};

exports.getAdminNominations = (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
  const offset = req.query.offset ? parseInt(req.query.offset) : undefined;
  const electionId = req.query.election_id ? parseInt(req.query.election_id) : undefined;

  Nomination.getAllForAdmin(limit, offset, electionId, (err, nominations) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch nominations.' });
    res.json(nominations);
  });
};

exports.reviewNomination = (req, res) => {
  const { nominationId, status } = req.body; 

  Nomination.findById(nominationId, (err, nomination) => {
    if (err || !nomination) return res.status(404).json({ error: 'Nomination not found.' });

    Nomination.updateAdminStatus(nominationId, status, (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update status.' });

      if (status === 'approved') {
        Student.findByStudentId(nomination.candidate_id, (err, student) => {
           if (err || !student) return;
           Candidate.create({
             election_id: nomination.election_id,
             name: student.name,
             manifesto: nomination.manifesto,
             language_proficiency: nomination.language_proficiency,
             category: nomination.category,
             position: nomination.position,
             photo: nomination.photo
           }, (err) => {
             if (err) console.error('Error creating candidate:', err);
           });
        });
      }
      res.json({ message: `Nomination ${status} successfully.` });
    });
  });
};
