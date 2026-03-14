document.addEventListener('DOMContentLoaded', () => {
    // Check authentication on load
    checkAuth();

    // Handle Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const studentIdInput = loginForm.querySelector('input[type="text"]');
            const passwordInput = loginForm.querySelector('input[type="password"]');
            
            const student_id = studentIdInput.value;
            const password = passwordInput.value;

            try {
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ student_id, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // Redirect based on role
                    if (data.user.role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                } else {
                    alert(data.error || 'Login failed');
                }
            } catch (err) {
                alert('Connection error. Is the backend running at http://localhost:3000?');
            }
        });
    }

    // Navigation logic
    const currentPath = window.location.pathname;
    const segments = currentPath.split('/');
    const currentPage = segments[segments.length - 1];
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        const linkSegments = linkPath.split('/');
        const linkPage = linkSegments[linkSegments.length - 1];

        if (currentPage === linkPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Logout logic
    const logoutBtn = document.querySelector('#logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }

    // Dashboard specific logic
    if (window.location.pathname.includes('dashboard.html')) {
        loadDashboardStats();
    }
});

function checkAuth() {
    let user = null;
    try {
        const storedUser = localStorage.getItem('user');
        // Safeguard against null, "undefined" string, or invalid JSON
        if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
            user = JSON.parse(storedUser);
        }
    } catch (e) {
        console.error("Error parsing user from localStorage", e);
        localStorage.removeItem('user'); // Clear corrupted data
    }

    const path = window.location.pathname;

    // Protect admin dashboard
    if (path.includes('admin-dashboard.html')) {
        if (!user || user.role !== 'admin') {
            console.warn('Unauthorized admin access attempt');
            window.location.href = 'login.html';
            return;
        }
    }

    // Protect other private pages
    const privatePages = ['dashboard.html', 'vote.html', 'results.html', 'admin-dashboard.html'];
    const isPrivate = privatePages.some(page => path.includes(page));

    if (isPrivate && !user) {
        window.location.href = 'login.html';
        return;
    }

    // Dynamic UI: Show/Hide Admin Link
    updateUI(user);
}

function updateUI(user) {
    const adminLinks = document.querySelectorAll('.admin-only');
    adminLinks.forEach(link => {
        if (user && user.role === 'admin') {
            link.style.display = 'flex';
        } else {
            link.style.display = 'none';
        }
    });

    // Display user name if element exists
    const userNameDisplay = document.querySelector('#user-name');
    if (userNameDisplay && user) {
        userNameDisplay.textContent = user.name;
    }
}

async function loadDashboardStats() {
    try {
        // Fetch candidates count
        const candRes = await fetch('http://localhost:3000/api/candidates', {
            credentials: 'include'
        });
        if (candRes.ok) {
            const candidates = await candRes.json();
            const candidateCount = candidates.length;
            const statCards = document.querySelectorAll('.stat-card');
            statCards.forEach(card => {
                const label = card.querySelector('.stat-label');
                if (label && label.textContent === 'Total Candidates') {
                    const value = card.querySelector('.stat-value');
                    if (value) value.textContent = candidateCount;
                }
            });
        }

        // Fetch election status
        const settingsRes = await fetch('http://localhost:3000/api/admin/settings', {
            credentials: 'include'
        });
        if (settingsRes.ok) {
            const settings = await settingsRes.json();
            const votingOpen = settings.voting_open === '1';
            let statusText = 'Closed';
            let statusColor = '#ef4444'; // Red

            if (votingOpen) {
                if (settings.voting_deadline) {
                    const deadline = new Date(settings.voting_deadline).getTime();
                    if (deadline > Date.now()) {
                        statusText = 'Active';
                        statusColor = '#10b981'; // Green
                    } else {
                        statusText = 'Expired';
                        statusColor = '#f59e0b'; // Amber
                    }
                } else {
                    statusText = 'Active';
                    statusColor = '#10b981';
                }
            }

            const statCards = document.querySelectorAll('.stat-card');
            statCards.forEach(card => {
                const label = card.querySelector('.stat-label');
                if (label && label.textContent === 'Election Status') {
                    const value = card.querySelector('.stat-value');
                    if (value) {
                        value.textContent = statusText;
                        value.style.color = statusColor;
                    }
                    const icon = card.querySelector('.stat-icon');
                    if (icon) {
                        icon.style.color = statusColor;
                        icon.style.background = `${statusColor}1a`; // 10% opacity
                    }
                }
            });
        }
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
    }
}
