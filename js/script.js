document.addEventListener('DOMContentLoaded', () => {
    // Highlight active nav link
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.includes(linkPath)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Add smooth animations for cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.5s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    });

    // --- Dynamic Data Management ---
    let electionData = {
        presidential: { labels: ['Amara Perera', 'Kasun Silva', 'Nimmi Fernando'], values: [342, 285, 223] },
        year1: { labels: ['Cand A', 'Cand B'], values: [120, 95] },
        secretary: { labels: ['Dinith', 'Sanduni', 'Ishara'], values: [150, 110, 73] },
        treasurer: { labels: ['Kavinda', 'Ruwanthi'], values: [185, 123] },
        pr: { labels: ['Malith', 'Shehani'], values: [210, 112] }
    };

    // Initialize Google Charts
    if (typeof google !== 'undefined') {
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(() => {
            drawAllCharts();
            // Start simulation of live updates every 5 seconds
            setInterval(simulateLiveUpdates, 5000);
        });
    }

    function simulateLiveUpdates() {
        // Randomly add 1-5 votes to a random candidate in each category
        Object.keys(electionData).forEach(category => {
            const index = Math.floor(Math.random() * electionData[category].values.length);
            const extraVotes = Math.floor(Math.random() * 5) + 1;
            electionData[category].values[index] += extraVotes;
        });
        
        drawAllCharts();
    }

    function drawAllCharts() {
        // Main Presidential Chart
        const presidentialDiv = document.getElementById('votesChart');
        if (presidentialDiv) {
            const data = google.visualization.arrayToDataTable([
                ['Candidate', 'Votes'],
                [electionData.presidential.labels[0], electionData.presidential.values[0]],
                [electionData.presidential.labels[1], electionData.presidential.values[1]],
                [electionData.presidential.labels[2], electionData.presidential.values[2]]
            ]);

            const options = {
                is3D: true,
                backgroundColor: 'transparent',
                chartArea: { width: '100%', height: '80%' },
                legend: { position: 'bottom', textStyle: { color: '#64748b', fontSize: 12 } },
                colors: ['#6366f1', '#64748b', '#10b981'],
                tooltip: { textStyle: { color: '#1e293b' } },
                animation: { duration: 1000, easing: 'out' }
            };

            const chart = new google.visualization.PieChart(presidentialDiv);
            chart.draw(data, options);
        }

        // Helper for secondary 3D Pie Charts
        const drawSecondary3DPie = (id, labels, values) => {
            const chartDiv = document.getElementById(id);
            if (!chartDiv) return;

            const dataArray = [['Candidate', 'Votes']];
            labels.forEach((label, i) => dataArray.push([label, values[i]]));
            
            const data = google.visualization.arrayToDataTable(dataArray);
            const options = {
                is3D: true,
                backgroundColor: 'transparent',
                chartArea: { width: '90%', height: '80%' },
                legend: { position: 'right', textStyle: { color: '#94a3b8', fontSize: 10 } },
                colors: ['#6366f1', '#64748b', '#10b981', '#f59e0b', '#ec4899'],
                tooltip: { textStyle: { color: '#1e293b' } },
                animation: { duration: 1000, easing: 'out' }
            };

            const chart = new google.visualization.PieChart(chartDiv);
            chart.draw(data, options);
        };

        drawSecondary3DPie('year1Chart', electionData.year1.labels, electionData.year1.values);
        drawSecondary3DPie('secretaryChart', electionData.secretary.labels, electionData.secretary.values);
        drawSecondary3DPie('treasurerChart', electionData.treasurer.labels, electionData.treasurer.values);
        drawSecondary3DPie('prChart', electionData.pr.labels, electionData.pr.values);
    }

    // Hero Tilt Effect
    const heroCard = document.querySelector('.hero-content');
    if (heroCard) {
        document.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
            heroCard.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });

        document.addEventListener('mouseleave', () => {
            heroCard.style.transform = `rotateY(0deg) rotateX(0deg)`;
        });
    }

    // Winner Celebration Logic
    if (document.querySelector('.winner-card') && typeof confetti === 'function') {
        confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: ['#6366f1', '#a5b4fc', '#f59e0b']
        });
        confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: ['#6366f1', '#a5b4fc', '#f59e0b']
        });

        document.querySelectorAll('.winner-card').forEach((card, i) => {
            setTimeout(() => {
                card.classList.add('winner-card-celebrate');
                const crown = card.querySelector('.crown-icon');
                if (crown) crown.classList.add('crown-animate');
            }, i * 200);
        });
    }
});
