(function () {
    function loadHlsScript() {
        if (window.Hls) {
            return Promise.resolve();
        }
        if (window.__hlsLoadingPromise) {
            return window.__hlsLoadingPromise;
        }
        window.__hlsLoadingPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
            script.onload = function () {
                resolve();
            };
            script.onerror = function () {
                reject(new Error('hls'));
            };
            document.head.appendChild(script);
        });
        return window.__hlsLoadingPromise;
    }

    function attachSource(video, sourceUrl) {
        if (video.getAttribute('data-ready') === 'yes') {
            return Promise.resolve();
        }
        video.setAttribute('data-ready', 'yes');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            return Promise.resolve();
        }

        return loadHlsScript().then(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = sourceUrl;
            }
        }).catch(function () {
            video.src = sourceUrl;
        });
    }

    window.initMoviePlayer = function (sourceUrl) {
        var video = document.getElementById('movieVideo');
        var startButton = document.getElementById('playerStart');
        var shell = document.querySelector('[data-player-shell]');

        if (!video || !sourceUrl) {
            return;
        }

        function beginPlayback() {
            attachSource(video, sourceUrl).then(function () {
                if (startButton) {
                    startButton.classList.add('is-hidden');
                }
                video.controls = true;
                var playResult = video.play();
                if (playResult && typeof playResult.catch === 'function') {
                    playResult.catch(function () {});
                }
            });
        }

        if (startButton) {
            startButton.addEventListener('click', function (event) {
                event.preventDefault();
                beginPlayback();
            });
        }

        if (shell) {
            shell.addEventListener('click', function (event) {
                if (event.target === shell || event.target === video) {
                    beginPlayback();
                }
            });
        }

        video.addEventListener('play', function () {
            if (startButton) {
                startButton.classList.add('is-hidden');
            }
        });
    };
})();
