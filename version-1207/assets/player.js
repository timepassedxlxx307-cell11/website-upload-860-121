(function () {
  var instances = [];

  var nativeReady = function (video) {
    return video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
  };

  var prepare = function (video, source) {
    if (video.getAttribute('data-ready') === '1') {
      return;
    }

    if (nativeReady(video)) {
      video.src = source;
      video.setAttribute('data-ready', '1');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      instances.push(hls);
      video.setAttribute('data-ready', '1');
      return;
    }

    video.src = source;
    video.setAttribute('data-ready', '1');
  };

  window.initMoviePlayer = function (options) {
    var video = document.querySelector(options.selector);
    var button = document.querySelector(options.buttonSelector);
    var source = options.source;

    if (!video || !source) {
      return;
    }

    var start = function () {
      prepare(video, source);
      if (button) {
        button.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    };

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
  };

  window.addEventListener('beforeunload', function () {
    instances.forEach(function (hls) {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
