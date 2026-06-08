(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    const restart = function () {
      window.clearInterval(timer);
      start();
    };

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    start();
  }

  const urlQuery = new URLSearchParams(window.location.search).get('q');
  const filterInput = document.querySelector('[data-filter-input]');
  const filterType = document.querySelector('[data-filter-type]');
  const filterYear = document.querySelector('[data-filter-year]');
  const filterList = document.querySelector('[data-filter-list]');

  if (filterInput && urlQuery) {
    filterInput.value = urlQuery;
  }

  const filterCards = function () {
    if (!filterList) {
      return;
    }

    const keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    const type = filterType ? filterType.value : '';
    const year = filterYear ? filterYear.value : '';
    const cards = filterList.querySelectorAll('.movie-card');

    cards.forEach(function (card) {
      const text = [card.dataset.title, card.dataset.keywords].join(' ').toLowerCase();
      const typeMatch = !type || card.dataset.type === type;
      const yearMatch = !year || card.dataset.year === year;
      const keywordMatch = !keyword || text.indexOf(keyword) !== -1;
      card.style.display = typeMatch && yearMatch && keywordMatch ? '' : 'none';
    });
  };

  [filterInput, filterType, filterYear].forEach(function (node) {
    if (node) {
      node.addEventListener('input', filterCards);
      node.addEventListener('change', filterCards);
    }
  });

  filterCards();

  const beginPlayback = function (button) {
    const target = button.getAttribute('data-target');
    const stream = button.getAttribute('data-stream');
    const video = target ? document.getElementById(target) : null;

    if (!video || !stream) {
      return;
    }

    button.classList.add('is-hidden');
    video.controls = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== stream) {
        video.src = stream;
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsPlayer) {
        const hls = new window.Hls({ enableWorker: true });
        video._hlsPlayer = hls;
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.play().catch(function () {});
      }
      return;
    }

    if (video.src !== stream) {
      video.src = stream;
    }
    video.play().catch(function () {});
  };

  document.addEventListener('click', function (event) {
    const button = event.target.closest('[data-stream][data-target]');
    if (button) {
      beginPlayback(button);
    }
  });
})();
