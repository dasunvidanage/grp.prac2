document.addEventListener('DOMContentLoaded', () => {
    // Check authentication on load
    checkAuth();

    // Handle Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('Login form found, attaching listener');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Login form submitted');
            
            const studentIdInput = loginForm.querySelector('input[type="text"]');
            const passwordInput = loginForm.querySelector('input[type="password"]');
            
            const student_id = studentIdInput.value;
            const password = passwordInput.value;

            console.log('Attempting login for:', student_id);

            try {
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ student_id, password })
                });

                const data = await response.json();
                console.log('Response received:', data);

                if (response.ok) {
                    console.log('Login successful, saving user');
                    // Save user info to localStorage
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
                console.error('Login error:', err);
                alert('Connection error. Is the backend running at http://127.0.0.1:3000?');
            }
        });
    }

    // Navigation logic
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

    // Logout logic
    const logoutBtn = document.querySelector('#logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
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
