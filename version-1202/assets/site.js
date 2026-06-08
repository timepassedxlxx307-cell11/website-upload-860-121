(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    function initImages() {
        document.querySelectorAll('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('is-missing');
            });
        });
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
            document.body.classList.toggle('menu-open', nav.classList.contains('open'));
        });
    }

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;
        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }
        function start() {
            stop();
            timer = setInterval(function () {
                show(index + 1);
            }, 5600);
        }
        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters() {
        var scopes = document.querySelectorAll('[data-filter-scope]');
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var year = scope.querySelector('[data-year-filter]');
            var typeButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-type-value]'));
            var empty = scope.querySelector('[data-filter-empty]');
            var cardContainer = scope.nextElementSibling;
            while (cardContainer && !cardContainer.querySelector('.filterable-card')) {
                cardContainer = cardContainer.nextElementSibling;
            }
            if (!cardContainer) {
                return;
            }
            var cards = Array.prototype.slice.call(cardContainer.querySelectorAll('.filterable-card'));
            var currentType = '';
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (input && query) {
                input.value = query;
            }
            function apply() {
                var text = normalize(input ? input.value : '');
                var selectedYear = year ? year.value : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.textContent
                    ].join(' '));
                    var matchText = !text || haystack.indexOf(text) !== -1;
                    var matchYear = !selectedYear || card.dataset.year === selectedYear;
                    var matchType = !currentType || normalize(card.dataset.type).indexOf(normalize(currentType)) !== -1;
                    var show = matchText && matchYear && matchType;
                    card.style.display = show ? '' : 'none';
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            if (year) {
                year.addEventListener('change', apply);
            }
            typeButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    currentType = button.dataset.typeValue || '';
                    typeButtons.forEach(function (item) {
                        item.classList.toggle('active', item === button);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    function initPlayers() {
        document.querySelectorAll('[data-video-player]').forEach(function (player) {
            var video = player.querySelector('[data-player-video]');
            var trigger = player.querySelector('[data-play-trigger]');
            if (!video) {
                return;
            }
            var url = video.dataset.video || '';
            var loaded = false;
            var hls = null;
            function attach() {
                if (loaded || !url) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else {
                    video.src = url;
                }
                loaded = true;
            }
            function play() {
                attach();
                video.controls = true;
                if (trigger) {
                    trigger.classList.add('is-hidden');
                }
                var action = video.play();
                if (action && typeof action.catch === 'function') {
                    action.catch(function () {});
                }
            }
            if (trigger) {
                trigger.addEventListener('click', play);
            }
            player.addEventListener('click', function (event) {
                if (event.target === video && video.controls) {
                    return;
                }
                if (event.target.closest('[data-play-trigger]')) {
                    return;
                }
                play();
            });
            video.addEventListener('play', function () {
                if (trigger) {
                    trigger.classList.add('is-hidden');
                }
            });
            window.addEventListener('pagehide', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initImages();
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
