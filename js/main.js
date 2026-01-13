/* --------------------------------------------------------------
   COMMON SITE LOGIC (header/footer loader, nav highlight)
   -------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // 1️⃣  Load header
    fetch('includes/header.html')
        .then(r => r.text())
        .then(html => {
            document.body.insertAdjacentHTML('afterbegin', html);
            highlightNav();               // after header is in the DOM
        })
        .catch(err => console.error('Header load error:', err));

    // 2️⃣  Load footer (insert just before </body>)
    fetch('includes/footer.html')
        .then(r => r.text())
        .then(html => {
            document.body.insertAdjacentHTML('beforeend', html);
        })
        .catch(err => console.error('Footer load error:', err));
});

/* --------------------------------------------------------------
   Highlight the navigation item that matches the current page
   -------------------------------------------------------------- */
function highlightNav() {
    const current = location.pathname.split('/').pop(); // e.g. "research.html"
    const links = document.querySelectorAll('.site-nav a');

    links.forEach(link => {
        const target = link.getAttribute('data-page');
        if (target === current) {
            link.classList.add('active');
        }
    });
}