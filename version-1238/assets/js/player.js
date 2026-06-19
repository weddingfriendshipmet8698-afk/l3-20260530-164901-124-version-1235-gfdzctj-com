import { H as Hls } from "./hls-vendor.js";

document.addEventListener("DOMContentLoaded", function () {
  var video = document.getElementById("videoPlayer");
  var startButton = document.querySelector("[data-player-start]");
  var message = document.querySelector("[data-player-message]");

  if (!video || !startButton) {
    return;
  }

  var source = video.dataset.videoUrl || "";
  var hlsInstance = null;
  var hasLoaded = false;

  function showMessage(text) {
    if (!message) {
      return;
    }

    message.textContent = text;
    message.classList.add("is-visible");
  }

  function attachSource() {
    if (hasLoaded) {
      return Promise.resolve();
    }

    hasLoaded = true;

    if (!source) {
      showMessage("当前影片没有可用播放源。");
      return Promise.reject(new Error("Missing video source"));
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.controls = true;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      video.controls = true;

      hlsInstance.on(Hls.Events.ERROR, function (_event, data) {
        if (data && data.fatal) {
          showMessage("视频加载失败，请稍后重试。");
        }
      });

      return Promise.resolve();
    }

    showMessage("当前浏览器不支持 HLS 播放。");
    return Promise.reject(new Error("HLS is not supported"));
  }

  startButton.addEventListener("click", function () {
    attachSource()
      .then(function () {
        startButton.classList.add("is-hidden");
        return video.play();
      })
      .catch(function () {
        startButton.classList.remove("is-hidden");
      });
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
});
