(function () {
  var root = document.documentElement;
  var mql = matchMedia('(prefers-color-scheme: light)');

  function currentTheme() {
    return root.getAttribute('data-theme') || (mql.matches ? 'light' : 'dark');
  }

  function applyMetaThemeColor(theme) {
    var color = theme === 'light' ? '#f6f5f1' : '#1c1c1c';
    document.querySelectorAll('meta[name="theme-color"], meta[name="msapplication-navbutton-color"]')
      .forEach(function (m) { m.setAttribute('content', color); });
    var bar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (bar) bar.setAttribute('content', theme === 'light' ? 'default' : 'black-translucent');
  }

  var btn = document.getElementById('theme-toggle');
  applyMetaThemeColor(currentTheme());
  if (!btn) return;

  btn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    applyMetaThemeColor(next);
  });
})();
