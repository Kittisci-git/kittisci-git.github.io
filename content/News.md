---
title: "News"
date: 2026-03-07
type: "page"
menu:
  main:
    weight: 2
---

<style>
.news-left {
  width: 300px;
  flex-shrink: 0;
  padding-right: 1.5rem;
  border-right: 1px solid #424242;
}

.news-right {
  flex: 1;
  padding-left: 1.5rem;
  min-width: 0;
}

.news-item {
  position: relative;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #424242;
}

.news-item a {
  display: block;
  margin-bottom: 0.25rem;
  padding-right: 2rem;
}

.news-item small {
  font-size: 0.6em;
  opacity: 0.6;
}

.star-btn {
  position: absolute;
  top: 0.1rem;
  right: 0;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
  padding: 0;
  font-size: 1.5rem;
  line-height: 1;
  color: #888;
}

.news-item:hover .star-btn { opacity: 1; }

.picks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.picks-header h2 { margin: 0; }

.admin-badge {
  font-size: 0.7em;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255,183,77,0.15);
  color: #ffb74d;
  border: 1px solid rgba(255,183,77,0.3);
}

.pick-item {
  position: relative;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #424242;
}

.pick-item:last-child { border-bottom: none; }

.pick-item a {
  display: block;
  margin-bottom: 0.25rem;
  padding-right: 2rem;
}

.pick-item small {
  opacity: 0.6;
}

.pick-note {
  font-size: 0.85em;
  font-style: italic;
  margin-top: 0.3rem;
  line-height: 1.4;
}

.remove-btn {
  position: absolute;
  top: 0.1rem;
  right: 0;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
  padding: 0;
  color: #ef9a9a;
  font-size: 1rem;
  line-height: 1;
}

.pick-item:hover .remove-btn { opacity: 1; }

.see-older-btn {
  margin-top: 0.5rem;
  padding: 0.3rem 0.8rem;
  border: 1px solid #424242;
  background: transparent;
  color: #888;
  cursor: pointer;
  border-radius: 0.2rem;
  font-size: 0.8rem;
  transition: all 0.2s;
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
}

.see-older-btn:hover { border-color: #42a5f5; color: #42a5f5; }

.note-form {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.note-form textarea {
  background: #212121;
  border: 1px solid #424242;
  border-radius: 0.2rem;
  color: #dadada;
  font-size: 0.85em;
  padding: 0.3rem 0.5rem;
  font-family: inherit;
  resize: none;
}

.note-form textarea:focus { outline: none; border-color: #42a5f5; }

.note-form-btns {
  display: flex;
  gap: 0.4rem;
}

.note-form-btns button {
  flex: 1;
  padding: 0.3rem;
  border-radius: 0.2rem;
  border: 1px solid #424242;
  background: transparent;
  color: #888;
  cursor: pointer;
  font-size: 0.85em;
  transition: all 0.2s;
  -webkit-appearance: none;
  appearance: none;
}

.note-form-btns button.confirm { border-color: #42a5f5; color: #42a5f5; }

.pending-pick-box {
  background: #2a2a2a;
  border: 1px solid #424242;
  border-radius: 0.4rem;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}

.pending-pick-title {
  font-size: 0.85em;
  color: #888;
  margin-bottom: 0.4rem;
  line-height: 1.4;
}

.admin-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 100;
  align-items: center;
  justify-content: center;
}

.admin-overlay.visible { display: flex; }

.admin-box {
  background: #2a2a2a;
  border: 1px solid #424242;
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.admin-box h3 { font-size: 1.5em; margin: 0; }
.admin-box p { font-size: 0.8em; color: #888; margin: 0; }

.admin-box input[type="password"] {
  background: #212121;
  border: 1px solid #424242;
  border-radius: 0.2rem;
  color: #dadada;
  font-size: 0.95em;
  padding: 0.4rem 0.6rem;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}

.admin-box input[type="password"]:focus { outline: none; border-color: #42a5f5; }
.admin-error { font-size: 0.85em; color: #ef9a9a; display: none; }
.admin-box-btns { display: flex; gap: 0.5rem; }

.admin-box-btns button {
  flex: 1;
  padding: 0.4rem;
  border-radius: 0.2rem;
  border: 1px solid #424242;
  background: transparent;
  color: #888;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s;
  -webkit-appearance: none;
  appearance: none;
}

.admin-box-btns button.confirm { border-color: #42a5f5; color: #42a5f5; }
</style>

<div class="admin-overlay" id="admin-overlay">
  <div class="admin-box">
    <h3>Admin Access</h3>
    <p>Enter your password to enable picks management.</p>
    <input type="password" id="admin-password-input" placeholder="Password" />
    <div class="admin-error" id="admin-error">Incorrect password.</div>
    <div class="admin-box-btns">
      <button onclick="closeAdminOverlay()">Cancel</button>
      <button class="confirm" onclick="submitAdminPassword()">Unlock</button>
    </div>
  </div>
</div>

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
    <div class="picks-header">
      <h2>Kittisci's Picks</h2>
      <span class="admin-badge" id="admin-badge" style="display:none;">Admin</span>
    </div>
    <div id="picks-container"><p style="color:#888;font-size:0.85rem;">Loading picks...</p></div>
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

<script src="/js/news.js"></script>