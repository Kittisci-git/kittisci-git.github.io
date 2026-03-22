// ============================================================
// KITTISCI.CO.UK — SITE.JS
// Shared JavaScript for all pages
// ============================================================

(function() {

  // ----------------------------------------------------------
  // DARK MODE TOGGLE
  // ----------------------------------------------------------
  var STORAGE_KEY = 'kittisci-colorscheme';

  function getScheme() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyScheme(scheme) {
    document.body.classList.remove('colorscheme-dark', 'colorscheme-light');
    document.body.classList.add('colorscheme-' + scheme);
    localStorage.setItem(STORAGE_KEY, scheme);
  }

  function toggleScheme() {
    var current = getScheme();
    applyScheme(current === 'dark' ? 'light' : 'dark');
  }

  // Apply on load (body already has default class from HTML, this syncs with storage)
  document.addEventListener('DOMContentLoaded', function() {
    applyScheme(getScheme());

    var toggle = document.getElementById('dark-mode-toggle');
    if (toggle) {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        toggleScheme();
      });
    }
  });

  // ----------------------------------------------------------
  // RETURN TO TOP
  // ----------------------------------------------------------
  window.addEventListener('scroll', function() {
    var btn = document.getElementById('return-to-top');
    if (btn) {
      btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
    }
  });

})();
