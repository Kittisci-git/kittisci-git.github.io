---
title: "News"
date: 2026-03-07
type: "page"
menu:
  main:
    weight: 2
---

<div class="news-tabs">
  <button class="news-tab active" onclick="showTab('nasa', this)">NASA</button>
  <button class="news-tab" onclick="showTab('esa', this)">ESA</button>
  <button class="news-tab" onclick="showTab('astro-ph-ga', this)">Galactic Astrophysics</button>
  <button class="news-tab" onclick="showTab('astro-ph-co', this)">Cosmology and Nongalactic Astrophysics</button>
  <button class="news-tab" onclick="showTab('astro-ph-ep', this)">Earth and Planetary Astrophysics</button>
  <button class="news-tab" onclick="showTab('astro-ph-he', this)">High Energy Astrophysical Phenomena</button>
  <button class="news-tab" onclick="showTab('astro-ph-im', this)">Instrumentation and Methods for Astrophysics</button>
  <button class="news-tab" onclick="showTab('astro-ph-sr', this)">Solar and Stellar Astrophysics</button>
  <button class="news-tab" onclick="showTab('gr-qc', this)">General Relativity and Quantum Cosmology</button>
  <button class="news-tab" onclick="showTab('space-ph', this)">Space Physics</button>
</div>

<div class="news-layout">
  <div class="news-left">
    <h2>Kittisci's Picks</h2>
    <p>Coming soon.</p>
  </div>
  <div class="news-right">
    <div id="nasa" class="news-panel"><div id="nasa-feed"></div></div>
    <div id="esa" class="news-panel hidden"><div id="esa-feed"></div></div>
    <div id="astro-ph-ga" class="news-panel hidden"><div id="astro-ph-ga-feed"></div></div>
    <div id="astro-ph-co" class="news-panel hidden"><div id="astro-ph-co-feed"></div></div>
    <div id="astro-ph-ep" class="news-panel hidden"><div id="astro-ph-ep-feed"></div></div>
    <div id="astro-ph-he" class="news-panel hidden"><div id="astro-ph-he-feed"></div></div>
    <div id="astro-ph-im" class="news-panel hidden"><div id="astro-ph-im-feed"></div></div>
    <div id="astro-ph-sr" class="news-panel hidden"><div id="astro-ph-sr-feed"></div></div>
    <div id="gr-qc" class="news-panel hidden"><div id="gr-qc-feed"></div></div>
    <div id="space-ph" class="news-panel hidden"><div id="space-ph-feed"></div></div>
  </div>
</div>

<script>
function showTab(id, btn) {
  document.querySelectorAll('.news-panel').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.news-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.remove('hidden');
  btn.classList.add('active');
}

const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

async function fetchFeed(url) {
  const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  if (doc.getElementsByTagName('item').length === 0) {
    return parser.parseFromString(text, 'text/xml');
  }
  return doc;
}

async function loadFeed(url, containerId, sourceName) {
  const container = document.getElementById(containerId);
  container.innerHTML = '<p>Loading...</p>';
  let allItems = [];

  try {
    const xml = await fetchFeed(url);
    const items = Array.from(xml.getElementsByTagName('item'));
    items.forEach(item => {
      const pubDateText = item.getElementsByTagName('pubDate')[0]?.textContent;
      const pubDate = pubDateText ? new Date(pubDateText) : new Date();
      
      let link = item.getElementsByTagName('link')[0]?.textContent || '';
      const guid = item.getElementsByTagName('guid')[0]?.textContent || '';

      if (!link.startsWith('http') && guid.startsWith('http')) link = guid;

      if (!link.startsWith('http')) {
        link = 'https://www.esa.int/Science_Exploration/Space_Science';
      }

      const title = item.getElementsByTagName('title')[0]?.textContent?.trim() || 'Untitled';

      if (!pubDateText || pubDate > oneMonthAgo) {
        allItems.push({ title, link, date: pubDate, source: sourceName });
      }
    });
  } catch (e) {
    container.innerHTML = '<p>Failed to load feed.</p>';
    return;
  }

  allItems.sort((a, b) => b.date - a.date);

  if (allItems.length === 0) {
    container.innerHTML = '<p>No recent stories found.</p>';
    return;
  }

  container.innerHTML = allItems.map(item => `
    <div class="news-item">
      <a href="${item.link}" target="_blank">${item.title}</a>
      <small>${item.source} — ${item.date.toLocaleDateString('en-GB')}</small>
    </div>
  `).join('');
}

function getArxivDateRange() {
  const now = new Date();
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const format = d => d.getUTCFullYear().toString() +
    String(d.getUTCMonth() + 1).padStart(2, '0') +
    String(d.getUTCDate()).padStart(2, '0') + '0000';
  return `[${format(monthAgo)}+TO+${format(now)}]`;
}

async function loadArxivCategory(cat, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '<p>Loading...</p>';
  const dateRange = getArxivDateRange();
  let allItems = [];

  try {
    const apiUrl = `https://export.arxiv.org/api/query?search_query=cat:${cat}+AND+submittedDate:${dateRange}&max_results=50&sortBy=submittedDate&sortOrder=descending`;
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(apiUrl)}`;
    const response = await fetch(proxyUrl);
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const entries = Array.from(xml.getElementsByTagName('entry'));

    entries.forEach(entry => {
      const published = entry.getElementsByTagName('published')[0]?.textContent;
      const title = entry.getElementsByTagName('title')[0]?.textContent?.trim();
      const id = entry.getElementsByTagName('id')[0]?.textContent?.trim();
      if (title && id) {
        allItems.push({ title, link: id, date: new Date(published), source: `arXiv:${cat}` });
      }
    });
  } catch (e) {
    container.innerHTML = '<p>Failed to load feed.</p>';
    return;
  }

  allItems.sort((a, b) => b.date - a.date);

  if (allItems.length === 0) {
    container.innerHTML = '<p>No recent papers found.</p>';
    return;
  }

  container.innerHTML = allItems.map(item => `
    <div class="news-item">
      <a href="${item.link}" target="_blank">${item.title}</a>
      <small>${item.source} — ${item.date.toLocaleDateString('en-GB')}</small>
    </div>
  `).join('');
}

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
</script>