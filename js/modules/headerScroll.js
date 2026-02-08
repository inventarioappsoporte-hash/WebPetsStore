/**
 * Header Scroll Effect
 * El header es transparente al inicio y se vuelve sólido al hacer scroll
 * Updated: 2026-02-08
 */
(function() {
  'use strict';

  function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    // Verificar scroll inicial
    if (window.pageYOffset > 50) {
      header.classList.add('scrolled');
    }

    // Listener de scroll con throttle para mejor performance
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.pageYOffset > 50) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    });

    console.log('📜 Header scroll effect initialized');
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderScroll);
  } else {
    initHeaderScroll();
  }
})();
