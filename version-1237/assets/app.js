(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input');
            var query = input ? input.value.trim() : '';
            if (query) {
                window.location.href = './search.html?q=' + encodeURIComponent(query);
            } else {
                window.location.href = './search.html';
            }
        });
    });

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function applyCardFilter(root) {
        var input = root.querySelector('[data-local-search]');
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
        var empty = root.querySelector('[data-empty-state]');
        var activeChip = root.querySelector('[data-filter-chip].is-active');
        var query = normalize(input ? input.value : '');
        var filter = activeChip ? activeChip.getAttribute('data-filter-chip') : 'all';
        var shown = 0;

        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-region'),
                card.getAttribute('data-tags')
            ].join(' '));
            var year = parseInt(card.getAttribute('data-year'), 10) || 0;
            var region = card.getAttribute('data-region') || '';
            var genre = card.getAttribute('data-genre') || '';
            var matchesText = !query || text.indexOf(query) !== -1;
            var matchesFilter = filter === 'all'
                || (filter === 'recent' && year >= 2020)
                || (filter === 'china' && /中国|香港|台湾|华语/.test(region))
                || (filter === 'overseas' && /美国|英国|法国|德国|日本|韩国|印度|意大利|西班牙|加拿大|欧美|日韩/.test(region))
                || (filter !== 'recent' && filter !== 'china' && filter !== 'overseas' && genre.indexOf(filter) !== -1);
            var visible = matchesText && matchesFilter;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                shown += 1;
            }
        });

        if (empty) {
            empty.style.display = shown ? 'none' : 'block';
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]')).forEach(function (root) {
        var input = root.querySelector('[data-local-search]');
        var chips = Array.prototype.slice.call(root.querySelectorAll('[data-filter-chip]'));

        if (input) {
            input.addEventListener('input', function () {
                applyCardFilter(root);
            });
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                chip.classList.add('is-active');
                applyCardFilter(root);
            });
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && input) {
            input.value = query;
        }
        applyCardFilter(root);
    });
})();
