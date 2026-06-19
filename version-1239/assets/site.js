(function () {
    const site = {};

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        const button = document.querySelector("[data-mobile-toggle]");
        const panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            const open = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        const hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll(".hero-dot"));
        const previous = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        let current = 0;
        let timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 6500);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                schedule();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
                schedule();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                schedule();
            });
        }

        show(0);
        schedule();
    }

    function textOf(element) {
        return (element.getAttribute("data-search") || element.textContent || "").toLowerCase();
    }

    function normalize(value) {
        return (value || "").trim().toLowerCase();
    }

    function applySearch(root, query) {
        const cards = Array.from(root.querySelectorAll("[data-search-item]"));
        const empty = root.querySelector("[data-empty-state]");
        let shown = 0;
        cards.forEach(function (card) {
            const match = !query || textOf(card).includes(query);
            card.classList.toggle("is-hidden", !match);
            if (match) {
                shown += 1;
            }
        });
        if (empty) {
            empty.classList.toggle("is-visible", shown === 0);
        }
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-root]").forEach(function (root) {
            const input = root.querySelector("[data-filter-input]");
            const chips = Array.from(root.querySelectorAll("[data-filter-chip]"));
            let active = "all";

            function run() {
                const query = normalize(input ? input.value : "");
                const cards = Array.from(root.querySelectorAll("[data-search-item]"));
                const empty = root.querySelector("[data-empty-state]");
                let shown = 0;
                cards.forEach(function (card) {
                    const textMatch = !query || textOf(card).includes(query);
                    const tagMatch = active === "all" || (card.getAttribute("data-tags") || "").includes(active);
                    const visible = textMatch && tagMatch;
                    card.classList.toggle("is-hidden", !visible);
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", shown === 0);
                }
            }

            if (input) {
                input.addEventListener("input", run);
                const params = new URLSearchParams(window.location.search);
                const initial = params.get("q");
                if (initial) {
                    input.value = initial;
                }
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    active = chip.getAttribute("data-filter-chip") || "all";
                    chips.forEach(function (other) {
                        other.classList.toggle("is-active", other === chip);
                    });
                    run();
                });
            });

            run();
        });
    }

    function initImageHandling() {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.remove();
            }, { once: true });
        });
    }

    site.initMoviePlayer = function (source) {
        const box = document.querySelector("[data-player]");
        if (!box) {
            return;
        }
        const video = box.querySelector("video");
        const overlay = box.querySelector("[data-player-overlay]");
        const playButtons = Array.from(box.querySelectorAll("[data-player-play]"));
        const muteButton = box.querySelector("[data-player-mute]");
        const fullButton = box.querySelector("[data-player-fullscreen]");
        const status = box.querySelector("[data-player-status]");
        let loaded = false;
        let hls = null;

        function setStatus(text) {
            if (status) {
                status.textContent = text;
            }
        }

        function loadSource() {
            if (loaded || !video || !source) {
                return;
            }
            loaded = true;
            setStatus("正在加载");
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus("高清播放");
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus("请稍后重试");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    setStatus("高清播放");
                }, { once: true });
            } else {
                setStatus("暂不支持");
            }
        }

        function play() {
            loadSource();
            if (!video) {
                return;
            }
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            const promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        function togglePlay() {
            if (!video) {
                return;
            }
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        playButtons.forEach(function (button) {
            button.addEventListener("click", togglePlay);
        });

        if (video) {
            video.addEventListener("click", togglePlay);
            video.addEventListener("play", function () {
                setStatus("正在播放");
            });
            video.addEventListener("pause", function () {
                setStatus("已暂停");
            });
        }

        if (muteButton && video) {
            muteButton.addEventListener("click", function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? "取消静音" : "静音";
            });
        }

        if (fullButton && video) {
            fullButton.addEventListener("click", function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    video.requestFullscreen();
                }
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initImageHandling();
    });

    window.MovieSite = site;
})();
