(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupPlayer(box) {
    var video = box.querySelector("video[data-src]");
    var button = box.querySelector("[data-play-button]");
    var status = box.querySelector("[data-player-status]");
    var source = video ? video.getAttribute("data-src") : "";
    var hls = null;
    var attached = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function attachSource() {
      if (!video || !source || attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setStatus("播放源已就绪");
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("播放源已就绪");
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus("播放源加载失败，请刷新页面或稍后再试");
            try {
              hls.destroy();
            } catch (error) {
              console.warn(error);
            }
            attached = false;
          }
        });
        return;
      }

      setStatus("当前浏览器暂不支持 HLS 播放，请更换现代浏览器");
    }

    function play() {
      attachSource();
      if (!video) {
        return;
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          setStatus("浏览器阻止了自动播放，请再次点击播放按钮");
        });
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
        setStatus("正在播放");
      });
      video.addEventListener("pause", function () {
        box.classList.remove("is-playing");
      });
      video.addEventListener("waiting", function () {
        setStatus("正在缓冲，请稍候");
      });
      video.addEventListener("playing", function () {
        box.classList.add("is-playing");
        setStatus("正在播放");
      });
      video.addEventListener("error", function () {
        setStatus("播放发生错误，请刷新页面或切换网络后重试");
      });
      video.addEventListener("loadedmetadata", function () {
        setStatus("播放源已加载");
      });
    }
  }

  ready(function () {
    document.querySelectorAll("[data-player-box]").forEach(setupPlayer);
  });
})();
