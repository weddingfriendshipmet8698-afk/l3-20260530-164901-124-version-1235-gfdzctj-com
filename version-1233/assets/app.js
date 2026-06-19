document.addEventListener("DOMContentLoaded", function () {
  initMenu();
  initHero();
  initLocalFilters();
  initSearchResults();
});

function initMenu() {
  var button = document.querySelector(".menu-toggle");
  var panel = document.querySelector(".mobile-panel");
  if (!button || !panel) {
    return;
  }
  button.addEventListener("click", function () {
    panel.classList.toggle("is-open");
  });
}

function initHero() {
  var root = document.querySelector("[data-slider]");
  if (!root) {
    return;
  }
  var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
  var prev = root.querySelector(".hero-prev");
  var next = root.querySelector(".hero-next");
  var active = 0;
  var timer = null;

  function show(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === active);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(active + 1);
    }, 5000);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
    }
  }

  if (prev) {
    prev.addEventListener("click", function () {
      show(active - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(active + 1);
      start();
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      show(i);
      start();
    });
  });

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  show(0);
  start();
}

function initLocalFilters() {
  var inputs = document.querySelectorAll(".filter-input");
  inputs.forEach(function (input) {
    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      var cards = document.querySelectorAll(".movie-card");
      cards.forEach(function (card) {
        var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-keywords") || "")).toLowerCase();
        card.classList.toggle("is-hidden", value && text.indexOf(value) === -1);
      });
    });
  });
}

function initSearchResults() {
  var results = document.getElementById("searchResults");
  var status = document.getElementById("searchStatus");
  var input = document.getElementById("searchPageInput");
  if (!results || !status || !window.MovieIndex) {
    return;
  }
  var params = new URLSearchParams(window.location.search);
  var query = (params.get("q") || "").trim();
  if (input) {
    input.value = query;
  }
  if (!query) {
    status.textContent = "请输入关键词查找影片。";
    return;
  }
  var lower = query.toLowerCase();
  var matched = window.MovieIndex.filter(function (movie) {
    return movie.search.toLowerCase().indexOf(lower) !== -1;
  });
  status.textContent = "搜索结果：" + query + " · " + matched.length + " 条";
  if (!matched.length) {
    results.innerHTML = "";
    return;
  }
  results.innerHTML = matched.map(function (movie) {
    return [
      "<article class="poster-card movie-card">",
      "<a href="" + movie.url + "">",
      "<div class="poster-cover"><img src="" + movie.cover + "" alt="" + escapeHtml(movie.title) + "" loading="lazy"><span class="play-hover">▶</span><span class="type-badge">" + escapeHtml(movie.type) + "</span></div>",
      "<div class="poster-info"><h3>" + escapeHtml(movie.title) + "</h3><div class="poster-meta"><span>" + escapeHtml(movie.region) + "</span><span>" + movie.year + "</span></div><p>" + escapeHtml(movie.genre) + "</p></div>",
      "</a></article>"
    ].join("");
  }).join("");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
