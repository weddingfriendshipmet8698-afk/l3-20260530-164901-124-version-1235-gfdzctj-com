(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var data = window.MOVIE_SEARCH_INDEX || [];
    var form = document.querySelector('.search-page-form');
    var input = document.getElementById('search-q');
    var category = document.getElementById('search-category');
    var type = document.getElementById('search-type');
    var results = document.getElementById('search-results');
    var summary = document.getElementById('search-summary');
    var params = new URLSearchParams(location.search);

    if (!results || !summary) {
      return;
    }

    input.value = params.get('q') || '';
    category.value = params.get('category') || '';
    type.value = params.get('type') || '';

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 5).join(' ');
      return [
        '<article class="movie-card" data-title="' + escapeHtml(movie.title).toLowerCase() + '" data-tags="' + escapeHtml(tags) + '">',
        '  <a class="poster-frame" href="' + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="play-chip">▶</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.type) + '</p>',
        '    <p class="card-line">' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="card-tags">',
        '      <span>' + escapeHtml(movie.genre || movie.categoryName) + '</span>',
        '      <span>' + escapeHtml(movie.categoryName) + '</span>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join('\n');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function apply(pushState) {
      var keyword = normalize(input.value);
      var categoryValue = category.value;
      var typeValue = type.value;
      var words = keyword.split(/\s+/).filter(Boolean);

      var matched = data.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(' '),
          movie.categoryName
        ].join(' '));
        var matchKeyword = !words.length || words.every(function (word) {
          return haystack.indexOf(word) >= 0;
        });
        var matchCategory = !categoryValue || movie.category === categoryValue;
        var matchType = !typeValue || movie.type === typeValue;
        return matchKeyword && matchCategory && matchType;
      }).slice(0, 200);

      results.innerHTML = matched.map(card).join('\n');
      summary.textContent = '找到 ' + matched.length + ' 条结果' + (matched.length === 200 ? '，已显示前 200 条' : '');

      if (pushState) {
        var params = new URLSearchParams();
        if (input.value.trim()) {
          params.set('q', input.value.trim());
        }
        if (categoryValue) {
          params.set('category', categoryValue);
        }
        if (typeValue) {
          params.set('type', typeValue);
        }
        history.replaceState(null, '', 'search.html' + (params.toString() ? '?' + params.toString() : ''));
      }
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply(true);
      });
    }

    [input, category, type].forEach(function (el) {
      if (el) {
        el.addEventListener('input', function () {
          apply(true);
        });
        el.addEventListener('change', function () {
          apply(true);
        });
      }
    });

    apply(false);
  });
})();
