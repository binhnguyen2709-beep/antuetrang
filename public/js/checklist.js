(function () {
  var dataEl = document.getElementById('checklist-data');
  var picker = document.getElementById('toolPicker');
  var result = document.getElementById('toolResult');
  if (!dataEl || !picker || !result) return;

  var data = JSON.parse(dataEl.textContent);

  function render(slug) {
    var item = data.find(function (d) { return d.slug === slug; });
    if (!item) {
      result.innerHTML = '<p class="tool__empty">Chọn một dịp lễ ở trên để xem danh sách chuẩn bị.</p>';
      return;
    }

    var groupsHtml = item.muc.map(function (nhom, gi) {
      var itemsHtml = nhom.viec.map(function (viec, vi) {
        var id = 'ck-' + item.slug + '-' + gi + '-' + vi;
        return (
          '<li>' +
            '<input type="checkbox" id="' + id + '">' +
            '<label for="' + id + '"><span>' + viec + '</span></label>' +
          '</li>'
        );
      }).join('');
      return (
        '<div class="tool__group">' +
          '<h3>' + nhom.ten + '</h3>' +
          '<ul>' + itemsHtml + '</ul>' +
        '</div>'
      );
    }).join('');

    result.innerHTML =
      '<p class="tool__result-intro">' + item.gioi_thieu + '</p>' +
      '<div class="tool__groups">' + groupsHtml + '</div>';

    result.querySelectorAll('input[type="checkbox"]').forEach(function (box) {
      box.addEventListener('change', function () {
        box.closest('li').classList.toggle('is-checked', box.checked);
      });
    });
  }

  picker.querySelectorAll('button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      picker.querySelectorAll('button').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      render(btn.dataset.slug);
      result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  var first = picker.querySelector('button');
  if (first) {
    first.classList.add('is-active');
    render(first.dataset.slug);
  }

  document.querySelectorAll('.js-select-checklist').forEach(function (link) {
    link.addEventListener('click', function () {
      var slug = link.dataset.slug;
      var btn = picker.querySelector('button[data-slug="' + slug + '"]');
      if (btn) btn.click();
    });
  });
})();
