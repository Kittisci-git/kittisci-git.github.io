var WORKER = 'https://kittisci-proxy.kittisci.workers.dev';
var oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
var isAdmin = false;
var adminPassword = '';
var pendingPickItem = null;
var picks = [];

// ============================================================
// ADMIN
// ============================================================
function checkAdminHash() {
  if (window.location.hash === '#admin') {
    document.getElementById('admin-overlay').classList.add('visible');
  }
}
window.addEventListener('hashchange', checkAdminHash);
checkAdminHash();

function closeAdminOverlay() {
  document.getElementById('admin-overlay').classList.remove('visible');
  document.getElementById('admin-password-input').value = '';
  document.getElementById('admin-error').style.display = 'none';
  history.replaceState(null, '', window.location.pathname);
}

function submitAdminPassword() {
  var pw = document.getElementById('admin-password-input').value;
  fetch(WORKER + '/picks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: pw, picks: null, test: true })
  }).then(function(res) {
    if (res.status === 401) {
      document.getElementById('admin-error').style.display = 'block';
      return;
    }
    isAdmin = true;
    adminPassword = pw;
    closeAdminOverlay();
    document.getElementById('admin-badge').style.display = 'inline';
    renderFeedStarButtons();
    renderPicks();
  }).catch(function() {
    var err = document.getElementById('admin-error');
    err.textContent = 'Could not connect to server.';
    err.style.display = 'block';
  });
}

// ============================================================
// PICKS
// ============================================================
function loadPicks() {
  fetch(WORKER + '/picks').then(function(res) {
    return res.json();
  }).then(function(data) {
    picks = data || [];
    renderPicks();
  }).catch(function() {
    picks = [];
    renderPicks();
  });
}

function renderPicks() {
  var container = document.getElementById('picks-container');
  if (!picks || picks.length === 0) {
    container.innerHTML = '<p style="color:#888;">No picks yet.</p>';
    return;
  }
  var sorted = picks.slice().sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
  var cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 1);
  var recent = sorted.filter(function(p) { return new Date(p.date) >= cutoff; });
  var older  = sorted.filter(function(p) { return new Date(p.date) < cutoff; });
  var html = recent.map(pickHTML).join('');
  if (older.length > 0) {
    var label = older.length === 1 ? '1 older pick' : older.length + ' older picks';
    html += '<button class="see-older-btn" onclick="expandOlderPicks(this)">See ' + label + ' \u25be</button>';
    html += '<div id="older-picks" style="display:none;">' + older.map(pickHTML).join('') + '</div>';
  }
  container.innerHTML = html || '<p style="color:#888;">No picks yet.</p>';
}

function expandOlderPicks(btn) {
  document.getElementById('older-picks').style.display = 'block';
  btn.style.display = 'none';
}

function pickHTML(pick) {
  var dateStr = new Date(pick.date).toLocaleDateString('en-GB');
  var removeBtn = isAdmin ? '<button class="remove-btn" onclick="removePick(\'' + pick.id + '\')" title="Remove">\u2715</button>' : '';
  var note = pick.note ? '<div class="pick-note">' + pick.note + '</div>' : '';
  return '<div class="pick-item" id="pick-' + pick.id + '">' + removeBtn + '<a href="' + pick.link + '" target="_blank">' + pick.title + '</a>' + note + '<small>' + pick.source + ' \u2014 ' + dateStr + '</small>' + '</div>';
}

function savePicks() {
  return fetch(WORKER + '/picks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: adminPassword, picks: picks })
  });
}

function removePick(id) {
  picks = picks.filter(function(p) { return p.id !== id; });
  savePicks().then(function() { renderPicks(); });
}

function startAddPick(item) {
  pendingPickItem = item;
  var container = document.getElementById('picks-container');
  var existing = document.getElementById('pending-pick-form');
  if (existing) existing.remove();
  var div = document.createElement('div');
  div.id = 'pending-pick-form';
  div.className = 'pending-pick-box';
  div.innerHTML = '<div class="pending-pick-title">Adding: <em>' + item.title + '</em></div><div class="note-form"><textarea id="pick-note-input" rows="2" placeholder="Add a short note (optional)..."></textarea><div class="note-form-btns"><button onclick="cancelAddPick()">Cancel</button><button class="confirm" onclick="confirmAddPick()">Add to Picks</button></div></div>';
  container.insertBefore(div, container.firstChild);
  document.getElementById('pick-note-input').focus();
}

function cancelAddPick() {
  pendingPickItem = null;
  var form = document.getElementById('pending-pick-form');
  if (form) form.remove();
}

function confirmAddPick() {
  if (!pendingPickItem) return;
  var note = document.getElementById('pick-note-input').value.trim();
  var newPick = {
    id: Date.now().toString(),
    title: pendingPickItem.title,
    link: pendingPickItem.link,
    source: pendingPickItem.source,
    date: pendingPickItem.date.toISOString(),
    note: note || ''
  };
  picks.unshift(newPick);
  savePicks().then(function() { cancelAddPick(); renderPicks(); });
}

// ============================================================
// FEEDS
// ============================================================
function showTab(id, btn) {
  document.querySelectorAll('.news-panel').forEach(function(p) { p.classList.add('hidden'); });
  document.querySelectorAll('.news-tab').forEach(function(t) { t.classList.remove('active'); });
  document.getElementById(id).classList.remove('hidden');
  btn.classList.add('active');
}

function renderFeedStarButtons() {
  if (!isAdmin) return;
  document.querySelectorAll('.news-item').forEach(function(item) {
    if (item.querySelector('.star-btn')) return;
    var anchor = item.querySelector('a');
    var small  = item.querySelector('small');
    if (!anchor) return;
    var title  = anchor.textContent.trim();
    var link   = anchor.href;
    var source = small ? small.textContent.split('\u2014')[0].trim() : '';
    var btn = document.createElement('button');
    btn.className = 'star-btn';
    btn.title = 'Add to picks';
    btn.innerHTML = '\u2605';
    btn.onclick = function(e) {
      e.preventDefault();
      startAddPick({ title: title, link: link, source: source, date: new Date() });
    };
    item.appendChild(btn);
  });
}

function fetchFeed(url) {
  var proxyUrl = WORKER + '/?url=' + encodeURIComponent(url);
  return fetch(proxyUrl).then(function(response) {
    return response.text();
  }).then(function(text) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(text, 'text/html');
    if (doc.getElementsByTagName('item').length === 0) {
      return parser.parseFromString(text, 'text/xml');
    }
    return doc;
  });
}

function loadFeed(url, containerId, sourceName) {
  var container = document.getElementById(containerId);
  container.innerHTML = '<p>Loading...</p>';
  fetchFeed(url).then(function(xml) {
    var items = Array.from(xml.getElementsByTagName('item'));
    var allItems = [];
    items.forEach(function(item) {
      var pubDateEl = item.getElementsByTagName('pubDate')[0];
      var pubDateText = pubDateEl ? pubDateEl.textContent : null;
      var pubDate = pubDateText ? new Date(pubDateText) : new Date();
      var linkEl = item.getElementsByTagName('link')[0];
      var guidEl = item.getElementsByTagName('guid')[0];
      var link = linkEl ? linkEl.textContent : '';
      var guid = guidEl ? guidEl.textContent : '';
      if (!link.startsWith('http') && guid.startsWith('http')) link = guid;
      if (!link.startsWith('http')) link = 'https://www.esa.int/Science_Exploration/Space_Science';
      var titleEl = item.getElementsByTagName('title')[0];
      var title = titleEl ? titleEl.textContent.trim() : 'Untitled';
      if (!pubDateText || pubDate > oneMonthAgo) {
        allItems.push({ title: title, link: link, date: pubDate, source: sourceName });
      }
    });
    allItems.sort(function(a, b) { return b.date - a.date; });
    if (allItems.length === 0) { container.innerHTML = '<p>No recent stories found.</p>'; return; }
    container.innerHTML = allItems.map(function(item) {
      return '<div class="news-item"><a href="' + item.link + '" target="_blank">' + item.title + '</a><small>' + item.source + ' \u2014 ' + item.date.toLocaleDateString('en-GB') + '</small></div>';
    }).join('');
    if (isAdmin) renderFeedStarButtons();
  }).catch(function() { container.innerHTML = '<p>Failed to load feed.</p>'; });
}

function getArxivDateRange() {
  var now = new Date();
  var monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  function format(d) {
    return d.getUTCFullYear().toString() + String(d.getUTCMonth() + 1).padStart(2, '0') + String(d.getUTCDate()).padStart(2, '0') + '0000';
  }
  return '[' + format(monthAgo) + '+TO+' + format(now) + ']';
}

function loadArxivCategory(cat, containerId) {
  var container = document.getElementById(containerId);
  container.innerHTML = '<p>Loading...</p>';
  var dateRange = getArxivDateRange();
  var apiUrl = 'https://export.arxiv.org/api/query?search_query=cat:' + cat + '+AND+submittedDate:' + dateRange + '&max_results=50&sortBy=submittedDate&sortOrder=descending';
  var proxyUrl = WORKER + '/?url=' + encodeURIComponent(apiUrl);
  fetch(proxyUrl).then(function(res) { return res.text(); }).then(function(text) {
    var parser = new DOMParser();
    var xml = parser.parseFromString(text, 'text/xml');
    var entries = Array.from(xml.getElementsByTagName('entry'));
    var allItems = [];
    entries.forEach(function(entry) {
      var publishedEl = entry.getElementsByTagName('published')[0];
      var titleEl = entry.getElementsByTagName('title')[0];
      var idEl = entry.getElementsByTagName('id')[0];
      var published = publishedEl ? publishedEl.textContent : null;
      var title = titleEl ? titleEl.textContent.trim() : null;
      var id = idEl ? idEl.textContent.trim() : null;
      if (title && id) {
        allItems.push({ title: title, link: id, date: new Date(published), source: 'arXiv:' + cat });
      }
    });
    allItems.sort(function(a, b) { return b.date - a.date; });
    if (allItems.length === 0) { container.innerHTML = '<p>No recent papers found.</p>'; return; }
    container.innerHTML = allItems.map(function(item) {
      return '<div class="news-item"><a href="' + item.link + '" target="_blank">' + item.title + '</a><small>' + item.source + ' \u2014 ' + item.date.toLocaleDateString('en-GB') + '</small></div>';
    }).join('');
    if (isAdmin) renderFeedStarButtons();
  }).catch(function() { container.innerHTML = '<p>Failed to load feed.</p>'; });
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('admin-password-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') submitAdminPassword();
  });
  loadPicks();
  loadFeed('https://www.nasa.gov/rss/dyn/breaking_news.rss', 'nasa-feed', 'NASA');
  loadFeed('https://www.esa.int/rssfeed/Our_Activities/Space_Science', 'esa-feed', 'ESA');
  loadArxivCategory('astro-ph.GA', 'astro-ph-ga-feed');
  loadArxivCategory('astro-ph.CO', 'astro-ph-co-feed');
  loadArxivCategory('astro-ph.EP', 'astro-ph-ep-feed');
  loadArxivCategory('astro-ph.HE', 'astro-ph-he-feed');
  loadArxivCategory('astro-ph.IM', 'astro-ph-im-feed');
  loadArxivCategory('astro-ph.SR', 'astro-ph-sr-feed');
  loadArxivCategory('gr-qc', 'gr-qc-feed');
  loadArxivCategory('physics.space-ph', 'space-ph-feed');
});
