(function () {
  var el = document.querySelector('.cd-clock');
  if (!el) return;
  var target = new Date(el.getAttribute('data-target')).getTime();
  var parts = {};
  ['d', 'h', 'm', 's'].forEach(function (k) { parts[k] = el.querySelector('[data-unit="' + k + '"]'); });
  function tick() {
    var left = Math.max(0, target - Date.now());
    var s = Math.floor(left / 1000);
    parts.d.textContent = Math.floor(s / 86400);
    parts.h.textContent = Math.floor((s % 86400) / 3600);
    parts.m.textContent = Math.floor((s % 3600) / 60);
    parts.s.textContent = s % 60;
  }
  tick();
  setInterval(tick, 1000);
})();
