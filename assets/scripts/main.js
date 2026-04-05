const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");

if (header && navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const revealItems = document.querySelectorAll("[data-reveal]");

if (revealItems.length) {
  const revealImmediatelyVisibleItems = () => {
    const viewportHeight = window.innerHeight;

    revealItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const isAlreadyInView = rect.top < viewportHeight * 0.92 && rect.bottom > viewportHeight * 0.08;

      if (isAlreadyInView) {
        item.classList.add("is-visible");
      }
    });
  };

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.05,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealImmediatelyVisibleItems();
  revealItems.forEach((item) => revealObserver.observe(item));
}

const bannerSliders = document.querySelectorAll("[data-banner-slider]");

bannerSliders.forEach((slider) => {
  const slides = Array.from(slider.querySelectorAll(".reference-banner-slide"));
  const prevButton = slider.querySelector(".reference-control.prev");
  const nextButton = slider.querySelector(".reference-control.next");
  const currentLabel = slider.querySelector(".reference-pagination .current");
  const totalLabel = slider.querySelector(".reference-pagination .total");
  const captionTitle = slider.querySelector(".reference-caption-title");
  const captionSubtitle = slider.querySelector(".reference-caption-subtitle");

  if (!slides.length || !prevButton || !nextButton || !currentLabel || !totalLabel || !captionTitle || !captionSubtitle) {
    return;
  }

  const total = slides.length;
  let index = 0;
  let autoplayId;

  totalLabel.textContent = String(total).padStart(2, "0");

  const updateSlider = () => {
    slides.forEach((slide, slideIndex) => {
      slide.classList.remove("is-active", "is-prev", "is-next", "is-hidden-left", "is-hidden-right");

      const prevIndex = (index - 1 + total) % total;
      const nextIndex = (index + 1) % total;
      const hiddenLeftIndex = (index - 2 + total) % total;
      const hiddenRightIndex = (index + 2) % total;

      if (slideIndex === index) {
        slide.classList.add("is-active");
      } else if (slideIndex === prevIndex) {
        slide.classList.add("is-prev");
      } else if (slideIndex === nextIndex) {
        slide.classList.add("is-next");
      } else if (slideIndex === hiddenLeftIndex) {
        slide.classList.add("is-hidden-left");
      } else if (slideIndex === hiddenRightIndex) {
        slide.classList.add("is-hidden-right");
      }
    });

    const activeSlide = slides[index];
    captionTitle.textContent = activeSlide.dataset.title || "";
    captionSubtitle.textContent = activeSlide.dataset.subtitle || "";
    currentLabel.textContent = String(index + 1).padStart(2, "0");
  };

  const goTo = (nextIndex) => {
    index = (nextIndex + total) % total;
    updateSlider();
  };

  const startAutoplay = () => {
    clearInterval(autoplayId);
    autoplayId = setInterval(() => {
      goTo(index + 1);
    }, 4200);
  };

  prevButton.addEventListener("click", () => {
    goTo(index - 1);
    startAutoplay();
  });

  nextButton.addEventListener("click", () => {
    goTo(index + 1);
    startAutoplay();
  });

  slider.addEventListener("mouseenter", () => clearInterval(autoplayId));
  slider.addEventListener("mouseleave", startAutoplay);

  updateSlider();
  startAutoplay();
});

const expandGalleries = document.querySelectorAll("[data-expand-gallery]");

expandGalleries.forEach((gallery) => {
  const cards = Array.from(gallery.querySelectorAll(".expand-card"));

  if (!cards.length) {
    return;
  }

  const setActiveCard = (targetCard) => {
    cards.forEach((card) => {
      const isActive = card === targetCard;
      card.classList.toggle("is-active", isActive);
      card.setAttribute("aria-pressed", String(isActive));
    });
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => setActiveCard(card));
    card.addEventListener("focus", () => setActiveCard(card));
  });
});

const scrollCards = document.querySelectorAll("[data-scroll-card]");

if (scrollCards.length) {
  const initialRevealBoundary = window.innerHeight * 0.92;

  scrollCards.forEach((card) => {
    const rect = card.getBoundingClientRect();

    if (rect.top <= initialRevealBoundary) {
      card.classList.add("is-visible");
    } else {
      card.classList.add("scroll-card-pending");
    }
  });

  const scrollCardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          entry.target.classList.remove("scroll-card-pending");
          scrollCardObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  scrollCards.forEach((card) => {
    if (card.classList.contains("scroll-card-pending")) {
      scrollCardObserver.observe(card);
    }
  });
}

const enableCardDrift = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (scrollCards.length && enableCardDrift) {
  let driftTicking = false;

  const updateCardDrift = () => {
    const viewportHeight = window.innerHeight;

    scrollCards.forEach((item) => {
      const card = item.querySelector(".art-sequence-card");

      if (!card || !item.classList.contains("is-visible")) {
        return;
      }

      const rect = item.getBoundingClientRect();
      const centerOffset = viewportHeight / 2 - (rect.top + rect.height / 2);
      const normalized = Math.max(-1, Math.min(1, centerOffset / viewportHeight));
      const direction = item.classList.contains("align-left") ? 1 : -1;
      const driftX = normalized * 18 * direction;
      const driftY = normalized * 28;
      const tilt = normalized * 1.2 * direction;

      card.style.setProperty("--card-drift-x", `${driftX.toFixed(2)}px`);
      card.style.setProperty("--card-drift-y", `${driftY.toFixed(2)}px`);
      card.style.setProperty("--card-tilt", `${tilt.toFixed(2)}deg`);
    });

    driftTicking = false;
  };

  const requestCardDrift = () => {
    if (!driftTicking) {
      window.requestAnimationFrame(updateCardDrift);
      driftTicking = true;
    }
  };

  window.addEventListener("scroll", requestCardDrift, { passive: true });
  window.addEventListener("resize", requestCardDrift);
  requestCardDrift();
}
