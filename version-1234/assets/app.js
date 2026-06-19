(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var button = $("[data-menu-button]");
    var panel = $("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
      document.body.classList.toggle("menu-open", panel.classList.contains("open"));
    });
  }

  function initSearchForms() {
    $all("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (!query) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        var action = form.getAttribute("action") || "search.html";
        window.location.href = action + "?q=" + encodeURIComponent(query);
      });
    });
  }

  function initHero() {
    var hero = $("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = $all(".hero-slide", hero);
    var dots = $all(".hero-dot", hero);
    var prev = $("[data-hero-prev]", hero);
    var next = $("[data-hero-next]", hero);
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });

    show(0);
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }
  }

  function bindVideo(player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var source = player.getAttribute("data-stream");
    var started = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attachSource();
      player.classList.add("is-playing");
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          player.classList.remove("is-playing");
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!started || video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      player.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        player.classList.remove("is-playing");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function initPlayers() {
    $all(".player[data-stream]").forEach(bindVideo);
  }

  function searchMatches(item, query) {
    var haystack = [
      item.title,
      item.region,
      item.type,
      item.year,
      item.genre,
      item.tags,
      item.oneLine,
      item.summary
    ].join(" ").toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function renderResultCard(item) {
    return [
      "<article class="movie-card">",
      "  <a class="poster-link" href="" + escapeHtml(item.url) + "" aria-label="观看 " + escapeHtml(item.title) + "">",
      "    <img src="" + escapeHtml(item.cover) + "" alt="" + escapeHtml(item.title) + "" loading="lazy">",
      "    <span class="play-badge">播放</span>",
      "  </a>",
      "  <div class="movie-card-body">",
      "    <a class="movie-title" href="" + escapeHtml(item.url) + "">" + escapeHtml(item.title) + "</a>",
      "    <p class="movie-meta">" + escapeHtml(item.region) + " · " + escapeHtml(item.year) + " · " + escapeHtml(item.type) + "</p>",
      "    <p class="movie-desc">" + escapeHtml(item.oneLine) + "</p>",
      "  </div>",
      "</article>"
    ].join("
");
  }

  function initSearchPage() {
    var resultsBox = $("[data-search-results]");
    if (!resultsBox) {
      return;
    }
    var label = $("[data-search-label]");
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var data = window.SEARCH_INDEX || [];
    var results = query
      ? data.filter(function (item) {
          return searchMatches(item, query.toLowerCase());
        })
      : data.slice(0, 30);

    if (label) {
      label.textContent = query ? "搜索：" + query : "热门内容";
    }

    if (!results.length) {
      resultsBox.innerHTML = "<div class="empty-state">未找到相关影片</div>";
      return;
    }

    resultsBox.innerHTML = results.slice(0, 120).map(renderResultCard).join("
");
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initSearchForms();
    initHero();
    initPlayers();
    initSearchPage();
  });
})();
