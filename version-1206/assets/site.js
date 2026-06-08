(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector('.menu-toggle');
        var mobileNav = document.querySelector('.mobile-nav');
        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                var isOpen = mobileNav.classList.toggle('open');
                toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
        }

        var hero = document.querySelector('[data-hero-carousel]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('active', i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === current);
                });
            }

            function restart() {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    show(current + 1);
                }, 5600);
            }

            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    restart();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    restart();
                });
            });
            restart();
        }

        var filterInput = document.querySelector('[data-filter-input]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));
        var emptyState = document.querySelector('[data-empty-state]');
        if (filterInput && cards.length) {
            var queryKey = filterInput.getAttribute('data-url-query');
            if (queryKey) {
                var params = new URLSearchParams(window.location.search);
                var initial = params.get(queryKey);
                if (initial) {
                    filterInput.value = initial;
                }
            }

            function applyFilter() {
                var query = filterInput.value.trim().toLowerCase();
                var visibleCount = 0;
                cards.forEach(function (card) {
                    var keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
                    var visible = !query || keywords.indexOf(query) !== -1;
                    card.hidden = !visible;
                    if (visible) {
                        visibleCount += 1;
                    }
                });
                if (emptyState) {
                    emptyState.classList.toggle('show', visibleCount === 0);
                }
            }

            filterInput.addEventListener('input', applyFilter);
            applyFilter();
        }
    });
})();

function initMoviePlayer(streamUrl) {
    var video = document.querySelector('.movie-video');
    var overlay = document.querySelector('.play-overlay');
    var hlsPlayer = null;

    if (!video || !streamUrl) {
        return;
    }

    function bindStream() {
        if (video.getAttribute('data-ready') === '1') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsPlayer = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsPlayer.loadSource(streamUrl);
            hlsPlayer.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        video.setAttribute('data-ready', '1');
    }

    function startPlayback() {
        bindStream();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsPlayer) {
            hlsPlayer.destroy();
        }
    });
}
