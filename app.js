// ── DOM CACHING ─────────────────────────────────────────────────────────────
const DOM = {};

// ── STATE ────────────────────────────────────────────────────────────────────
let state = {
  deck: [],
  index: 0,
  flipped: false,
  correct: 0,
  wrong: 0,
  filterType: 'all',
  filterLevel: 'all',
  mode: 'sequential',
  wrongCards: [], 
};

// ── DB INITIALIZATION ────────────────────────────────────────────────────────
const DB_NAME = 'DePrepsTrainer';
const DB_VERSION = 1;
const STORE_NAME = 'cards';
let db;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function initDB() {
  db = await openDB();
  
  DOM.verbDisplay.textContent = "Checking data...";
  
  try {
    const res = await fetch('data/generated/content.json');
    const data = await res.json();
    
    const localBuildId = localStorage.getItem('dataBuildId');
    if (localBuildId !== data.buildId) {
      DOM.verbDisplay.textContent = "Updating database... Please wait.";
      
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.clear();
        
        data.items.forEach(item => {
          store.put(item);
        });
        
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      });
      
      localStorage.setItem('dataBuildId', data.buildId);
    }
  } catch (err) {
    console.error("Failed to fetch or update DB", err);
  }
}

// ── INIT & FETCH ─────────────────────────────────────────────────────────────
async function initApp() {
  // Cache DOM elements
  DOM.verbDisplay = document.getElementById('verb-display');
  DOM.cardNumber = document.getElementById('card-number');
  DOM.backVerb = document.getElementById('back-verb');
  DOM.prepEl = document.getElementById('back-prep');
  DOM.kasusBadge = document.getElementById('back-kasus');
  DOM.extraEl = document.getElementById('back-extra');
  DOM.exampleEl = document.getElementById('back-example');
  DOM.card = document.getElementById('card');
  DOM.progressBar = document.getElementById('progress-bar');
  DOM.progressText = document.getElementById('progress-text');
  DOM.totalCount = document.getElementById('total-count');
  DOM.correctCount = document.getElementById('correct-count');
  DOM.wrongCount = document.getElementById('wrong-count');
  DOM.doneScreen = document.getElementById('done-screen');
  DOM.doneCorrect = document.getElementById('done-correct');
  DOM.doneWrong = document.getElementById('done-wrong');
  DOM.donePct = document.getElementById('done-pct');
  DOM.btnWrongOnly = document.getElementById('btn-wrong-only');

  try {
    await initDB();
    
    // Attach event listeners for selects
    document.getElementById('filter-type').addEventListener('change', (e) => setFilterType(e.target.value));
    document.getElementById('filter-level').addEventListener('change', (e) => setFilterLevel(e.target.value));
    
    await restart();
  } catch (err) {
    console.error("Initialization error", err);
    DOM.verbDisplay.textContent = "Error initializing app.";
  }
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function buildDeck() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.openCursor();
    
    let source = [];
    
    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        const c = cursor.value;
        let matchType = true;
        let matchLevel = true;
        
        if (state.filterType !== 'all') {
          if (state.filterType === 'verb') {
            matchType = c.partOfSpeech === 'verb' || (c.type && c.type.includes('verb'));
          } else if (state.filterType === 'phrase') {
            matchType = c.type === 'phrase' || c.type === 'idiom';
          } else {
            matchType = c.type === state.filterType;
          }
        }
        
        if (matchType && state.filterLevel !== 'all') {
          matchLevel = c.levels && c.levels.includes(state.filterLevel);
        }
        
        if (matchType && matchLevel) {
          source.push(c);
        }
        
        cursor.continue();
      } else {
        if (state.mode === 'random') {
          source = shuffleArray(source);
        }
        resolve(source);
      }
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

function getCard() { return state.deck[state.index]; }

// ── RENDER ───────────────────────────────────────────────────────────────────
function render() {
  const card = getCard();
  if (!card) { showDone(); return; }

  // Front
  DOM.verbDisplay.textContent = card.term;
  DOM.cardNumber.textContent = `#${state.index + 1} / ${state.deck.length}`;

  // Back
  DOM.backVerb.textContent = card.term;
  
  // Clear previous state
  DOM.prepEl.textContent = '';
  DOM.prepEl.style.display = 'none';
  DOM.kasusBadge.style.display = 'none';
  DOM.extraEl.replaceChildren();
  DOM.exampleEl.replaceChildren();

  // Examples
  if (card.examples?.de) {
    DOM.exampleEl.appendChild(document.createTextNode(card.examples.de));
    if (card.examples?.en) {
      DOM.exampleEl.appendChild(document.createElement('br'));
      const enSpan = document.createElement('span');
      enSpan.className = 'example-en';
      enSpan.style.cssText = 'font-size: 13px; color: var(--text-dim); font-style: italic; margin-top: 4px; display: block;';
      enSpan.textContent = card.examples.en;
      DOM.exampleEl.appendChild(enSpan);
    }
  }

  // Render logic based on type
  if (card.type === 'verb_preposition' && card.grammar && card.grammar.valency && card.grammar.valency.length > 0) {
    const val = card.grammar.valency[0];
    if (val.preposition) {
      DOM.prepEl.textContent = val.preposition;
      DOM.prepEl.style.display = 'inline-block';
    }
    if (val.case) {
      DOM.kasusBadge.textContent = val.case;
      DOM.kasusBadge.className = 'kasus-badge' + (val.case.toLowerCase().includes('dat') && !val.case.toLowerCase().includes('akk') ? ' dat' : '');
      DOM.kasusBadge.style.display = 'inline-block';
    }
  }

  // Back Extra construction using DOM nodes
  if (card.translation) {
    const strong = document.createElement('strong');
    strong.textContent = card.translation;
    DOM.extraEl.appendChild(strong);
    DOM.extraEl.appendChild(document.createElement('br'));
  }
  
  if (card.partOfSpeech && card.partOfSpeech !== 'unknown') {
    const posDe = {
      'verb': 'Verb', 'noun': 'Nomen', 'adjective': 'Adjektiv', 'adverb': 'Adverb', 
      'pronoun': 'Pronomen', 'preposition': 'Präposition', 'conjunction': 'Konjunktion', 'phrase': 'Redewendung', 'idiom': 'Redewendung'
    }[card.partOfSpeech] || card.partOfSpeech;
    const posSmall = document.createElement('small');
    posSmall.style.cssText = 'color: var(--text-muted); text-transform: uppercase;';
    posSmall.textContent = posDe;
    DOM.extraEl.appendChild(posSmall);
    DOM.extraEl.appendChild(document.createElement('br'));
  }

  if (card.usage) {
    let freqColor = 'var(--text-muted)';
    const freq = card.usage.nativeFrequencyLabel || '';
    const reg = card.usage.register && card.usage.register !== 'unknown' ? card.usage.register : '';
    
    if (freq.toLowerCase().includes('high') || card.usage.nativeFrequencyRating >= 4) {
      freqColor = '#228b22';
    } else if (freq.toLowerCase().includes('medium') || card.usage.nativeFrequencyRating === 3) {
      freqColor = '#d97706';
    } else if (freq || card.usage.nativeFrequencyRating < 3) {
      freqColor = '#6b7280';
    }
    
    const freqDe = { 'Very High': 'Sehr Hoch', 'High': 'Hoch', 'Medium': 'Mittel', 'Low': 'Niedrig', 'Very Low': 'Sehr Niedrig' }[freq] || freq;
    let usageText = freqDe;
    if (reg) {
      const regDe = {
        'written': 'Geschrieben', 'spoken': 'Gesprochen', 'formal': 'Formell', 
        'informal': 'Informell', 'slang': 'Umgangssprache', 'elevated': 'Gehoben', 'archaic': 'Veraltet'
      }[reg] || (reg.charAt(0).toUpperCase() + reg.slice(1));
      usageText += usageText ? ` (${regDe})` : regDe;
    }
    
    if (usageText) {
      const usageSmall = document.createElement('small');
      usageSmall.style.cssText = `color: ${freqColor}; font-weight: 600;`;
      usageSmall.textContent = usageText;
      DOM.extraEl.appendChild(usageSmall);
      DOM.extraEl.appendChild(document.createElement('br'));
    }
  }

  if (card.type === 'konnektor' && card.grammar && card.grammar.verbPositionEffect) {
    const fx = card.grammar.verbPositionEffect.replace(/_/g, ' ').toUpperCase();
    const fxSmall = document.createElement('small');
    fxSmall.textContent = `Verbposition: ${fx}`;
    DOM.extraEl.appendChild(fxSmall);
    DOM.extraEl.appendChild(document.createElement('br'));
  }
  
  if (card.grammar && card.grammar.auxiliary) {
    const auxSmall = document.createElement('small');
    auxSmall.style.cssText = 'color: #228b22; font-weight: 600;';
    auxSmall.textContent = `Hilfsverb: ${card.grammar.auxiliary}`;
    DOM.extraEl.appendChild(auxSmall);
    DOM.extraEl.appendChild(document.createElement('br'));
  }

  // Flip state
  DOM.card.classList.toggle('flipped', state.flipped);

  // Progress
  const pct = ((state.index + 1) / state.deck.length) * 100;
  DOM.progressBar.style.setProperty('--pct', pct + '%');
  DOM.progressText.textContent = `${state.index + 1} / ${state.deck.length}`;

  // Stats
  DOM.totalCount.textContent = state.deck.length;
  DOM.correctCount.textContent = state.correct;
  DOM.wrongCount.textContent = state.wrong;
}

// ── FLIP ─────────────────────────────────────────────────────────────────────
function flipCard() {
  if (state.flipped) return; // only flip to back from front
  state.flipped = true;
  render();
}

// ── ANSWER ───────────────────────────────────────────────────────────────────
function markCorrect() {
  state.correct++;
  nextCard();
}
function markWrong() {
  state.wrong++;
  const card = getCard();
  // Prevent duplicate wrong cards
  if (!state.wrongCards.some(c => c.id === card.id)) {
    state.wrongCards.push(card);
  }
  nextCard();
}

function nextCard() {
  state.index++;
  state.flipped = false;
  if (state.index >= state.deck.length) { showDone(); return; }
  render();
}

function prevCard() {
  if (state.index <= 0) return;
  state.index--;
  state.flipped = false;
  render();
}

// ── DONE ─────────────────────────────────────────────────────────────────────
function showDone() {
  DOM.doneScreen.style.display = 'flex';
  const total = state.correct + state.wrong;
  const pct = total > 0 ? Math.round((state.correct / total) * 100) : 0;
  DOM.doneCorrect.textContent = state.correct;
  DOM.doneWrong.textContent = state.wrong;
  DOM.donePct.textContent = pct + '%';
  DOM.btnWrongOnly.style.display = state.wrongCards.length > 0 ? 'block' : 'none';
}

function hideDone() {
  DOM.doneScreen.style.display = 'none';
}

async function restart(deck) {
  DOM.verbDisplay.textContent = "Loading cards...";
  state.deck = deck || await buildDeck();
  state.index = 0;
  state.flipped = false;
  state.correct = 0;
  state.wrong = 0;
  state.wrongCards = [];
  hideDone();
  
  if (state.deck.length === 0) {
    DOM.verbDisplay.textContent = "No cards match filter.";
  } else {
    render();
  }
}

// ── FILTER / MODE ─────────────────────────────────────────────────────────────
async function setFilterType(f) {
  state.filterType = f;
  await restart();
}

async function setFilterLevel(l) {
  state.filterLevel = l;
  await restart();
}

async function setMode(m) {
  state.mode = m;
  document.querySelectorAll('[data-mode]').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === m);
  });
  await restart();
}

// ── EVENT LISTENERS ───────────────────────────────────────────────────────────
document.getElementById('card').addEventListener('click', flipCard);

document.addEventListener('keydown', e => {
  // Ignore keypresses if user is interacting with form controls
  if (['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
  
  if (e.code === 'Space') { e.preventDefault(); flipCard(); }
  if (e.code === 'ArrowRight') { if (state.flipped) markCorrect(); else nextCard(); }
  if (e.code === 'ArrowLeft')  { prevCard(); }
  if (e.code === 'Digit1' && state.flipped) markWrong();
  if (e.code === 'Digit2' && state.flipped) markCorrect();
});

document.getElementById('btn-correct').addEventListener('click', e => { e.stopPropagation(); markCorrect(); });
document.getElementById('btn-wrong').addEventListener('click',   e => { e.stopPropagation(); markWrong(); });
document.getElementById('btn-next').addEventListener('click', () => { if (state.flipped) markCorrect(); else flipCard(); });
document.getElementById('btn-prev').addEventListener('click', prevCard);
document.getElementById('btn-restart').addEventListener('click', () => restart());
document.getElementById('btn-done-restart').addEventListener('click', () => restart());
document.getElementById('btn-wrong-only').addEventListener('click', () => {
  const wrongDeck = state.wrongCards.length > 0 ? [...state.wrongCards] : [];
  if (wrongDeck.length > 0) {
    restart(state.mode === 'random' ? shuffleArray(wrongDeck) : wrongDeck);
  } else {
    restart(); // fallback to normal restart
  }
});

document.querySelectorAll('[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

// ── STARTUP ───────────────────────────────────────────────────────────────────
initApp();
