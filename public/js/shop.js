(function () {
  var tabs = document.getElementById('shopTabs');
  if (!tabs) return;
  var sections = document.querySelectorAll('[data-shop-section]');

  function show(slug) {
    sections.forEach(function (s) {
      s.hidden = slug !== 'all' && s.dataset.shopSection !== slug;
    });
  }

  tabs.querySelectorAll('button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabs.querySelectorAll('button').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      show(btn.dataset.filter);
    });
  });
})();
