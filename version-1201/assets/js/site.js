(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var sliders = document.querySelectorAll('[data-hero-slider]');

  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    show(0);

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  var panels = document.querySelectorAll('[data-filter-panel]');

  panels.forEach(function (panel) {
    var scopeSelector = panel.getAttribute('data-filter-panel');
    var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]')) : [];
    var empty = scope ? scope.querySelector('[data-empty-state]') : null;
    var queryInput = panel.querySelector('[data-filter-query]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var genreSelect = panel.querySelector('[data-filter-genre]');

    function clean(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var query = clean(queryInput && queryInput.value);
      var region = clean(regionSelect && regionSelect.value);
      var year = clean(yearSelect && yearSelect.value);
      var genre = clean(genreSelect && genreSelect.value);
      var shown = 0;

      cards.forEach(function (card) {
        var text = clean(card.getAttribute('data-search-text'));
        var cardRegion = clean(card.getAttribute('data-region'));
        var cardYear = clean(card.getAttribute('data-year'));
        var cardGenre = clean(card.getAttribute('data-genre'));
        var visible = true;

        if (query && text.indexOf(query) === -1) {
          visible = false;
        }
        if (region && cardRegion.indexOf(region) === -1) {
          visible = false;
        }
        if (year && cardYear !== year) {
          visible = false;
        }
        if (genre && cardGenre.indexOf(genre) === -1) {
          visible = false;
        }

        card.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    [queryInput, regionSelect, yearSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });
})();
