(function () {
  var players = document.querySelectorAll('[data-player]');

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var trigger = box.querySelector('[data-play-trigger]');
    var stream = box.getAttribute('data-stream');
    var loaded = false;
    var hls = null;

    function bindStream() {
      if (loaded) {
        return Promise.resolve();
      }

      loaded = true;
      box.classList.add('is-loading');

      if (window.Hls && window.Hls.isSupported()) {
        return new Promise(function (resolve) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            box.classList.remove('is-loading');
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              box.classList.remove('is-loading');
            }
          });
        });
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        box.classList.remove('is-loading');
        return Promise.resolve();
      }

      video.src = stream;
      box.classList.remove('is-loading');
      return Promise.resolve();
    }

    function start() {
      box.classList.add('is-playing');
      video.controls = true;
      bindStream().then(function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            box.classList.remove('is-playing');
          });
        }
      });
    }

    if (trigger) {
      trigger.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
