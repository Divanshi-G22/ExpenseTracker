document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const email    = document.getElementById('Email').value;
  const password = document.getElementById('password').value;

  if (email === '' || password === '') {
    alert('Please fill in all fields');
    return;
  }

  // redirect to dashboard
  window.location.href = 'dashboard.html';
});

// ===== Spendsight: app.js =====
// One shared file for every page. Each block below only runs if that
// page's key element exists, so this is safe to include everywhere.
//
// Shared localStorage keys:
//   spendsight_txns     -> array of { merchant, category, amount, date, entryType }
//   spendsight_events   -> array of { name, date, budget, saved }
//   spendsight_notes    -> array of { eventName, title, items: [{text, done}] }
//   spendsight_profile  -> { name, email, budget }

document.addEventListener('DOMContentLoaded', () => {
  seedDefaultsIfEmpty();
  syncSidebarUser();

  if (document.getElementById('valSpent'))       initDashboard();
  if (document.getElementById('addTxnBtn'))      initTransactions();
  if (document.getElementById('addEventBtn'))    initEvents();
  if (document.getElementById('addNoteBtn'))     initNotes();
  if (document.getElementById('saveProfileBtn')) initProfile();
});

// ---------------------------------------------------------------------
// shared helpers
// ---------------------------------------------------------------------

function fmt(n) {
  return '₹' + parseFloat(n || 0).toLocaleString('en-IN');
}

function daysLeft(d) {
  return Math.ceil((new Date(d) - new Date()) / 86400000);
}

function dClass(d) {
  return d <= 10 ? 'urgent' : d <= 20 ? 'soon' : 'ok';
}

const badgeStyle = {
  Food: 'background:#5C2E2E15;color:#5C2E2E', Travel: 'background:#2E3F5C15;color:#2E3F5C',
  Shopping: 'background:#D4B48322;color:#C4A06A', Bills: 'background:#C4A06A22;color:#C4A06A',
  Gifts: 'background:#7A3A3A18;color:#7A3A3A'
};

function getTxns()    { return JSON.parse(localStorage.getItem('spendsight_txns')    || '[]'); }
function saveTxns(v)  { localStorage.setItem('spendsight_txns', JSON.stringify(v)); }
function getEvents()  { return JSON.parse(localStorage.getItem('spendsight_events')  || '[]'); }
function saveEvents(v){ localStorage.setItem('spendsight_events', JSON.stringify(v)); }
function getNotes()   { return JSON.parse(localStorage.getItem('spendsight_notes')   || '[]'); }
function saveNotes(v) { localStorage.setItem('spendsight_notes', JSON.stringify(v)); }
function getEventNames() { return getEvents().map(e => e.name); }

function syncSidebarUser() {
  const profile = JSON.parse(localStorage.getItem('spendsight_profile') || '{}');
  const nameEl = document.querySelector('.s-uname');
  const emailEl = document.querySelector('.s-uemail');
  if (nameEl && profile.name) nameEl.textContent = profile.name;
  if (emailEl && profile.email) emailEl.textContent = profile.email;
}

function seedDefaultsIfEmpty() {
  if (!localStorage.getItem('spendsight_profile')) {
    localStorage.setItem('spendsight_profile', JSON.stringify({
      name: 'Divanshi Sharma', email: 'divanshi@mail.com', budget: 45000
    }));
  }
  if (!localStorage.getItem('spendsight_txns')) {
    localStorage.setItem('spendsight_txns', JSON.stringify([
      { merchant: 'Swiggy',        category: 'Food',     amount: 642,  date: '05 Sep 2026', entryType: 'Manual' },
      { merchant: 'Uber',          category: 'Travel',   amount: 289,  date: '05 Sep 2026', entryType: 'Csv' },
      { merchant: 'Amazon',        category: 'Shopping', amount: 3499, date: '04 Sep 2026', entryType: 'Csv' },
      { merchant: 'Zomato',        category: 'Food',     amount: 830,  date: '03 Sep 2026', entryType: 'Manual' },
      { merchant: 'Airtel Postpaid', category: 'Bills',  amount: 799,  date: '02 Sep 2026', entryType: 'Csv' },
      { merchant: 'BigBasket',     category: 'Food',     amount: 2145, date: '02 Sep 2026', entryType: 'Csv' },
      { merchant: 'IRCTC',         category: 'Travel',   amount: 1560, date: '01 Sep 2026', entryType: 'Manual' },
      { merchant: 'Tanishq',       category: 'Gifts',    amount: 8200, date: '31 Aug 2026', entryType: 'Manual' },
      { merchant: 'Myntra',        category: 'Shopping', amount: 2299, date: '30 Aug 2026', entryType: 'Csv' },
      { merchant: 'Tata Power',    category: 'Bills',    amount: 1420, date: '29 Aug 2026', entryType: 'Csv' }
    ]));
  }
  if (!localStorage.getItem('spendsight_events')) {
    localStorage.setItem('spendsight_events', JSON.stringify([
      { name: 'Diwali Celebration', date: '2026-11-08', budget: 25000, saved: 14200 },
      { name: "Aarav's Birthday",   date: '2026-09-14', budget: 8000,  saved: 6500 },
      { name: "Meera's Wedding",    date: '2026-09-22', budget: 40000, saved: 18900 },
      { name: 'Goa Trip',           date: '2026-12-18', budget: 30000, saved: 7400 },
      { name: 'Anniversary Dinner', date: '2026-09-18', budget: 5000,  saved: 4800 }
    ]));
  }
  if (!localStorage.getItem('spendsight_notes')) {
    localStorage.setItem('spendsight_notes', JSON.stringify([
      { eventName: 'Diwali Celebration', title: 'Diwali Shopping List', items: [
        { text: 'Order diyas & rangoli colours', done: true },
        { text: "Sweets from Haldiram's", done: true },
        { text: 'Gift hampers for neighbours', done: false },
        { text: 'New curtains', done: false }
      ]},
      { eventName: "Meera's Wedding", title: 'Wedding Checklist', items: [
        { text: 'Tailor fitting for lehenga', done: true },
        { text: 'Book cab for baraat', done: false },
        { text: 'Shagun envelopes', done: true },
        { text: 'Mehendi artist advance', done: false },
        { text: 'Hotel booking', done: false }
      ]},
      { eventName: 'Anniversary Dinner', title: 'Anniversary Ideas', items: [
        { text: 'Reserve table at Olive', done: true },
        { text: 'Order flowers', done: false }
      ]},
      { eventName: "Aarav's Birthday", title: 'Birthday Prep', items: [
        { text: 'Book chocolate truffle cake', done: true },
        { text: 'Balloons & decor', done: false },
        { text: 'Return gifts for kids', done: false }
      ]},
      { eventName: 'Goa Trip', title: 'Goa Trip Plan', items: [
        { text: 'Compare flight fares', done: false },
        { text: 'Shortlist beach stays', done: true }
      ]}
    ]));
  }
}

// ---------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------

function initDashboard() {
  const txns    = getTxns();
  const events  = getEvents();
  const profile = JSON.parse(localStorage.getItem('spendsight_profile') || '{}');
  const budget  = parseFloat(profile.budget || 0);

  const setCard = (valId, valText, subId, subText) => {
    const val = document.getElementById(valId);
    const sub = document.getElementById(subId);
    if (!val) return;
    val.textContent = valText;
    val.className = 'sc-value';
    if (sub) { sub.textContent = subText; sub.className = 'sc-sub'; }
  };

  const totalSpent = txns.reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  if (totalSpent > 0) setCard('valSpent', fmt(totalSpent), 'subSpent', 'Sep 2026');
  if (budget > 0) {
    const rem = budget - totalSpent;
    setCard('valBudget', fmt(rem), 'subBudget', 'of ' + fmt(budget));
  }
  if (events.length > 0) setCard('valEvents', events.length, 'subEvents', 'next 60 days');

  // bar chart: spending by category
  const catColors = { Food: '#5C2E2E', Travel: '#2E3F5C', Shopping: '#D4B483', Bills: '#C4A06A', Gifts: '#7A3A3A' };
  const catTotals = { Food: 0, Travel: 0, Shopping: 0, Bills: 0, Gifts: 0 };
  txns.forEach(t => { if (catTotals[t.category] !== undefined) catTotals[t.category] += parseFloat(t.amount || 0); });
  const maxCat = Math.max(...Object.values(catTotals));

  if (maxCat > 0) {
    document.getElementById('chartEmpty').style.display = 'none';
    document.getElementById('barsContainer').style.display = 'flex';
    Object.entries(catTotals).forEach(([cat, val]) => {
      const key = cat.toLowerCase();
      const bar = document.getElementById('bar-' + key);
      const amt = document.getElementById('amt-' + key);
      if (bar && val > 0) {
        bar.style.height = Math.max((val / maxCat) * 100, 4) + '%';
        bar.style.background = catColors[cat];
        amt.textContent = fmt(val);
      }
    });
  }

  // recent transactions
  if (txns.length > 0) {
    document.getElementById('txnEmpty').style.display = 'none';
    const list = document.getElementById('txnList');
    [...txns].reverse().slice(0, 6).forEach(t => {
      list.innerHTML += `<div class="txn-row">
        <span class="txn-merchant">${t.merchant || '—'}</span>
        <span class="badge" style="${badgeStyle[t.category] || ''}">${t.category || ''}</span>
        <span class="txn-date">${t.date || ''}</span>
        <span class="txn-amt">${fmt(t.amount)}</span>
      </div>`;
    });
  }

  // upcoming events
  if (events.length > 0) {
    const upcoming = events.filter(e => daysLeft(e.date) >= 0).sort((a, b) => new Date(a.date) - new Date(b.date));
    if (upcoming.length > 0) {
      document.getElementById('evtEmpty').style.display = 'none';
      const list = document.getElementById('evtList');
      upcoming.slice(0, 5).forEach(e => {
        const d = daysLeft(e.date);
        list.innerHTML += `<div class="ev-row">
          <div><div class="ev-name">${e.name}</div>
          <div class="ev-date">${new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div></div>
          <span class="days-badge ${dClass(d)}">${d} days</span>
        </div>`;
      });
    }
  }
}

// ---------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------

function initTransactions() {
  renderTransactions();
  document.getElementById('addTxnBtn').addEventListener('click', addTransactionFlow);
  document.getElementById('uploadCsvBtn').addEventListener('click', uploadCsvFlow);
}

function renderTransactions() {
  const txns = getTxns();
  document.getElementById('txnCount').textContent = `${txns.length} record${txns.length === 1 ? '' : 's'} this period`;

  const body = document.getElementById('txnTableBody');
  const empty = document.getElementById('txnEmptyState');
  body.innerHTML = '';

  if (txns.length === 0) { empty.style.display = 'flex'; return; }
  empty.style.display = 'none';

  [...txns].reverse().forEach(t => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="td-merchant">${t.merchant || '—'}</td>
      <td><span class="badge" style="${badgeStyle[t.category] || ''}">${t.category || ''}</span></td>
      <td class="td-amt">${fmt(t.amount)}</td>
      <td class="td-date">${t.date || ''}</td>
      <td class="td-entry">${t.entryType || 'Manual'}</td>
    `;
    body.appendChild(row);
  });
}

function addTransactionFlow() {
  const merchant = prompt('Merchant name:');
  if (!merchant) return;
  const category = prompt('Category (Food, Travel, Shopping, Bills, Gifts):', 'Food');
  const amount = parseFloat(prompt('Amount (₹):', '0')) || 0;
  const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const txns = getTxns();
  txns.push({ merchant, category, amount, date, entryType: 'Manual' });
  saveTxns(txns);
  renderTransactions();
}

function uploadCsvFlow() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const rows = e.target.result.split('\n').map(r => r.trim()).filter(Boolean);
      const dataRows = rows.slice(1); // expects header: merchant,category,amount,date
      const txns = getTxns();
      dataRows.forEach(r => {
        const [merchant, category, amount, date] = r.split(',');
        if (merchant) txns.push({ merchant, category, amount: parseFloat(amount) || 0, date, entryType: 'Csv' });
      });
      saveTxns(txns);
      renderTransactions();
    };
    reader.readAsText(file);
  });
  input.click();
}

// ---------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------

function initEvents() {
  renderEvents();
  document.getElementById('addEventBtn').addEventListener('click', addEventFlow);
}

function renderEvents() {
  const events = getEvents();
  const grid = document.getElementById('eventsGrid');
  const empty = document.getElementById('eventsEmptyState');
  grid.innerHTML = '';

  if (events.length === 0) { empty.style.display = 'flex'; return; }
  empty.style.display = 'none';

  [...events]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach(e => {
      const d = daysLeft(e.date);
      const pct = e.budget > 0 ? Math.min(Math.round((e.saved / e.budget) * 100), 100) : 0;
      const card = document.createElement('div');
      card.className = 'glass event-card';
      card.innerHTML = `
        <div class="ev-card-name">${e.name}</div>
        <div class="ev-card-date">${new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
        <span class="days-badge ${dClass(d)}" style="display:inline-block; margin-bottom:12px;">${d >= 0 ? d + ' days left' : 'past'}</span>
        <div class="ev-card-budget">Budget ${fmt(e.budget)}</div>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="ev-card-saved">${fmt(e.saved)} saved · ${pct}%</div>
      `;
      grid.appendChild(card);
    });
}

function addEventFlow() {
  const name = prompt('Event name:');
  if (!name) return;
  const dateStr = prompt('Event date (YYYY-MM-DD):');
  if (!dateStr) return;
  const budget = parseFloat(prompt('Budget (₹):', '0')) || 0;
  const saved = parseFloat(prompt('Already saved (₹):', '0')) || 0;

  const events = getEvents();
  events.push({ name, date: dateStr, budget, saved });
  saveEvents(events);
  renderEvents();
}

// ---------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------

function initNotes() {
  renderNotes();
  document.getElementById('addNoteBtn').addEventListener('click', addNoteFlow);
}

function renderNotes() {
  const notes = getNotes();
  const grid = document.getElementById('notesGrid');
  const empty = document.getElementById('notesEmptyState');
  grid.innerHTML = '';

  if (notes.length === 0) { empty.style.display = 'flex'; return; }
  empty.style.display = 'none';

  notes.forEach((note, noteIdx) => {
    const card = document.createElement('div');
    card.className = 'glass note-card';

    const itemsHtml = note.items.map((item, itemIdx) => `
      <label class="note-item ${item.done ? 'done' : ''}" data-note="${noteIdx}" data-item="${itemIdx}">
        <input type="checkbox" ${item.done ? 'checked' : ''}/>
        <span>${item.text}</span>
      </label>
    `).join('');

    card.innerHTML = `
      <span class="note-tag">${note.eventName}</span>
      <div class="note-title">${note.title}</div>
      ${itemsHtml}
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.note-item input').forEach(cb => {
    cb.addEventListener('change', e => {
      const label = e.target.closest('.note-item');
      const noteIdx = parseInt(label.dataset.note, 10);
      const itemIdx = parseInt(label.dataset.item, 10);
      const notes = getNotes();
      notes[noteIdx].items[itemIdx].done = e.target.checked;
      saveNotes(notes);
      renderNotes();
    });
  });
}

function addNoteFlow() {
  const eventNames = getEventNames();
  const eventName = prompt(`Link to which event?\n(${eventNames.join(', ') || 'no events yet'})`);
  if (!eventName) return;
  const title = prompt('Note title:', 'Checklist');
  if (!title) return;
  const itemsRaw = prompt('Checklist items, comma-separated:');
  const items = (itemsRaw || '').split(',').map(t => t.trim()).filter(Boolean).map(text => ({ text, done: false }));

  const notes = getNotes();
  notes.push({ eventName, title, items });
  saveNotes(notes);
  renderNotes();
}


// Profile
 

function initProfile() {
  loadProfileIntoForm();
  document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
}

function loadProfileIntoForm() {
  const profile = JSON.parse(localStorage.getItem('spendsight_profile') || '{}');
  document.getElementById('fName').value = profile.name || '';
  document.getElementById('fEmail').value = profile.email || '';
  document.getElementById('fBudget').value = profile.budget || '';
}

function saveProfile() {
  const profile = {
    name: document.getElementById('fName').value.trim(),
    email: document.getElementById('fEmail').value.trim(),
    budget: parseFloat(document.getElementById('fBudget').value) || 0
  };
  localStorage.setItem('spendsight_profile', JSON.stringify(profile));
  syncSidebarUser();

  const msg = document.getElementById('saveMsg');
  msg.classList.add('show');
  setTimeout(() => msg.classList.remove('show'), 2000);
}
