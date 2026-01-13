// Reproductor de videos
class VideoPlayer {
  constructor() {
    this.init();
  }

  init() {
    this.setupVideoOverlays();
  }

  setupVideoOverlays() {
    document.addEventListener('click', (e) => {
      const playBtn = e.target.closest('.card__play-btn');
      if (!playBtn) return;

      const card = playBtn.closest('.card');
      const productId = card.dataset.productId;
      
      this.openVideoModal(productId);
    });
  }

  async openVideoModal(productId) {
    const product = await dataLoader.getProductById(productId);
    if (!product || !product.video) return;

    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
      <div class="video-modal__overlay" onclick="this.parentElement.remove()"></div>
      <div class="video-modal__content">
        <button class="video-modal__close" onclick="this.parentElement.parentElement.remove()">✕</button>
        <video 
          class="video-modal__video" 
          controls 
          autoplay 
          muted
          src="${product.video.url}">
        </video>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        document.body.style.overflow = '';
      }
    });
  }
}

// Inicializar reproductor de videos
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new VideoPlayer());
} else {
  new VideoPlayer();
}
