(function () {
  var ready = function (callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  };

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');

    if (menuButton && menu) {
      menuButton.addEventListener('click', function () {
        menu.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var activate = function (index) {
        current = index;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      };

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          activate((current + 1) % slides.length);
        }, 5600);
      }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]')).forEach(function (form) {
      var scope = form.parentElement || document;
      var input = form.querySelector('input[name="keyword"]');
      var region = form.querySelector('select[name="region"]');
      var year = form.querySelector('select[name="year"]');
      var type = form.querySelector('select[name="type"]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var empty = scope.querySelector('[data-filter-empty]');

      var normalize = function (value) {
        return String(value || '').trim().toLowerCase();
      };

      var apply = function () {
        var keyword = normalize(input && input.value);
        var regionValue = normalize(region && region.value);
        var yearValue = normalize(year && year.value);
        var typeValue = normalize(type && type.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type')
          ].join(' '));
          var ok = true;

          if (keyword && text.indexOf(keyword) === -1) {
            ok = false;
          }
          if (regionValue && normalize(card.getAttribute('data-region')).indexOf(regionValue) === -1) {
            ok = false;
          }
          if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
            ok = false;
          }
          if (typeValue && normalize(card.getAttribute('data-type')).indexOf(typeValue) === -1) {
            ok = false;
          }

          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      };

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
      Array.prototype.slice.call(form.querySelectorAll('input, select')).forEach(function (field) {
        field.addEventListener('input', apply);
        field.addEventListener('change', apply);
      });
    });
  });
})();
