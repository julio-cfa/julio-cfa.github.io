(function () {
  var dialog = document.getElementById('search');
  var openBtn = document.getElementById('search-open');
  var input = document.getElementById('search-input');
  var resultsEl = document.getElementById('search-results');
  var countEl = document.querySelector('[data-search-count]');
  var dataEl = document.getElementById('search-data');
  if (!dialog || !input || !resultsEl || !dataEl || typeof dialog.showModal !== 'function') return;

  var items = [];
  try {
    items = JSON.parse(dataEl.textContent);
  } catch (e) {
    items = [];
  }

  var visible = [];
  var activeIndex = -1;

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function setActive(i) {
    activeIndex = i;
    Array.prototype.forEach.call(resultsEl.children, function (li, idx) {
      li.setAttribute('aria-selected', String(idx === i));
    });
    var el = resultsEl.children[i];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }

  function go(item) {
    if (item) window.location.href = item.url;
  }

  function render(list) {
    visible = list;
    activeIndex = list.length ? 0 : -1;
    resultsEl.innerHTML = '';

    if (!list.length) {
      var empty = document.createElement('li');
      empty.className = 'search-empty';
      empty.textContent = 'No results';
      resultsEl.appendChild(empty);
    } else {
      list.forEach(function (item, i) {
        var li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', String(i === activeIndex));
        li.innerHTML =
          '<span class="search-result-title">' + escapeHtml(item.title) + '</span>' +
          '<span class="search-result-meta">' + escapeHtml(item.label) + ' &middot; ' + escapeHtml(item.date) + '</span>';
        li.addEventListener('mouseenter', function () { setActive(i); });
        li.addEventListener('click', function () { go(item); });
        resultsEl.appendChild(li);
      });
    }

    if (countEl) countEl.textContent = list.length ? (list.length + (list.length === 1 ? ' result' : ' results')) : '';
  }

  function filter(query) {
    var q = query.trim().toLowerCase();
    if (!q) {
      render(items.slice(0, 20));
      return;
    }
    var filtered = items.filter(function (item) {
      return (item.title + ' ' + item.label + ' ' + item.excerpt).toLowerCase().indexOf(q) !== -1;
    });
    render(filtered.slice(0, 30));
  }

  function open() {
    dialog.showModal();
    input.value = '';
    filter('');
    input.focus();
  }

  if (openBtn) {
    openBtn.addEventListener('click', open);
    openBtn.hidden = false;
  }

  document.addEventListener('keydown', function (ev) {
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') {
      ev.preventDefault();
      if (dialog.open) dialog.close();
      else open();
    }
  });

  input.addEventListener('input', function () {
    filter(input.value);
  });

  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      if (visible.length) setActive((activeIndex + 1) % visible.length);
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      if (visible.length) setActive((activeIndex - 1 + visible.length) % visible.length);
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      if (activeIndex >= 0) go(visible[activeIndex]);
    }
  });

  dialog.addEventListener('click', function (ev) {
    var rect = dialog.getBoundingClientRect();
    var inside =
      ev.clientX >= rect.left && ev.clientX <= rect.right &&
      ev.clientY >= rect.top && ev.clientY <= rect.bottom;
    if (!inside) dialog.close();
  });
})();
