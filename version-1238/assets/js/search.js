document.addEventListener("DOMContentLoaded", function () {
  var data = window.MOVIE_DATA || [];
  var input = document.getElementById("searchInput");
  var regionFilter = document.getElementById("regionFilter");
  var typeFilter = document.getElementById("typeFilter");
  var results = document.getElementById("searchResults");
  var count = document.getElementById("searchCount");
  var clearButton = document.getElementById("clearSearch");

  if (!input || !results) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";
  input.value = initialQuery;

  fillSelect(regionFilter, uniqueValues(data, "region"));
  fillSelect(typeFilter, uniqueValues(data, "type"));

  function render() {
    var keyword = input.value.trim().toLowerCase();
    var region = regionFilter ? regionFilter.value : "";
    var type = typeFilter ? typeFilter.value : "";

    var filtered = data.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.one_line
      ].join(" ").toLowerCase();

      return (!keyword || haystack.indexOf(keyword) !== -1)
        && (!region || movie.region === region)
        && (!type || movie.type === type);
    }).slice(0, 120);

    results.innerHTML = filtered.map(cardTemplate).join("");
    Array.prototype.slice.call(results.querySelectorAll("img")).forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
        image.setAttribute("aria-hidden", "true");
      });
    });

    if (count) {
      count.textContent = String(filtered.length);
    }
  }

  function cardTemplate(movie) {
    var tagHtml = (movie.tags || []).slice(0, 2).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return '<a class="video-card" href="detail/' + movie.id + '.html">'
      + '<div class="card-poster poster-fallback">'
      + '<img src="' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">'
      + '<span class="card-year">' + escapeHtml(movie.year) + '</span>'
      + '<span class="play-hover">▶</span>'
      + '</div>'
      + '<div class="card-body">'
      + '<div class="tag-row">' + tagHtml + '</div>'
      + '<h3>' + escapeHtml(movie.title) + '</h3>'
      + '<p>' + escapeHtml(movie.one_line) + '</p>'
      + '<div class="meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>'
      + '</div>'
      + '</a>';
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    values.slice(0, 120).forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function uniqueValues(items, key) {
    var seen = Object.create(null);

    items.forEach(function (item) {
      if (item[key]) {
        seen[item[key]] = true;
      }
    });

    return Object.keys(seen).sort();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  [input, regionFilter, typeFilter].forEach(function (control) {
    if (control) {
      control.addEventListener("input", render);
      control.addEventListener("change", render);
    }
  });

  if (clearButton) {
    clearButton.addEventListener("click", function () {
      input.value = "";

      if (regionFilter) {
        regionFilter.value = "";
      }

      if (typeFilter) {
        typeFilter.value = "";
      }

      render();
    });
  }

  render();
});
