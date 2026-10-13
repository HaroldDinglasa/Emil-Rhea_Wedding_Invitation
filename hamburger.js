const hamburger = document.querySelector('#menuToggle');
const menu = document.querySelector('#siteMenu');

if (hamburger && menu) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!open));
    menu.classList.toggle('hidden', open);
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      menu.classList.add('hidden');
    });
  });
}