// Main Application Controller

import { CUTS_ENCYCLOPEDIA, FUEL_TYPES, BEEF_CUTS } from './data.js';
import { calculateAsado, formatWhatsAppShoppingList, distributeTenths } from './calculator.js';

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
  selectedBeefCuts: BEEF_CUTS.filter((c) => c.defaultSelected).map((c) => c.key),
  lockedBeefTenths: {},
  customBeefShares: BEEF_CUTS.reduce((acc, cut) => {
    acc[cut.key] = cut.defaultShare;
    return acc;
  }, {}),
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
  initBeefCutsSelector();
  initVaquita();
  initCutEncyclopedia();
  initCowViewSwitcher();
  initLightbox();
  initCopyButton();

  // Initial Calculation
  renderBeefCutSliders();
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
   4B. BEEF CUTS CHECKBOXES & DYNAMIC KG SLIDERS
   ========================================================== */
function initBeefCutsSelector() {
  const container = document.getElementById('beef-cuts-selector');
  if (!container) return;

  container.innerHTML = '';
  BEEF_CUTS.forEach((cut) => {
    const isSelected = state.selectedBeefCuts.includes(cut.key);
    const label = document.createElement('label');
    label.className = `toggle-chip${isSelected ? ' checked' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isSelected;
    checkbox.dataset.beefCut = cut.key;

    const text = document.createElement('span');
    text.textContent = cut.label;

    label.appendChild(checkbox);
    label.appendChild(text);
    container.appendChild(label);

    checkbox.addEventListener('change', () => {
      label.classList.toggle('checked', checkbox.checked);
      toggleBeefCut(cut.key, checkbox.checked);
    });
  });
}

function isCutLocked(cutKey) {
  return Object.prototype.hasOwnProperty.call(state.lockedBeefTenths, cutKey);
}

function toggleBeefCut(cutKey, enabled) {
  if (enabled) {
    if (!state.selectedBeefCuts.includes(cutKey)) {
      state.selectedBeefCuts.push(cutKey);
    }
    const existingUnlocked = state.selectedBeefCuts.filter((k) => k !== cutKey && !isCutLocked(k));
    const existingSum = existingUnlocked.reduce((acc, k) => acc + (Number(state.customBeefShares[k]) || 0), 0);
    if (existingUnlocked.length === 0 || existingSum <= 0) {
      state.customBeefShares[cutKey] = 100;
    } else {
      // Give the newly added cut an equal slice of the unlocked pool
      state.customBeefShares[cutKey] = existingSum / existingUnlocked.length;
    }
  } else {
    state.selectedBeefCuts = state.selectedBeefCuts.filter((k) => k !== cutKey);
    delete state.lockedBeefTenths[cutKey];
    state.customBeefShares[cutKey] = 0;
    const remainingUnlocked = state.selectedBeefCuts.filter((k) => !isCutLocked(k));
    const remainingSum = remainingUnlocked.reduce(
      (acc, k) => acc + (Number(state.customBeefShares[k]) || 0),
      0
    );
    if (remainingUnlocked.length > 0 && remainingSum <= 0) {
      remainingUnlocked.forEach((k) => { state.customBeefShares[k] = 100; });
    }
  }

  renderBeefCutSliders();
  recalculate();
}

function toggleBeefCutLock(cutKey) {
  if (isCutLocked(cutKey)) {
    const unlockedTenths = state.lockedBeefTenths[cutKey];
    delete state.lockedBeefTenths[cutKey];
    state.customBeefShares[cutKey] = unlockedTenths > 0 ? unlockedTenths : 1;
  } else {
    const unlockedCount = state.selectedBeefCuts.filter((k) => !isCutLocked(k)).length;
    if (unlockedCount <= 1) return;
    const calc = calculateAsado(state);
    const currentKg = calc.meats[`${cutKey}Kg`] || 0;
    state.lockedBeefTenths[cutKey] = Math.round(currentKg * 10);
  }

  recalculate();
}

function renderBeefCutSliders() {
  const container = document.getElementById('beef-cuts-sliders');
  if (!container) return;

  container.innerHTML = '';
  const activeCuts = BEEF_CUTS.filter((c) => state.selectedBeefCuts.includes(c.key));

  if (activeCuts.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'beef-empty-state';
    empty.id = 'beef-empty-state';
    empty.textContent = 'Selecciona al menos un corte vacuno arriba para repartir la carne.';
    container.appendChild(empty);
    return;
  }

  const showLockBtn = activeCuts.length > 1;

  activeCuts.forEach((cut) => {
    const row = document.createElement('div');
    row.className = 'slider-row';
    row.dataset.cutRow = cut.key;

    const header = document.createElement('div');
    header.className = 'slider-header';

    const labelWrap = document.createElement('div');
    const labelRow = document.createElement('div');
    labelRow.className = 'cut-label-row';

    const label = document.createElement('label');
    label.className = 'slider-label';
    label.htmlFor = `beef-${cut.key}-range`;
    label.textContent = cut.label;
    labelRow.appendChild(label);

    if (showLockBtn) {
      const lockBtn = document.createElement('button');
      lockBtn.type = 'button';
      lockBtn.className = 'cut-lock-btn';
      lockBtn.dataset.cutLock = cut.key;
      lockBtn.addEventListener('click', () => toggleBeefCutLock(cut.key));
      labelRow.appendChild(lockBtn);
    }

    const desc = document.createElement('div');
    desc.className = 'slider-desc';
    desc.dataset.cutPct = cut.key;

    labelWrap.appendChild(labelRow);
    labelWrap.appendChild(desc);

    const numWrap = document.createElement('div');
    numWrap.className = 'number-input-wrap';

    const numInput = document.createElement('input');
    numInput.type = 'number';
    numInput.id = `beef-${cut.key}-number`;
    numInput.className = 'editable-number-input';
    numInput.min = '0';
    numInput.step = '0.1';
    numInput.dataset.cutNumber = cut.key;

    const unit = document.createElement('span');
    unit.className = 'number-unit';
    unit.textContent = 'kg';

    numWrap.appendChild(numInput);
    numWrap.appendChild(unit);

    header.appendChild(labelWrap);
    header.appendChild(numWrap);

    const rangeInput = document.createElement('input');
    rangeInput.type = 'range';
    rangeInput.id = `beef-${cut.key}-range`;
    rangeInput.className = 'custom-range';
    rangeInput.min = '0';
    rangeInput.step = '0.1';
    rangeInput.dataset.cutRange = cut.key;

    row.appendChild(header);
    row.appendChild(rangeInput);
    container.appendChild(row);

    rangeInput.addEventListener('input', () => {
      const val = parseFloat(rangeInput.value);
      handleBeefCutKgChange(cut.key, isNaN(val) ? 0 : val, false);
    });

    numInput.addEventListener('input', () => {
      if (numInput.value === '') return;
      const val = parseFloat(numInput.value);
      if (!isNaN(val)) {
        handleBeefCutKgChange(cut.key, val, true);
      }
    });

    numInput.addEventListener('blur', () => {
      const val = parseFloat(numInput.value);
      handleBeefCutKgChange(cut.key, isNaN(val) ? 0 : val, false);
    });
  });
}

function handleBeefCutKgChange(editedKey, rawKg, preserveActiveInput) {
  if (isCutLocked(editedKey)) return;

  const calc = calculateAsado(state);
  const totalKg = calc.beefTotalKg;
  const totalTenths = Math.round(totalKg * 10);

  if (totalTenths <= 0) {
    recalculate();
    return;
  }

  const lockedOtherSum = state.selectedBeefCuts
    .filter((k) => k !== editedKey && isCutLocked(k))
    .reduce((acc, k) => acc + Math.round((calc.meats[`${k}Kg`] || 0) * 10), 0);

  const maxEditableTenths = Math.max(0, totalTenths - lockedOtherSum);
  const editedTenths = Math.min(maxEditableTenths, Math.max(0, Math.round(rawKg * 10)));
  const remainingTenths = Math.max(0, maxEditableTenths - editedTenths);
  const unlockedOtherKeys = state.selectedBeefCuts.filter((k) => k !== editedKey && !isCutLocked(k));

  if (unlockedOtherKeys.length === 0) {
    state.customBeefShares[editedKey] = 100;
  } else {
    const otherTenths = distributeTenths(remainingTenths, unlockedOtherKeys, state.customBeefShares);
    state.customBeefShares[editedKey] = editedTenths;
    unlockedOtherKeys.forEach((k) => {
      state.customBeefShares[k] = otherTenths[k];
    });
  }

  recalculate(preserveActiveInput ? editedKey : null);
}

function syncBeefCutSliders(calc, skipNumberKey = null) {
  const badge = document.getElementById('beef-budget-badge');
  if (badge) {
    badge.textContent = state.selectedBeefCuts.length > 0
      ? `Total vacuno: ${calc.beefTotalKg.toFixed(1)} kg`
      : `0.0 kg (${calc.potentialBeefKg.toFixed(1)} kg sug.)`;
  }

  const emptyEl = document.getElementById('beef-empty-state');
  if (emptyEl) {
    emptyEl.textContent = `Selecciona al menos un corte vacuno arriba para repartir los ${calc.potentialBeefKg.toFixed(1)} kg sugeridos.`;
    return;
  }

  const totalKg = calc.beefTotalKg;
  const unlockedKeys = state.selectedBeefCuts.filter((k) => !isCutLocked(k));
  const unlockedCount = unlockedKeys.length;

  state.selectedBeefCuts.forEach((key) => {
    const kgField = `${key}Kg`;
    const cutKg = calc.meats[kgField] || 0;
    const pct = totalKg > 0 ? Math.round((cutKg / totalKg) * 100) : 0;
    const locked = isCutLocked(key);
    const isAutoRemainder = !locked && unlockedCount <= 1;

    const lockedOthersKg = state.selectedBeefCuts
      .filter((k) => k !== key && isCutLocked(k))
      .reduce((acc, k) => acc + (calc.meats[`${k}Kg`] || 0), 0);
    const maxForCutKg = Math.max(0, Math.round((totalKg - lockedOthersKg) * 10) / 10);

    const rowEl = document.querySelector(`[data-cut-row="${key}"]`);
    const rangeEl = document.querySelector(`[data-cut-range="${key}"]`);
    const numEl = document.querySelector(`[data-cut-number="${key}"]`);
    const pctEl = document.querySelector(`[data-cut-pct="${key}"]`);
    const lockEl = document.querySelector(`[data-cut-lock="${key}"]`);

    if (rowEl) {
      rowEl.classList.toggle('is-locked', locked);
    }
    if (lockEl) {
      lockEl.classList.toggle('locked', locked);
      lockEl.textContent = locked ? '🔒' : '🔓';
      lockEl.title = locked
        ? 'Desbloquear para que se ajuste automáticamente'
        : (unlockedCount <= 1 ? 'Debe quedar al menos 1 corte libre' : 'Fijar kilos de este corte');
      lockEl.setAttribute('aria-label', locked ? 'Desbloquear peso' : 'Fijar peso');
      lockEl.disabled = !locked && unlockedCount <= 1;
    }
    if (rangeEl) {
      rangeEl.max = (locked ? totalKg : maxForCutKg).toFixed(1);
      rangeEl.value = cutKg.toFixed(1);
      rangeEl.disabled = locked || isAutoRemainder;
    }
    if (numEl) {
      numEl.max = (locked ? totalKg : maxForCutKg).toFixed(1);
      numEl.disabled = locked || isAutoRemainder;
      if (skipNumberKey !== key) {
        numEl.value = cutKg.toFixed(1);
      }
    }
    if (pctEl) {
      if (state.selectedBeefCuts.length === 1) {
        pctEl.textContent = '100% del vacuno';
      } else if (locked) {
        pctEl.textContent = `🔒 Fijo (${pct}%)`;
      } else if (isAutoRemainder) {
        pctEl.textContent = `Resto automático (${pct}%)`;
      } else {
        pctEl.textContent = `${pct}% del vacuno`;
      }
    }
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
  const totalAdults = state.adults;
  if (totalAdults === 0 || state.vaquitaTotal <= 0) {
    display.textContent = '$ 0 / adulto';
    return;
  }
  const perAdult = Math.round(state.vaquitaTotal / totalAdults);
  display.textContent = `$ ${perAdult.toLocaleString()} / adulto`;
}

/* ==========================================================
   6. RECALCULATION & RENDER RESULTS
   ========================================================== */
function recalculate(skipNumberKey = null) {
  const calc = calculateAsado(state);

  syncBeefCutSliders(calc, skipNumberKey);

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
      fuelBadge.textContent = `~${calc.fuel.coalKg} kg (${calc.fuel.coalBags} bolsa${calc.fuel.coalBags > 1 ? 's' : ''} 4kg)`;
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
      items.push({ icon: '🔥', name: 'Carbón vegetal', qty: `~${calc.fuel.coalKg} kg (${calc.fuel.coalBags} bolsa(s) de 4kg)` });
    } else if (calc.fuel.type === 'lena') {
      items.push({ icon: '🪵', name: 'Leña dura (quebracho/espinillo)', qty: `${calc.fuel.woodBags} bolsa(s) de 10kg (~${calc.fuel.woodKg} kg)` });
    } else {
      items.push({ icon: '🔥', name: 'Carbón vegetal', qty: `~${calc.fuel.coalKg} kg (${calc.fuel.coalBags} bolsa(s))` });
      items.push({ icon: '🪵', name: 'Leña dura', qty: `${calc.fuel.woodBags} bolsa(s)` });
    }
  } else {
    items.push({ icon: '🔵', name: 'Gas para parrilla', qty: 'Tanque / Red' });
  }

  // Meats
  BEEF_CUTS.forEach((cut) => {
    const kg = calc.meats[`${cut.key}Kg`];
    if (kg > 0) items.push({ icon: '🥩', name: cut.label, qty: `${kg} kg` });
  });
  if (calc.meats.porkKg > 0) items.push({ icon: '🥓', name: 'Pechito / Bondiola de Cerdo', qty: `${calc.meats.porkKg} kg` });
  if (calc.meats.chickenKg > 0) items.push({ icon: '🍗', name: 'Pollo (pata-muslo)', qty: `${calc.meats.chickenKg} kg` });
  if (calc.meats.chorizos > 0) items.push({ icon: '🌭', name: 'Chorizos', qty: `${calc.meats.chorizos} u.` });
  if (calc.meats.morcillas > 0) items.push({ icon: '🌭', name: 'Morcillas', qty: `${calc.meats.morcillas} u.` });
  if (calc.meats.mollejasKg > 0) items.push({ icon: '🥩', name: 'Mollejas / Chinchulines', qty: `${calc.meats.mollejasKg} kg` });
  if (state.includeAchuras) items.push({ icon: '🧀', name: 'Provoleta', qty: `${calc.meats.provoletas} rueda(s)` });

  // Bread & Sides
  if (calc.sides.breadKg > 0) {
    items.push({ icon: '🥖', name: 'Pan francés / baguettes', qty: `~${calc.sides.breadKg} kg (${calc.sides.baguettes} u.)` });
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
      showToast('No se pudo copiar automáticamente. Copia manualmente.');
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
      const matchTips = cut.tips && cut.tips.toLowerCase().includes(state.searchQuery);
      if (!matchName && !matchEnglish && !matchAnatomy && !matchBest && !matchTips) {
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
        <span class="cut-category-badge cat-${cut.category}">${cut.category}</span>
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
   10. COW VIEW SWITCHER & LIGHTBOX
   ========================================================== */
function initCowViewSwitcher() {
  const btnAngus = document.getElementById('btn-view-angus');
  const btnPoster = document.getElementById('btn-view-poster');

  const stageAngus = document.getElementById('stage-angus');
  const stagePoster = document.getElementById('stage-poster');

  if (!btnAngus || !btnPoster || !stageAngus || !stagePoster) return;

  btnAngus.addEventListener('click', () => {
    btnAngus.classList.add('active');
    btnPoster.classList.remove('active');
    stageAngus.style.display = 'block';
    stagePoster.style.display = 'none';
  });

  btnPoster.addEventListener('click', () => {
    btnPoster.classList.add('active');
    btnAngus.classList.remove('active');
    stagePoster.style.display = 'block';
    stageAngus.style.display = 'none';
  });
}

function initLightbox() {
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');

  const cardAngus = document.getElementById('card-zoom-angus');
  const cardPoster = document.getElementById('card-zoom-poster');

  if (!lightbox || !lightboxImg) return;

  function openLightbox(src, altText = 'Mapa de cortes') {
    lightboxImg.src = src;
    lightboxImg.alt = altText;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (cardAngus) {
    cardAngus.addEventListener('click', () => {
      openLightbox('assets/cow-angus.png', 'Diagrama American Angus - Cortes de carne de res');
    });
  }

  if (cardPoster) {
    cardPoster.addEventListener('click', () => {
      openLightbox('assets/cow-poster.jpg', 'Póster Pizarra - El mapa de los cortes de la res');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }

  lightbox.addEventListener('click', (e) => {
    if (e.target !== lightboxImg) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}
