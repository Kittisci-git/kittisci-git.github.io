var GB_WORKER = 'https://kittisci-proxy.kittisci.workers.dev';
var gbEntries = [];
var gbPage = 0;
var GB_PAGE_SIZE = 20;
var gbIsAdmin = false;
var gbAdminPassword = '';
var gbPanelOpen = false;

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') return;
  buildGuestbook();
  checkGuestbookAdminHash();
  window.addEventListener('hashchange', checkGuestbookAdminHash);
});

function checkGuestbookAdminHash() {
  if (window.location.hash === '#admin') {
    openGuestbook();
    showGuestbookAdminOverlay();
  }
}

// ============================================================
// BUILD UI
// ============================================================
function buildGuestbook() {
  // Button
  var btn = document.createElement('button');
  btn.id = 'guestbook-btn';
  btn.textContent = 'Guestbook';
  btn.onclick = toggleGuestbook;
  document.body.appendChild(btn);

  // Click-outside backdrop
  var backdrop = document.createElement('div');
  backdrop.id = 'gb-backdrop';
  backdrop.onclick = closeGuestbook;
  document.body.appendChild(backdrop);

  // Panel
  var panel = document.createElement('div');
  panel.id = 'gb-panel';
  panel.innerHTML =
    '<div id="gb-header">' +
      '<h3>Guestbook</h3>' +
      '<div id="gb-header-right">' +
        '<span id="gb-admin-badge" style="display:none;">Admin</span>' +
        '</div>' +
    '</div>' +
    '<div id="gb-entries-wrap">' +
      '<div id="gb-entries"><p class="gb-loading">Loading...</p></div>' +
      '<div id="gb-pagination"></div>' +
    '</div>' +
    '<div id="gb-form">' +
      '<input type="text" id="gb-name-input" maxlength="50" placeholder="Your name..." />' +
      '<button id="gb-sign-btn" onclick="signGuestbook()">Sign</button>' +
    '</div>' +
    '<div id="gb-error" style="display:none;"></div>' +
    '<div id="gb-success" style="display:none;">Thanks for signing!</div>' +
    '<div id="gb-admin-overlay">' +
      '<div id="gb-admin-box">' +
        '<h3>Admin Access</h3>' +
        '<p>Enter your password to manage the guestbook.</p>' +
        '<input type="password" id="gb-admin-pw-input" placeholder="Password" />' +
        '<div id="gb-admin-error" style="display:none;">Incorrect password.</div>' +
        '<div id="gb-admin-btns">' +
          '<button onclick="closeGuestbookAdminOverlay()">Cancel</button>' +
          '<button class="gb-confirm" onclick="submitGuestbookAdminPassword()">Unlock</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(panel);

  document.getElementById('gb-admin-pw-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') submitGuestbookAdminPassword();
  });
  document.getElementById('gb-name-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') signGuestbook();
  });
}

// ============================================================
// OPEN / CLOSE / TOGGLE
// ============================================================
function toggleGuestbook() {
  if (gbPanelOpen) {
    closeGuestbook();
  } else {
    openGuestbook();
  }
}

function openGuestbook() {
  gbPanelOpen = true;
  document.getElementById('gb-panel').classList.add('gb-visible');
  document.getElementById('gb-backdrop').classList.add('gb-visible');
  document.getElementById('guestbook-btn').classList.add('gb-open');
  gbPage = 0;
  loadGuestbookEntries();
}

function closeGuestbook() {
  gbPanelOpen = false;
  document.getElementById('gb-panel').classList.remove('gb-visible');
  document.getElementById('gb-backdrop').classList.remove('gb-visible');
  document.getElementById('guestbook-btn').classList.remove('gb-open');
  document.getElementById('gb-error').style.display = 'none';
  document.getElementById('gb-success').style.display = 'none';
  document.getElementById('gb-name-input').value = '';
  history.replaceState(null, '', window.location.pathname);
}

// ============================================================
// ADMIN
// ============================================================
function showGuestbookAdminOverlay() {
  var panel = document.getElementById('gb-panel');
  if (!panel) { setTimeout(showGuestbookAdminOverlay, 200); return; }
  openGuestbook();
  document.getElementById('gb-admin-overlay').classList.add('gb-visible');
}

function closeGuestbookAdminOverlay() {
  document.getElementById('gb-admin-overlay').classList.remove('gb-visible');
  document.getElementById('gb-admin-pw-input').value = '';
  document.getElementById('gb-admin-error').style.display = 'none';
  history.replaceState(null, '', window.location.pathname);
}

function submitGuestbookAdminPassword() {
  var pw = document.getElementById('gb-admin-pw-input').value;
  fetch(GB_WORKER + '/guestbook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'test', password: pw })
  }).then(function(res) {
    if (res.status === 401) {
      document.getElementById('gb-admin-error').style.display = 'block';
      return;
    }
    gbIsAdmin = true;
    gbAdminPassword = pw;
    closeGuestbookAdminOverlay();
    document.getElementById('gb-admin-badge').style.display = 'inline';
    renderGuestbookEntries();
  }).catch(function() {
    var err = document.getElementById('gb-admin-error');
    err.textContent = 'Could not connect to server.';
    err.style.display = 'block';
  });
}

// ============================================================
// ENTRIES
// ============================================================
function loadGuestbookEntries() {
  document.getElementById('gb-entries').innerHTML = '<p class="gb-loading">Loading...</p>';
  fetch(GB_WORKER + '/guestbook').then(function(res) {
    return res.json();
  }).then(function(data) {
    gbEntries = data || [];
    renderGuestbookEntries();
  }).catch(function() {
    document.getElementById('gb-entries').innerHTML = '<p class="gb-empty">Failed to load entries.</p>';
  });
}

function renderGuestbookEntries() {
  var container = document.getElementById('gb-entries');
  var pagination = document.getElementById('gb-pagination');

  if (!gbEntries || gbEntries.length === 0) {
    container.innerHTML = '<p class="gb-empty">No entries yet. Be the first to sign!</p>';
    pagination.innerHTML = '';
    return;
  }

  var totalPages = Math.ceil(gbEntries.length / GB_PAGE_SIZE);
  var start = gbPage * GB_PAGE_SIZE;
  var end = Math.min(start + GB_PAGE_SIZE, gbEntries.length);
  var pageEntries = gbEntries.slice(start, end);

  container.innerHTML = pageEntries.map(function(entry) {
    var dateStr = new Date(entry.date).toLocaleDateString('en-GB');
    var deleteBtn = gbIsAdmin
      ? '<button class="gb-delete-btn" onclick="deleteGuestbookEntry(\'' + entry.id + '\', \'' + escapeHtml(entry.name).replace(/'/g, "\\'") + '\')" title="Delete">\u2715</button>'
      : '';
    return '<div class="gb-entry">' +
      deleteBtn +
      '<span class="gb-entry-name">' + escapeHtml(entry.name) + '</span>' +
      '<span class="gb-entry-date">' + dateStr + '</span>' +
      '</div>';
  }).join('');

  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  var paginationHTML = '<div class="gb-pages">';
  paginationHTML += '<button class="gb-page-btn" onclick="gbGoToPage(' + (gbPage - 1) + ')" ' + (gbPage === 0 ? 'disabled' : '') + '>\u2039</button>';
  for (var i = 0; i < totalPages; i++) {
    paginationHTML += '<button class="gb-page-btn' + (i === gbPage ? ' active' : '') + '" onclick="gbGoToPage(' + i + ')">' + (i + 1) + '</button>';
  }
  paginationHTML += '<button class="gb-page-btn" onclick="gbGoToPage(' + (gbPage + 1) + ')" ' + (gbPage === totalPages - 1 ? 'disabled' : '') + '>\u203a</button>';
  paginationHTML += '</div>';
  pagination.innerHTML = paginationHTML;
}

function gbGoToPage(page) {
  var totalPages = Math.ceil(gbEntries.length / GB_PAGE_SIZE);
  if (page < 0 || page >= totalPages) return;
  gbPage = page;
  renderGuestbookEntries();
  document.getElementById('gb-entries-wrap').scrollTop = 0;
}

function deleteGuestbookEntry(id, name) {
  var doDelete = confirm('Delete entry for "' + name + '"?');
  if (!doDelete) return;

  var banName = confirm('Also add "' + name + '" to the profanity list to block it in future?');

  fetch(GB_WORKER + '/guestbook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'delete',
      password: gbAdminPassword,
      id: id,
      banName: banName ? name : ''
    })
  }).then(function() {
    gbEntries = gbEntries.filter(function(e) { return e.id !== id; });
    renderGuestbookEntries();
  });
}

// ============================================================
// SIGN
// ============================================================
function signGuestbook() {
  var name = document.getElementById('gb-name-input').value.trim();
  var errorEl = document.getElementById('gb-error');
  var successEl = document.getElementById('gb-success');
  errorEl.style.display = 'none';
  successEl.style.display = 'none';

  if (!name) {
    errorEl.textContent = 'Please enter a name.';
    errorEl.style.display = 'block';
    return;
  }

  var signBtn = document.getElementById('gb-sign-btn');
  signBtn.disabled = true;
  signBtn.textContent = 'Signing...';

  var payload = { name: name };
  if (gbIsAdmin) payload.password = gbAdminPassword;

  fetch(GB_WORKER + '/guestbook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(function(res) {
    return res.json().then(function(data) {
      return { status: res.status, data: data };
    });
  }).then(function(result) {
    signBtn.disabled = false;
    signBtn.textContent = 'Sign';
    if (result.status !== 200) {
      errorEl.textContent = result.data.error || 'Something went wrong.';
      errorEl.style.display = 'block';
      return;
    }
    document.getElementById('gb-name-input').value = '';
    successEl.style.display = 'block';
    gbEntries.unshift(result.data.entry);
    gbPage = 0;
    renderGuestbookEntries();
  }).catch(function() {
    signBtn.disabled = false;
    signBtn.textContent = 'Sign';
    errorEl.textContent = 'Could not connect. Please try again.';
    errorEl.style.display = 'block';
  });
}

// ============================================================
// HELPERS
// ============================================================
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}