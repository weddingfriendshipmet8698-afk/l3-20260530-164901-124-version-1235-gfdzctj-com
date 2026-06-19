function initMoviePlayer(sourceUrl) {
  var video = document.getElementById("movieVideo");
  var layer = document.getElementById("playLayer");
  var hlsInstance = null;
  var prepared = false;

  function prepare() {
    if (prepared || !video || !sourceUrl) {
      return;
    }
    prepared = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function play() {
    prepare();
    if (layer) {
      layer.classList.add("is-hidden");
    }
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {
        if (layer) {
          layer.classList.remove("is-hidden");
        }
      });
    }
  }

  if (layer) {
    layer.addEventListener("click", play);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (!prepared || video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (layer && video.currentTime === 0) {
        layer.classList.remove("is-hidden");
      }
    });
  }

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
