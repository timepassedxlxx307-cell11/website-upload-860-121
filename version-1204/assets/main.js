(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (window.__hlsPromise) {
      return window.__hlsPromise;
    }
    window.__hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return window.__hlsPromise;
  }

  function startVideo(frame) {
    var video = frame.querySelector("video");
    var stream = video.getAttribute("data-stream");
    if (!video || !stream) {
      return;
    }
    frame.classList.add("playing");
    video.controls = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.src) {
        video.src = stream;
      }
      video.play().catch(function () {});
      return;
    }
    loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        if (!video.__hls) {
          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video.__hls = hls;
        }
      } else if (!video.src) {
        video.src = stream;
      }
      video.play().catch(function () {});
    }).catch(function () {
      if (!video.src) {
        video.src = stream;
      }
      video.play().catch(function () {});
    });
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var active = 0;
      var show = function (index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === active);
          slide.setAttribute("aria-hidden", i === active ? "false" : "true");
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === active);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          show(active + 1);
        }, 5600);
      }
      show(0);
    }

    document.querySelectorAll("[data-player]").forEach(function (frame) {
      var overlay = frame.querySelector(".player-overlay");
      var video = frame.querySelector("video");
      if (overlay) {
        overlay.addEventListener("click", function () {
          startVideo(frame);
        });
      }
      if (video) {
        video.addEventListener("play", function () {
          startVideo(frame);
        }, { once: true });
      }
    });

    document.querySelectorAll("[data-local-filter]").forEach(function (input) {
      var target = document.querySelector(input.getAttribute("data-local-filter"));
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll("[data-title]"));
      var empty = document.querySelector("[data-empty-state]");
      var apply = function () {
        var query = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-text") || "").toLowerCase();
          var ok = !query || text.indexOf(query) !== -1;
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      };
      input.addEventListener("input", apply);
      apply();
    });

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      var searchInput = document.querySelector("[data-search-input]");
      if (searchInput) {
        searchInput.value = q;
        searchInput.dispatchEvent(new Event("input"));
      }
    }
  });
})();
