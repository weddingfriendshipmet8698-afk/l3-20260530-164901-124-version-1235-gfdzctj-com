(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-nav]");

    if (menuButton && nav) {
      menuButton.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var activeIndex = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === activeIndex);
        });
      }

      function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(activeIndex + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(activeIndex - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(activeIndex + 1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      restart();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var currentFilter = "all";

    function applySearch() {
      var query = searchInputs.map(function (input) {
        return input.value.trim().toLowerCase();
      }).filter(Boolean).join(" ");
      var items = Array.prototype.slice.call(document.querySelectorAll("[data-search-item]"));

      items.forEach(function (item) {
        var text = (item.getAttribute("data-search-text") || item.textContent || "").toLowerCase();
        var value = item.getAttribute("data-filter-value") || "";
        var matchText = !query || text.indexOf(query) !== -1;
        var matchFilter = currentFilter === "all" || value === currentFilter;
        item.classList.toggle("is-hidden", !(matchText && matchFilter));
      });
    }

    searchInputs.forEach(function (input) {
      input.addEventListener("input", applySearch);
    });

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentFilter = button.getAttribute("data-filter") || "all";
        filterButtons.forEach(function (entry) {
          entry.classList.toggle("is-active", entry === button);
        });
        applySearch();
      });
    });
  });
})();
