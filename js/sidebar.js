/**
 * sidebar.js - Centralized Sidebar Management for UCSC Election Portal
 * 
 * This script dynamically generates the sidebar for all pages.
 * To use: 
 * 1. Add <aside class="sidebar"></aside> to your HTML.
 * 2. Include this script: <script src="../js/sidebar.js"></script>
 */

document.addEventListener('DOMContentLoaded', () => {
    const sidebarElement = document.querySelector('.sidebar');
    if (!sidebarElement) return;

    // Get current user data
    const userStr = localStorage.getItem('user');
    let user = null;
    try {
        if (userStr && userStr !== "undefined") {
            user = JSON.parse(userStr);
        }
    } catch (e) {
        console.error("Error parsing user for sidebar", e);
    }

    // Get current page for active state
    const path = window.location.pathname;
    const currentPage = path.split('/').pop() || 'index.html';

    const isAdmin = user && user.role === 'admin';
    const isStudent = user && (user.role === 'student' || user.role === 'user');

    // Define navigation items
    // icon: FontAwesome class, label: text, href: link, adminOnly: boolean, studentOnly: boolean
    const navItems = [
        { icon: 'fas fa-th-large', label: 'Home', href: isAdmin ? 'admin-home.html' : 'home.html', adminOnly: false, studentOnly: false },
        { icon: 'fas fa-tasks', label: 'Elections', href: 'admin-elections-list.html', adminOnly: true, studentOnly: false },
        { icon: 'fas fa-users-cog', label: 'Manage Students', href: 'admin-students.html', adminOnly: true, studentOnly: false },
        { icon: 'fas fa-user-plus', label: 'Nominations', href: 'nominate.html', adminOnly: false, studentOnly: true },
        { icon: 'fas fa-users', label: 'Candidates', href: 'candidates.html', adminOnly: false, studentOnly: true },
        { icon: 'fas fa-chart-bar', label: 'Results', href: 'results.html', adminOnly: false, studentOnly: false }
    ];

    // Generate Sidebar HTML
    let sidebarHTML = `
        <div class="sidebar-header">
            <div class="logo-box">
                <img src="../assets/images/UCSC_logo.png" alt="UCSC Logo">
            </div>
            <span>UCSC Portal</span>
        </div>

        <nav class="sidebar-nav">
    `;

    navItems.forEach(item => {
        // Skip admin-only items for non-admin users
        if (item.adminOnly && !isAdmin) return;
        
        // Skip student-only items for admin users
        if (item.studentOnly && isAdmin) return;

        const isActive = currentPage === item.href || (item.label === 'Elections' && currentPage === 'admin-election.html');
        sidebarHTML += `
            <a href="${item.href}" class="nav-link ${isActive ? 'active' : ''}">
                <i class="${item.icon}"></i>
                <span>${item.label}</span>
            </a>
        `;
    });

    sidebarHTML += `
        </nav>

        <div class="sidebar-footer">
            <a href="#" id="logout-btn" class="nav-link logout">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </a>
        </div>
    `;

    // Inject into the DOM
    sidebarElement.innerHTML = sidebarHTML;

    // Re-attach logout event listener since we just replaced the element
    const logoutBtn = sidebarElement.querySelector('#logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            // Check if we are in /pages/ or root
            const isRoot = !window.location.pathname.includes('/pages/');
            window.location.href = isRoot ? 'pages/login.html' : 'login.html';
        });
    }
});
