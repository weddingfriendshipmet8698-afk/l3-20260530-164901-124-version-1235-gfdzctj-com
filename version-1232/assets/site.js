(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initNavigation();
    initHeroCarousel();
    initCardFilters();
    markCurrentLinks();
  });

  function initNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.nav-menu');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('.hero-carousel');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-target-slide') || '0'));
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initCardFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var grid = document.querySelector('[data-card-grid]');
    if (!panel || !grid) {
      return;
    }

    var input = panel.querySelector('[data-filter-input]');
    var category = panel.querySelector('[data-filter-category]');
    var type = panel.querySelector('[data-filter-type]');
    var count = document.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(input && input.value);
      var categoryValue = category ? category.value : '';
      var typeValue = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();

        var matchKeyword = !keyword || text.indexOf(keyword) >= 0;
        var matchCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
        var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
        var show = matchKeyword && matchCategory && matchType;
        card.classList.toggle('is-hidden-by-filter', !show);
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部作品';
      }
    }

    [input, category, type].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
    apply();
  }

  function markCurrentLinks() {
    var current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href.split('/').pop() === current) {
        link.classList.add('is-current');
      }
    });
  }
})();
