(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      button.textContent = nav.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', slider);
    var next = slider.querySelector('[data-hero-next]');
    var prev = slider.querySelector('[data-hero-prev]');
    var dotsWrap = slider.querySelector('[data-hero-dots]');
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      selectAll('.hero-dot', dotsWrap).forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (dotsWrap) {
      slides.forEach(function (_, index) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hero-dot' + (index === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', '切换推荐影片');
        dot.addEventListener('click', function () {
          show(index);
          restart();
        });
        dotsWrap.appendChild(dot);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    restart();
  }

  function setupFilters() {
    selectAll('[data-filter-scope]').forEach(function (panel) {
      var section = panel.closest('.section-block') || document;
      var input = panel.querySelector('.filter-input');
      var yearSelect = panel.querySelector('.filter-year');
      var typeSelect = panel.querySelector('.filter-type');
      var cards = selectAll('.filter-card', section);
      var empty = section.querySelector('[data-filter-empty]');

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var matched = true;
          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          if (type && cardType !== type) {
            matched = false;
          }
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function setupSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page || !window.siteSearchData) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim();
    var title = page.querySelector('[data-search-title]');
    var results = page.querySelector('[data-search-results]');
    var input = document.querySelector('[data-search-page-input]');
    if (input) {
      input.value = keyword;
    }
    if (!keyword) {
      return;
    }

    var terms = keyword.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = window.siteSearchData.filter(function (movie) {
      var text = (movie.search || '').toLowerCase();
      return terms.every(function (term) {
        return text.indexOf(term) !== -1;
      });
    }).slice(0, 120);

    if (title) {
      title.textContent = '搜索：' + keyword;
    }
    if (!results) {
      return;
    }
    if (!matched.length) {
      results.innerHTML = '<div class="empty-state is-visible">没有找到匹配的影片</div>';
      return;
    }
    results.innerHTML = matched.map(function (movie) {
      var tags = (movie.tags || []).slice(0, 3).join(' ');
      return [
        '<article class="movie-card">',
        '  <a class="movie-card-link" href="' + escapeAttr(movie.href) + '">',
        '    <span class="card-cover">',
        '      <img src="./' + escapeAttr(movie.image) + '" alt="' + escapeAttr(movie.title) + '" loading="lazy">',
        '      <span class="play-badge">▶</span>',
        '      <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
        '    </span>',
        '    <span class="card-body">',
        '      <strong>' + escapeHtml(movie.title) + '</strong>',
        '      <span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>',
        '      <span class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></span>',
        '      <span class="card-tags">' + escapeHtml(tags) + '</span>',
        '    </span>',
        '  </a>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  function setupPlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var playButton = player.querySelector('[data-player-play]');
      var toggleButton = player.querySelector('[data-player-toggle]');
      var muteButton = player.querySelector('[data-player-mute]');
      var fullscreenButton = player.querySelector('[data-player-fullscreen]');
      var errorBox = player.querySelector('[data-player-error]');
      var stream = video ? video.getAttribute('data-stream') : '';
      var hlsInstance = null;
      var loaded = false;

      if (!video || !stream) {
        return;
      }

      function showError(message) {
        if (errorBox) {
          errorBox.textContent = message;
          errorBox.classList.add('is-visible');
        }
      }

      function load() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
              return;
            }
            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
              return;
            }
            showError('视频暂时无法播放');
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else {
          showError('视频暂时无法播放');
        }
      }

      function start() {
        load();
        player.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      function toggle() {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      }

      if (playButton) {
        playButton.addEventListener('click', start);
      }
      if (toggleButton) {
        toggleButton.addEventListener('click', toggle);
      }
      video.addEventListener('click', toggle);
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
        if (toggleButton) {
          toggleButton.textContent = '暂停';
        }
      });
      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
        if (toggleButton) {
          toggleButton.textContent = '播放';
        }
      });
      if (muteButton) {
        muteButton.addEventListener('click', function () {
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? '静音' : '音量';
        });
      }
      if (fullscreenButton) {
        fullscreenButton.addEventListener('click', function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (player.requestFullscreen) {
            player.requestFullscreen();
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
