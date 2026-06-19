(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupImageFallbacks() {
    var images = document.querySelectorAll("img[data-fallback-image]");
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        var holder = image.closest(".poster-wrap, .horizontal-poster, .detail-poster, .hero-backdrop, .detail-backdrop, .rank-hero-bg");
        if (holder) {
          holder.classList.add("is-missing-image");
        }
        image.style.opacity = "0";
      }, { once: true });
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }

    var search = panel.querySelector("[data-filter-search]");
    var category = panel.querySelector("[data-filter-category]");
    var year = panel.querySelector("[data-filter-year]");
    var reset = panel.querySelector("[data-filter-reset]");
    var result = panel.querySelector("[data-filter-result]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(search && search.value);
      var selectedCategory = category ? category.value : "";
      var selectedYear = year ? year.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var content = [
          card.getAttribute("data-title"),
          card.getAttribute("data-category"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var matchesKeyword = !keyword || content.indexOf(keyword) !== -1;
        var matchesCategory = !selectedCategory || card.getAttribute("data-category") === selectedCategory;
        var matchesYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
        var isVisible = matchesKeyword && matchesCategory && matchesYear;
        card.classList.toggle("is-hidden", !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });

      if (result) {
        result.textContent = "当前显示 " + visible + " 部内容";
      }
    }

    [search, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (search) {
          search.value = "";
        }
        if (category) {
          category.value = "";
        }
        if (year) {
          year.value = "";
        }
        apply();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && search) {
      search.value = q;
    }
    apply();
  }

  ready(function () {
    setupMobileNav();
    setupImageFallbacks();
    setupHeroSlider();
    setupFilters();
  });
})();
