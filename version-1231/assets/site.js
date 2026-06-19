(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            var opened = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
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

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                play();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                play();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", play);
        play();
    }

    document.querySelectorAll("[data-filter-panel]").forEach(function (panelNode) {
        var buttons = Array.prototype.slice.call(panelNode.querySelectorAll("[data-filter]"));
        var container = panelNode.parentElement;
        var grid = container ? container.querySelector("[data-filter-grid]") : null;
        var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var value = button.getAttribute("data-filter") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-type") || "",
                        card.getAttribute("data-genre") || ""
                    ].join(" ");
                    var matched = value === "all" || haystack.indexOf(value) !== -1;
                    card.classList.toggle("is-filtered-out", !matched);
                });
            });
        });
    });
})();

function initVideoPlayback(streamUrl) {
    var video = document.querySelector(".movie-video");
    var layer = document.querySelector(".play-layer");

    if (!video || !streamUrl) {
        return;
    }

    var ready = false;

    function attach() {
        if (ready) {
            return;
        }
        ready = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls) {
            var hls = new Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function start() {
        attach();
        if (layer) {
            layer.classList.add("is-hidden");
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
        }
    }

    if (layer) {
        layer.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener("play", function () {
        if (layer) {
            layer.classList.add("is-hidden");
        }
    });
}
