// Carrusel
class Carousel {
  constructor() {
    this.init();
  }

  init() {
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
      this.setupCarousel(carousel);
    });
  }

  setupCarousel(carousel) {
    // Crear controles
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel__btn carousel__btn--prev';
    prevBtn.innerHTML = '❮';
    prevBtn.onclick = () => this.scroll(carousel, -CONSTANTS.CAROUSEL_SCROLL_AMOUNT);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel__btn carousel__btn--next';
    nextBtn.innerHTML = '❯';
    nextBtn.onclick = () => this.scroll(carousel, CONSTANTS.CAROUSEL_SCROLL_AMOUNT);

    carousel.parentElement.style.position = 'relative';
    carousel.parentElement.appendChild(prevBtn);
    carousel.parentElement.appendChild(nextBtn);

    // Actualizar estado de botones
    this.updateButtonStates(carousel, prevBtn, nextBtn);
    carousel.addEventListener('scroll', () => this.updateButtonStates(carousel, prevBtn, nextBtn));
  }

  scroll(carousel, amount) {
    carousel.scrollBy({
      left: amount,
      behavior: 'smooth'
    });
  }

  updateButtonStates(carousel, prevBtn, nextBtn) {
    prevBtn.disabled = carousel.scrollLeft === 0;
    nextBtn.disabled = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10;
  }
}

// Inicializar carruseles cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new Carousel());
} else {
  new Carousel();
}
