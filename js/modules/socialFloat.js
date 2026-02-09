/**
 * 📱 Módulo SocialFloat - Botones flotantes de redes sociales
 * Muestra botones de Instagram y TikTok en la esquina inferior derecha
 */

class SocialFloat {
  constructor(config = {}) {
    this.config = {
      instagramUser: config.instagramUser || 'petsstore2026',
      tiktokUser: config.tiktokUser || 'pets.store795',
      showInstagram: config.showInstagram !== false,
      showTiktok: config.showTiktok !== false
    };
  }

  /**
   * Inicializar y renderizar los botones
   */
  init() {
    this.render();
    this.attachEvents();
    console.log('📱 SocialFloat initialized');
  }

  /**
   * Renderizar los botones flotantes
   */
  render() {
    if (document.getElementById('social-float-container')) return;

    const container = document.createElement('div');
    container.id = 'social-float-container';
    container.className = 'social-float-container';

    let buttonsHtml = '';

    // Botón de Instagram
    if (this.config.showInstagram) {
      buttonsHtml += `
        <a href="#" 
           id="social-float-instagram"
           class="social-float social-float--instagram"
           title="Seguinos en Instagram @${this.config.instagramUser}">
          <svg class="social-float__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
      `;
    }

    // Botón de TikTok
    if (this.config.showTiktok) {
      buttonsHtml += `
        <a href="https://www.tiktok.com/@${this.config.tiktokUser}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="social-float social-float--tiktok"
           title="Seguinos en TikTok @${this.config.tiktokUser}">
          <svg class="social-float__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        </a>
      `;
    }

    container.innerHTML = buttonsHtml;
    document.body.appendChild(container);
  }

  /**
   * Adjuntar eventos
   */
  attachEvents() {
    const igBtn = document.getElementById('social-float-instagram');
    if (igBtn) {
      igBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openInstagram();
      });
    }
  }

  /**
   * Abrir Instagram - intenta deep link primero, luego web
   */
  openInstagram() {
    const username = this.config.instagramUser;
    const webUrl = `https://www.instagram.com/${username}/`;
    const deepLink = `instagram://user?username=${username}`;
    
    // Detectar si es móvil
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // En móvil: intentar deep link, si falla abrir web
      const start = Date.now();
      
      // Intentar abrir deep link
      window.location.href = deepLink;
      
      // Si después de 1.5s no se abrió la app, abrir en navegador
      setTimeout(() => {
        if (Date.now() - start < 2000) {
          window.open(webUrl, '_blank');
        }
      }, 1500);
    } else {
      // En desktop: abrir web directamente
      window.open(webUrl, '_blank');
    }
  }

  /**
   * Mostrar/ocultar botones
   */
  toggle(show) {
    const container = document.getElementById('social-float-container');
    if (container) {
      container.style.display = show ? 'flex' : 'none';
    }
  }
}

// Instancia global
const socialFloat = new SocialFloat({
  instagramUser: 'petsstore2026',
  tiktokUser: 'pets.store795'
});

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => socialFloat.init());
} else {
  socialFloat.init();
}
