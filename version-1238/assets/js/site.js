document.addEventListener("DOMContentLoaded", function () {
  setupMobileNavigation();
  setupHeroSlider();
  setupLocalFilters();
  setupImageFallbacks();
});

function setupMobileNavigation() {
  var button = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-mobile-nav]");

  if (!button || !nav) {
    return;
  }

  button.addEventListener("click", function () {
    nav.classList.toggle("is-open");
  });
}

function setupHeroSlider() {
  var slider = document.querySelector("[data-hero-slider]");

  if (!slider) {
    return;
  }

  var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
  var currentIndex = 0;

  function showSlide(nextIndex) {
    currentIndex = nextIndex;

    slides.forEach(function (slide, index) {
      slide.classList.toggle("is-active", index === currentIndex);
    });

    dots.forEach(function (dot, index) {
      dot.classList.toggle("is-active", index === currentIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide((currentIndex + 1) % slides.length);
    }, 5000);
  }
}

function setupLocalFilters() {
  var scopes = document.querySelectorAll("[data-filter-scope]");

  scopes.forEach(function (scope) {
    var keywordInput = scope.querySelector("[data-filter-keyword]");
    var yearSelect = scope.querySelector("[data-filter-year]");
    var typeSelect = scope.querySelector("[data-filter-type]");
    var section = scope.closest("section");
    var list = section ? section.querySelector("[data-filter-list]") : null;
    var count = section ? section.querySelector("[data-filter-count]") : null;

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

    function applyFilters() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title || "",
          card.dataset.region || "",
          card.dataset.type || "",
          card.dataset.year || ""
        ].join(" ").toLowerCase();

        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !year || card.dataset.year === year;
        var matchesType = !type || card.dataset.type === type;
        var shouldShow = matchesKeyword && matchesYear && matchesType;

        card.style.display = shouldShow ? "" : "none";

        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    [keywordInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
  });
}

function setupImageFallbacks() {
  var images = document.querySelectorAll("img");

  images.forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("image-missing");
      image.setAttribute("aria-hidden", "true");
    });
  });
}
