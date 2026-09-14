// Main Application Controller

import { CUTS_ENCYCLOPEDIA, FUEL_TYPES } from './data.js';
import { calculateAsado, formatWhatsAppShoppingList } from './calculator.js';

// Application State
const state = {
  adults: 6,
  kids: 2,
  appetite: 'clasico',
  fuelType: 'carbon',
  includeChicken: true,
  includePork: true,
  includeAchuras: true,
  includeBread: true,
  includeSalads: true,
  includeDrinks: true,
  customBeefShares: {
    tira: 50,
    vacio: 50,
    entrana: 0
  },
  vaquitaTotal: 0,
  activeCutFilter: 'all',
  searchQuery: '',
  selectedCutId: null,
  viewMode: 'svg' // 'svg' or 'custom'
};

document.addEventListener('DOMContentLoaded', () => {
  initDualInputs();
  initAppetiteButtons();
  initFuelButtons();
  initToggles();
  initVaquita();
  initCutEncyclopedia();
  loadCowSvg();
  initCowViewSwitcher();
  initCustomImageUpload();
  initCopyButton();

  // Initial Calculation
  recalculate();
});

/* ==========================================================
   1. DUAL INPUTS (SLIDER + NUMERIC TYPED INPUT SYNC)
   ========================================================== */
function initDualInputs() {
  const syncPairs = [
    {
      range: 'adults-range',
      number: 'adults-number',
      min: 1,
      max: 100,
      onChange: (val) => { state.adults = val; }
    },
    {
      range: 'kids-range',
      number: 'kids-number',
      min: 0,
      max: 50,
      onChange: (val) => { state.kids = val; }
    },
    {
      range: 'beef-tira-range',
      number: 'beef-tira-number',
      min: 0,
      max: 100,
      onChange: (val) => { state.customBeefShares.tira = val; }
    },
    {
      range: 'beef-vacio-range',
      number: 'beef-vacio-number',
      min: 0,
      max: 100,
      onChange: (val) => { state.customBeefShares.vacio = val; }
    },
    {
      range: 'beef-entrana-range',
      number: 'beef-entrana-number',
      min: 0,
      max: 100,
      onChange: (val) => { state.customBeefShares.entrana = val; }
    }
  ];

  syncPairs.forEach(pair => {
    const rangeEl = document.getElementById(pair.range);
    const numEl = document.getElementById(pair.number);

    if (!rangeEl || !numEl) return;

    // Range changes -> update number & state
    rangeEl.addEventListener('input', () => {
      const val = parseInt(rangeEl.value, 10) || 0;
      numEl.value = val;
      pair.onChange(val);
      recalculate();
    });

    // Number input typed -> update range & state
    numEl.addEventListener('input', () => {
      let val = parseInt(numEl.value, 10);
      if (isNaN(val)) val = 0;
      if (val > pair.max) val = pair.max;
      if (val < pair.min && numEl.value !== '') val = pair.min;
      
      rangeEl.value = val;
      pair.onChange(val);
      recalculate();
    });

    numEl.addEventListener('blur', () => {
      let val = parseInt(numEl.value, 10);
      if (isNaN(val) || val < pair.min) val = pair.min;
      numEl.value = val;
      rangeEl.value = val;
      pair.onChange(val);
      recalculate();
    });
  });
}

/* ==========================================================
   2. APPETITE SELECTOR
   ========================================================== */
function initAppetiteButtons() {
  const buttons = document.querySelectorAll('.pill-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.appetite = btn.dataset.appetite;
      recalculate();
    });
  });
}

/* ==========================================================
   3. FUEL SELECTOR (Carbón, Leña, Mix, Gas)
   ========================================================== */
function initFuelButtons() {
  const buttons = document.querySelectorAll('.fuel-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.fuelType = btn.dataset.fuel;
      recalculate();
    });
  });
}

/* ==========================================================
   4. TOGGLE CHIPS
   ========================================================== */
function initToggles() {
  const toggleMap = [
    { id: 'toggle-chicken', key: 'includeChicken' },
    { id: 'toggle-pork', key: 'includePork' },
    { id: 'toggle-achuras', key: 'includeAchuras' },
    { id: 'toggle-bread', key: 'includeBread' },
    { id: 'toggle-salads', key: 'includeSalads' },
    { id: 'toggle-drinks', key: 'includeDrinks' }
  ];

  toggleMap.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', () => {
      state[key] = el.checked;
      const label = el.closest('.toggle-chip');
      if (label) {
        if (el.checked) {
          label.classList.add('checked');
        } else {
          label.classList.remove('checked');
        }
      }
      recalculate();
    });
  });
}

/* ==========================================================
   5. VAQUITA / BILL SPLITTER
   ========================================================== */
function initVaquita() {
  const input = document.getElementById('vaquita-total-input');
  if (!input) return;

  input.addEventListener('input', () => {
    state.vaquitaTotal = parseFloat(input.value) || 0;
    updateVaquitaDisplay();
  });
}

function updateVaquitaDisplay() {
  const display = document.getElementById('vaquita-per-person');
  if (!display) return;
  const totalPeople = state.adults + state.kids;
  if (totalPeople === 0 || state.vaquitaTotal <= 0) {
    display.textContent = '$ 0 / pers.';
    return;
  }
  const perPerson = Math.round(state.vaquitaTotal / totalPeople);
  display.textContent = `$ ${perPerson.toLocaleString('es-AR')} / pers.`;
}

/* ==========================================================
   6. RECALCULATION & RENDER RESULTS
   ========================================================== */
function recalculate() {
  const calc = calculateAsado(state);

  // Render Meat Total & Guests
  document.getElementById('out-total-meat').textContent = `${calc.totalProteinsKg} kg`;
  document.getElementById('out-total-people').textContent = `${calc.people.total} personas`;

  // Render Fuel Box
  const fuelBox = document.getElementById('fuel-indicator-box');
  const fuelName = document.getElementById('fuel-out-name');
  const fuelBadge = document.getElementById('fuel-out-badge');
  const fuelNote = document.getElementById('fuel-out-note');

  if (calc.fuel.isGas) {
    fuelBox.className = 'fuel-indicator fuel-gas';
    fuelName.textContent = '🔵 Parrilla a Gas';
    fuelBadge.className = 'fuel-bags-badge badge-gas';
    fuelBadge.textContent = '0 kg carbón';
    fuelNote.textContent = calc.fuel.notes;
  } else {
    fuelBox.className = 'fuel-indicator';
    fuelBadge.className = 'fuel-bags-badge';
    
    if (calc.fuel.type === 'carbon') {
      fuelName.textContent = '🔥 Carbón Recomendado';
      fuelBadge.textContent = `${calc.fuel.coalBags} bolsa${calc.fuel.coalBags > 1 ? 's' : ''} (4kg)`;
    } else if (calc.fuel.type === 'lena') {
      fuelName.textContent = '🪵 Leña Recomendada';
      fuelBadge.textContent = `${calc.fuel.woodBags} bolsa${calc.fuel.woodBags > 1 ? 's' : ''} (10kg)`;
    } else {
      fuelName.textContent = '🔥🪵 Fuego Mixto';
      fuelBadge.textContent = `${calc.fuel.coalBags}b carbón + ${calc.fuel.woodBags}b leña`;
    }
    fuelNote.textContent = calc.fuel.notes;
  }

  // Render Itemized Shopping List
  renderShoppingList(calc);

  // Update Vaquita
  updateVaquitaDisplay();
}

function renderShoppingList(calc) {
  const listContainer = document.getElementById('shopping-list-container');
  listContainer.innerHTML = '';

  const items = [];

  // Fuel item
  if (!calc.fuel.isGas) {
    if (calc.fuel.type === 'carbon') {
      items.push({ icon: '🔥', name: 'Carbón vegetal', qty: `${calc.fuel.coalBags} bolsa(s) de 4kg (~${calc.fuel.coalKg} kg)` });
    } else if (calc.fuel.type === 'lena') {
      items.push({ icon: '🪵', name: 'Leña dura (quebracho/espinillo)', qty: `${calc.fuel.woodBags} bolsa(s) de 10kg (~${calc.fuel.woodKg} kg)` });
    } else {
      items.push({ icon: '🔥', name: 'Carbón vegetal', qty: `${calc.fuel.coalBags} bolsa(s)` });
      items.push({ icon: '🪵', name: 'Leña dura', qty: `${calc.fuel.woodBags} bolsa(s)` });
    }
  } else {
    items.push({ icon: '🔵', name: 'Gas para parrilla', qty: 'Garrafa / Red' });
  }

  // Meats
  if (calc.meats.tiraKg > 0) items.push({ icon: '🥩', name: 'Asado de Tira', qty: `${calc.meats.tiraKg} kg` });
  if (calc.meats.vacioKg > 0) items.push({ icon: '🥩', name: 'Vacío', qty: `${calc.meats.vacioKg} kg` });
  if (calc.meats.entranaKg > 0) items.push({ icon: '🥩', name: 'Entraña', qty: `${calc.meats.entranaKg} kg` });
  if (calc.meats.porkKg > 0) items.push({ icon: '🥓', name: 'Pechito / Bondiola de Cerdo', qty: `${calc.meats.porkKg} kg` });
  if (calc.meats.chickenKg > 0) items.push({ icon: '🍗', name: 'Pollo (pata-muslo)', qty: `${calc.meats.chickenKg} kg` });
  if (calc.meats.chorizos > 0) items.push({ icon: '🌭', name: 'Chorizos', qty: `${calc.meats.chorizos} u.` });
  if (calc.meats.morcillas > 0) items.push({ icon: '🌭', name: 'Morcillas', qty: `${calc.meats.morcillas} u.` });
  if (calc.meats.mollejasKg > 0) items.push({ icon: '🥩', name: 'Mollejas / Chinchulines', qty: `${calc.meats.mollejasKg} kg` });
  if (state.includeAchuras) items.push({ icon: '🧀', name: 'Provoleta', qty: `${calc.meats.provoletas} rueda(s)` });

  // Bread & Sides
  if (calc.sides.breadKg > 0) {
    items.push({ icon: '🥖', name: 'Pan francés / flautitas', qty: `~${calc.sides.breadKg} kg (${calc.sides.baguettes} u.)` });
  }
  if (state.includeSalads) {
    items.push({ icon: '🥗', name: 'Verduras ensalada (Tomate, Lechuga)', qty: 'A gusto' });
    items.push({ icon: '🥔', name: 'Papas para el plomo', qty: `${state.adults} u.` });
    items.push({ icon: '🍋', name: 'Limones (achuras & carne)', qty: '4 - 6 u.' });
  }
  items.push({ icon: '🧂', name: 'Sal parrillera entrefina', qty: '1 paq.' });

  // Drinks
  if (state.includeDrinks) {
    items.push({ icon: '🍷', name: 'Vino tinto (Malbec)', qty: `${calc.drinks.wineBottles} botella(s)` });
    items.push({ icon: '🍺', name: 'Cerveza', qty: `${calc.drinks.beerLiters} L` });
    items.push({ icon: '🥤', name: 'Gaseosas / Agua', qty: `${calc.drinks.sodaLiters} L` });
    items.push({ icon: '🧊', name: 'Hielo', qty: `${calc.drinks.iceBags} bolsa(s)` });
  }

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'shopping-item';
    div.innerHTML = `
      <div class="item-left">
        <span>${item.icon}</span>
        <span>${item.name}</span>
      </div>
      <div class="item-qty">${item.qty}</div>
    `;
    listContainer.appendChild(div);
  });
}

/* ==========================================================
   7. WHATSAPP COPY BUTTON
   ========================================================== */
function initCopyButton() {
  const btn = document.getElementById('btn-copy-whatsapp');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const calc = calculateAsado(state);
    const text = formatWhatsAppShoppingList(calc, state);

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast('¡Lista copiada al portapapeles! Lista para pegar en WhatsApp 🔥');
    } catch (e) {
      showToast('No se pudo copiar automáticamente. Copiá manualmente.');
    }
  });
}

function showToast(msg) {
  const toast = document.getElementById('toast-msg');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

/* ==========================================================
   8. CUT ENCYCLOPEDIA RENDER & SEARCH/FILTER
   ========================================================== */
function initCutEncyclopedia() {
  const searchInput = document.getElementById('cut-search-input');
  const filterBtns = document.querySelectorAll('.filter-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      renderCutsGrid();
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCutFilter = btn.dataset.cat;
      renderCutsGrid();
    });
  });

  renderCutsGrid();
}

function renderCutsGrid() {
  const container = document.getElementById('cuts-grid-container');
  if (!container) return;

  container.innerHTML = '';

  const filteredCuts = CUTS_ENCYCLOPEDIA.filter(cut => {
    // Category match
    if (state.activeCutFilter !== 'all' && cut.category !== state.activeCutFilter) {
      return false;
    }
    // Search match
    if (state.searchQuery) {
      const matchName = cut.name.toLowerCase().includes(state.searchQuery);
      const matchEnglish = cut.englishName.toLowerCase().includes(state.searchQuery);
      const matchAnatomy = cut.anatomy.toLowerCase().includes(state.searchQuery);
      const matchBest = cut.bestFor.toLowerCase().includes(state.searchQuery);
      if (!matchName && !matchEnglish && !matchAnatomy && !matchBest) {
        return false;
      }
    }
    return true;
  });

  if (filteredCuts.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
        <p style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔍</p>
        <p>No se encontraron cortes que coincidan con la búsqueda.</p>
      </div>
    `;
    return;
  }

  filteredCuts.forEach(cut => {
    const card = document.createElement('article');
    card.className = `cut-card ${state.selectedCutId === cut.id ? 'card-highlighted' : ''}`;
    card.id = `cut-card-${cut.id}`;

    card.innerHTML = `
      <div class="cut-card-header">
        <div>
          <h3 class="cut-card-title">${cut.name}</h3>
          <div class="cut-card-english">${cut.englishName}</div>
        </div>
        <span class="cut-category-badge">${cut.category}</span>
      </div>

      <div class="cut-detail-section">
        <div class="detail-label"><span>📍</span> ¿De dónde sale? (Anatomía)</div>
        <div class="detail-text">${cut.anatomy}</div>
      </div>

      <div class="cut-detail-section">
        <div class="detail-label"><span>✨</span> ¿Para qué es mejor?</div>
        <div class="detail-text">${cut.bestFor}</div>
      </div>

      <div class="cut-metrics-grid">
        <div class="metric-item">
          <span class="metric-key">🔥 Fuego:</span>
          <span class="metric-val">${cut.fireLevel}</span>
        </div>
        <div class="metric-item">
          <span class="metric-key">⏱️ Tiempo:</span>
          <span class="metric-val">${cut.cookingTime}</span>
        </div>
        <div class="metric-item">
          <span class="metric-key">🥩 Grasa:</span>
          <span class="metric-val">${cut.fatLevel}</span>
        </div>
        <div class="metric-item">
          <span class="metric-key">👌 Terneza:</span>
          <span class="metric-val">${cut.tenderness}</span>
        </div>
      </div>

      <div class="cut-tip-box">
        <div class="cut-tip-title"><span>💡</span> Secreto del Asador</div>
        <div class="cut-tip-text">"${cut.tips}"</div>
      </div>
    `;

    // Click on card highlights SVG zone
    card.addEventListener('mouseenter', () => {
      highlightCowZone(cut.svgPartId);
    });

    card.addEventListener('mouseleave', () => {
      if (state.selectedCutId !== cut.id) {
        unhighlightCowZone(cut.svgPartId);
      }
    });

    container.appendChild(card);
  });
}

/* ==========================================================
   9. INTERACTIVE SVG COW INTEGRATION
   ========================================================== */
async function loadCowSvg() {
  const existingSvg = document.getElementById('interactive-cow-svg');
  if (existingSvg) {
    attachSvgListeners();
    return;
  }

  const wrapper = document.getElementById('cow-svg-wrapper');
  if (!wrapper) return;

  try {
    const res = await fetch('assets/cow-cuts.svg');
    if (res.ok) {
      const svgText = await res.text();
      wrapper.innerHTML = svgText;
      attachSvgListeners();
    }
  } catch (err) {
    console.warn('Could not load cow-cuts.svg via fetch:', err);
  }
}

function attachSvgListeners() {
  const zones = document.querySelectorAll('.cut-zone');
  zones.forEach(zone => {
    zone.addEventListener('click', () => {
      const targetCutId = zone.dataset.cut;
      selectCut(targetCutId, zone);
    });

    zone.addEventListener('mouseenter', () => {
      zone.classList.add('active-cut');
    });

    zone.addEventListener('mouseleave', () => {
      if (zone.dataset.cut !== state.selectedCutId) {
        zone.classList.remove('active-cut');
      }
    });
  });
}

function selectCut(cutId, clickedZone = null) {
  state.selectedCutId = cutId;

  // Highlight on SVG
  document.querySelectorAll('.cut-zone').forEach(z => {
    if (z.dataset.cut === cutId || z.dataset.cutAlt === cutId) {
      z.classList.add('active-cut');
    } else {
      z.classList.remove('active-cut');
    }
  });

  // Re-render or highlight card
  renderCutsGrid();

  // Scroll to card smoothly
  const targetCard = document.getElementById(`cut-card-${cutId}`);
  if (targetCard) {
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    targetCard.classList.add('card-highlighted');
  }
}

function highlightCowZone(svgPartId) {
  if (!svgPartId) return;
  const el = document.getElementById(svgPartId);
  if (el) el.classList.add('active-cut');
}

function unhighlightCowZone(svgPartId) {
  if (!svgPartId) return;
  const el = document.getElementById(svgPartId);
  if (el && el.dataset.cut !== state.selectedCutId) {
    el.classList.remove('active-cut');
  }
}

/* ==========================================================
   10. COW VIEW SWITCHER & USER IMAGE UPLOAD
   ========================================================== */
function initCowViewSwitcher() {
  const btnSvg = document.getElementById('btn-view-svg');
  const btnCustom = document.getElementById('btn-view-custom');
  const stageSvg = document.getElementById('cow-interactive-stage');
  const stageCustom = document.getElementById('custom-cow-image-wrapper');

  if (!btnSvg || !btnCustom) return;

  btnSvg.addEventListener('click', () => {
    btnSvg.classList.add('active');
    btnCustom.classList.remove('active');
    stageSvg.style.display = 'flex';
    stageCustom.style.display = 'none';
    state.viewMode = 'svg';
  });

  btnCustom.addEventListener('click', () => {
    btnCustom.classList.add('active');
    btnSvg.classList.remove('active');
    stageSvg.style.display = 'none';
    stageCustom.style.display = 'block';
    state.viewMode = 'custom';
  });
}

function initCustomImageUpload() {
  const fileInput = document.getElementById('custom-cow-file');
  const customImg = document.getElementById('custom-cow-img');
  const placeholder = document.getElementById('custom-cow-placeholder');
  const btnCustom = document.getElementById('btn-view-custom');

  // Check if user previously saved image in localStorage
  const savedImage = localStorage.getItem('asado_custom_cow_image');
  if (savedImage && customImg) {
    customImg.src = savedImage;
    customImg.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          if (customImg) {
            customImg.src = dataUrl;
            customImg.style.display = 'block';
          }
          if (placeholder) {
            placeholder.style.display = 'none';
          }
          try {
            localStorage.setItem('asado_custom_cow_image', dataUrl);
          } catch (e) {
            console.warn('Image too large for localStorage');
          }
          // Automatically switch to Custom Image tab
          if (btnCustom) btnCustom.click();
          showToast('¡Foto de la vaca cargada con éxito! 🐄');
        };
        reader.readAsDataURL(file);
      }
    });
  }
}
