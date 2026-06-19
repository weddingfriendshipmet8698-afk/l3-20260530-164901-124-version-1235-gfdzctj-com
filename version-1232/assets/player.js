(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll('video[data-hls-src]').forEach(initPlayer);
  });

  function initPlayer(video) {
    var src = video.getAttribute('data-hls-src');
    var shell = video.closest('.player-shell');
    var trigger = shell ? shell.querySelector('[data-player-trigger]') : null;
    var message = shell ? shell.querySelector('[data-player-message]') : null;
    var hlsInstance = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function attachSource() {
      if (!src) {
        setMessage('当前影片没有可用播放源。');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage('播放源已加载完成，可以开始播放。');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setMessage('网络加载异常，正在重试播放源。');
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setMessage('媒体解码异常，正在尝试恢复。');
            hlsInstance.recoverMediaError();
          } else {
            setMessage('播放器遇到无法恢复的错误，请刷新页面重试。');
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        setMessage('浏览器原生支持 HLS，播放源已绑定。');
      } else {
        video.src = src;
        setMessage('当前浏览器需要 HLS 支持，请使用新版浏览器打开。');
      }
    }

    attachSource();

    if (trigger) {
      trigger.addEventListener('click', function () {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setMessage('浏览器阻止了自动播放，请直接点击视频控件播放。');
          });
        }
      });
    }

    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (shell) {
        shell.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
