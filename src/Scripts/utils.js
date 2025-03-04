document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...

    // Add menu toggle functionality
    const menuToggle = document.getElementById('menuToggle');
    const sidenav = document.querySelector('.sidenav');

    menuToggle.addEventListener('click', () => {
        sidenav.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidenav.contains(e.target) && !menuToggle.contains(e.target) && sidenav.classList.contains('active')) {
            sidenav.classList.remove('active');
        }
    });
});