(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
      var index = 0;
      var show = function (next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-current", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-current", i === index);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      if (slides.length > 1) {
        setInterval(function () {
          show(index + 1);
        }, 5200);
      }
    }

    document.querySelectorAll(".movie-player").forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".player-play");
      if (!video) {
        return;
      }
      var source = video.querySelector("source");
      var url = source ? source.getAttribute("src") : video.getAttribute("src");
      if (url && url.indexOf(".m3u8") !== -1 && window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else if (url && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.setAttribute("src", url);
      }
      var start = function () {
        var played = video.play();
        if (played && typeof played.catch === "function") {
          played.catch(function () {});
        }
      };
      if (button) {
        button.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        box.classList.remove("is-playing");
      });
    });

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim().toLowerCase();
    var searchInputs = document.querySelectorAll('input[name="q"]');
    searchInputs.forEach(function (input) {
      if (query && !input.value) {
        input.value = query;
      }
    });
    var searchSection = document.querySelector(".search-section");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".search-results .movie-card"));
    var filter = function (value) {
      var term = (value || "").trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var keys = (card.getAttribute("data-keywords") || "").toLowerCase();
        var show = !term || keys.indexOf(term) !== -1;
        card.classList.toggle("is-hidden", !show);
        if (show) {
          visible += 1;
        }
      });
      if (searchSection) {
        searchSection.classList.toggle("no-results", visible === 0);
      }
    };
    if (cards.length) {
      filter(query);
      searchInputs.forEach(function (input) {
        input.addEventListener("input", function () {
          filter(input.value);
        });
      });
    }
  });
})();
