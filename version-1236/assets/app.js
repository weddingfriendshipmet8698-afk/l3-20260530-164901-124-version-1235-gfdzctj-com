
(function () {
  'use strict';

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMenu() {
    var toggle = $('[data-menu-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', nav.classList.contains('is-open'));
    });
  }

  function initImageFallbacks() {
    $all('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
        var holder = image.closest('.poster, .hero-slide, .poster-side, .hero-mini-card, .rank-row');
        if (holder) {
          holder.classList.add('image-missing');
        }
      });
    });
  }

  function initHeroSlider() {
    var slider = $('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = $all('[data-hero-slide]', slider);
    var dots = $all('[data-hero-dot]', slider);
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function initLocalFilters() {
    var panels = $all('[data-filter-form]');
    panels.forEach(function (panel) {
      var input = $('[data-filter-input]', panel);
      var clear = $('[data-filter-clear]', panel);
      var count = $('[data-filter-count]', panel);
      var grid = panel.parentElement ? $('[data-filter-grid]', panel.parentElement) : null;
      var cards = grid ? $all('[data-filter-card]', grid) : $all('[data-filter-card]');
      var chips = $all('[data-filter-chip]', panel);
      var activeCategory = 'all';

      function applyFilter() {
        var query = normalize(input ? input.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          var category = card.getAttribute('data-category') || '';
          var categoryOk = activeCategory === 'all' || category === activeCategory;
          var queryOk = !query || haystack.indexOf(query) !== -1;
          var show = categoryOk && queryOk;
          card.classList.toggle('filter-hidden', !show);
          if (show) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = String(visible);
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }
      if (clear) {
        clear.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          applyFilter();
        });
      }
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          activeCategory = chip.getAttribute('data-filter-chip') || 'all';
          chips.forEach(function (item) {
            item.classList.toggle('is-active', item === chip);
          });
          applyFilter();
        });
      });
      applyFilter();
    });
  }

  function renderMovieCard(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.join(' ') : '';
    var detail = movie.detail || ('detail/' + movie.id + '.html');
    var image = movie.image || '1.jpg';
    var desc = movie.oneLine || '';
    return [
      '<article class="movie-card" data-filter-card data-search="', escapeHtml([movie.title, movie.region, movie.category, movie.type, movie.year, movie.genre, tags].join(' ')), '">',
      '<a class="poster" href="', escapeHtml(detail), '" aria-label="观看 ', escapeHtml(movie.title), '">',
      '<img src="', escapeHtml(image), '" alt="', escapeHtml(movie.title), ' 封面" loading="lazy">',
      '<span class="poster-badge">', escapeHtml(movie.category || movie.region), '</span>',
      '<span class="poster-play" aria-hidden="true">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<h3><a href="', escapeHtml(detail), '">', escapeHtml(movie.title), '</a></h3>',
      '<p class="movie-meta">', escapeHtml(movie.year), ' · ', escapeHtml(movie.type), ' · ', escapeHtml(movie.genre), '</p>',
      '<p class="movie-desc">', escapeHtml(desc.length > 80 ? desc.slice(0, 80) + '…' : desc), '</p>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearchPage() {
    var page = $('[data-search-page]');
    if (!page || !window.SEARCH_MOVIES) {
      return;
    }
    var input = $('[data-search-input]', page);
    var clear = $('[data-search-clear]', page);
    var results = $('[data-search-results]', page);
    var count = $('[data-search-count]', page);
    var chips = $all('[data-search-category]', page);
    var activeCategory = 'all';

    function applySearch() {
      var query = normalize(input ? input.value : '');
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.category,
          movie.type,
          movie.year,
          movie.genre,
          Array.isArray(movie.tags) ? movie.tags.join(' ') : '',
          movie.oneLine
        ].join(' '));
        var categoryOk = activeCategory === 'all' || movie.category === activeCategory;
        var queryOk = !query || haystack.indexOf(query) !== -1;
        return categoryOk && queryOk;
      }).slice(0, 120);

      results.innerHTML = matched.map(renderMovieCard).join('');
      if (count) {
        count.textContent = String(matched.length);
      }
      initImageFallbacks();
    }

    if (input) {
      input.addEventListener('input', applySearch);
    }
    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        applySearch();
      });
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeCategory = chip.getAttribute('data-search-category') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        applySearch();
      });
    });
    applySearch();
  }

  function initPlayers() {
    $all('[data-player]').forEach(function (player) {
      var video = $('.player-video', player);
      var button = $('[data-player-button]', player);
      var loading = $('[data-player-loading]', player);
      var status = $('[data-player-status]', player);
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-m3u8');
      var hlsInstance = null;
      var loaded = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message || '';
        }
      }

      function setLoading(isLoading) {
        if (loading) {
          loading.hidden = !isLoading;
        }
      }

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setStatus('播放器已准备好，请再次点击播放。');
          });
        }
      }

      function attachHls() {
        if (!source) {
          setStatus('当前影片暂未配置播放源。');
          return;
        }
        if (loaded) {
          playVideo();
          return;
        }
        loaded = true;
        setLoading(true);
        setStatus('正在加载高清播放源…');
        if (button) {
          button.classList.add('is-hidden');
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setLoading(false);
            setStatus('');
            playVideo();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus('网络波动，正在重新连接播放源…');
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus('媒体解码异常，正在尝试恢复…');
              hlsInstance.recoverMediaError();
            } else {
              setLoading(false);
              setStatus('播放器初始化失败，请刷新页面重试。');
              hlsInstance.destroy();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setLoading(false);
            setStatus('');
            playVideo();
          }, { once: true });
        } else {
          setLoading(false);
          setStatus('当前浏览器缺少 HLS 播放支持，请使用现代浏览器访问。');
        }
      }

      if (button) {
        button.addEventListener('click', attachHls);
      }
      video.addEventListener('play', function () {
        if (!loaded) {
          attachHls();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initImageFallbacks();
    initHeroSlider();
    initLocalFilters();
    initSearchPage();
    initPlayers();
  });
}());
