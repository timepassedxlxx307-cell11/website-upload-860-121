(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function resetHero() {
      window.clearInterval(timer);
      startHero();
    }

    hero.addEventListener('click', function (event) {
      var target = event.target.closest('[data-hero-action]');

      if (!target) {
        return;
      }

      if (target.getAttribute('data-hero-action') === 'next') {
        showSlide(current + 1);
      } else if (target.getAttribute('data-hero-action') === 'prev') {
        showSlide(current - 1);
      } else if (target.hasAttribute('data-hero-dot')) {
        showSlide(Number(target.getAttribute('data-hero-dot')) || 0);
      }

      resetHero();
    });

    showSlide(0);
    startHero();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterRegion = document.querySelector('[data-filter-region]');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-title]'));

  function applyFilters() {
    var q = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = filterYear ? filterYear.value : '';
    var region = filterRegion ? filterRegion.value : '';

    filterCards.forEach(function (card) {
      var text = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.genre].join(' ').toLowerCase();
      var yearOk = !year || card.dataset.year === year;
      var regionOk = !region || card.dataset.region === region;
      var queryOk = !q || text.indexOf(q) !== -1;

      card.style.display = yearOk && regionOk && queryOk ? '' : 'none';
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);
  }

  if (filterYear) {
    filterYear.addEventListener('change', applyFilters);
  }

  if (filterRegion) {
    filterRegion.addEventListener('change', applyFilters);
  }

  function startVideo(shell) {
    var video = shell.querySelector('video');
    var src = shell.getAttribute('data-src');

    if (!video || !src) {
      return;
    }

    if (video.getAttribute('data-ready') !== '1') {
      if (window.Hls && window.Hls.isSupported() && src.indexOf('.m3u8') !== -1) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        shell.hls = hls;
      } else {
        video.src = src;
      }

      video.setAttribute('data-ready', '1');
    }

    shell.classList.add('is-playing');
    video.controls = true;
    video.play().catch(function () {});
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
    var cover = shell.querySelector('.player-cover');
    var button = shell.querySelector('.play-button');

    shell.addEventListener('click', function (event) {
      if (event.target === cover || event.target === button || event.target.closest('.play-button')) {
        startVideo(shell);
      }
    });
  });

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  function renderSearch() {
    if (!searchResults || !window.MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = searchInput && searchInput.value ? searchInput.value.trim() : params.get('q') || '';
    var lower = query.toLowerCase();

    if (searchInput && !searchInput.value) {
      searchInput.value = query;
    }

    if (!lower) {
      searchResults.innerHTML = '<div class="empty-state">请输入关键词开始搜索</div>';
      return;
    }

    var matches = window.MOVIES.filter(function (movie) {
      return movie.searchText.indexOf(lower) !== -1;
    }).slice(0, 80);

    if (!matches.length) {
      searchResults.innerHTML = '<div class="empty-state">没有找到相关影片</div>';
      return;
    }

    searchResults.innerHTML = '<div class="movie-grid">' + matches.map(function (movie) {
      return '<article class="movie-card compact">' +
        '<a class="poster-link" href="detail/' + movie.id + '.html">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">' +
        '<span class="poster-badge">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<h3><a href="detail/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</p>' +
        '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>' +
        '</div>' +
        '</article>';
    }).join('') + '</div>';
  }

  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = searchInput.value.trim();
      var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState(null, '', url);
      renderSearch();
    });
  }

  renderSearch();
})();
