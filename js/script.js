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
                const response = await fetch('http://127.0.0.1:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ student_id, password })
                });

                const data = await response.json();
                console.log('Response received:', data);

                if (response.ok) {
                    console.log('Login successful, saving user');
                    // Set global flags in localStorage for persistence
                    data.user.isLoggedIn = true;
                    data.user.isAdmin = (data.user.role === 'admin');
                    
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // Redirect based on role
                    if (data.user.isAdmin) {
                        console.log('Admin detected, redirecting to dashboard...');
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
    const segments = currentPath.split('/');
    const currentPage = segments[segments.length - 1];
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        // Simple path matching
        if (currentPath.includes(linkPath)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Add some smooth animations for cards
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

    // Hero Tilt Effect
    const heroCard = document.querySelector('.hero-content');
    if (heroCard) {
        document.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
            heroCard.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });

        // Reset on mouse leave
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
