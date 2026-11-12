// Calculation Engine for Asado Calculator

import { FUEL_TYPES, APPETITE_LEVELS, BEEF_CUTS } from './data.js';

export function distributeTenths(totalTenths, keys, weights = {}) {
  const result = {};
  if (!keys.length || totalTenths <= 0) {
    keys.forEach((k) => { result[k] = 0; });
    return result;
  }

  const rawWeights = keys.map((k) => Math.max(0, Number(weights[k]) || 0));
  const weightSum = rawWeights.reduce((acc, w) => acc + w, 0);
  const normalized = weightSum > 0
    ? rawWeights.map((w) => w / weightSum)
    : keys.map(() => 1 / keys.length);

  const exact = normalized.map((share) => share * totalTenths);
  const floors = exact.map((val) => Math.floor(val));
  let remainder = totalTenths - floors.reduce((acc, v) => acc + v, 0);

  const order = exact
    .map((val, idx) => ({ idx, frac: val - floors[idx] }))
    .sort((a, b) => b.frac - a.frac);

  for (let i = 0; i < remainder; i++) {
    floors[order[i % order.length].idx] += 1;
  }

  keys.forEach((k, idx) => {
    result[k] = floors[idx];
  });
  return result;
}

export function calculateAsado(state) {
  const {
    adults = 6,
    kids = 2,
    appetite = 'clasico',
    fuelType = 'carbon',
    includeChicken = true,
    includePork = true,
    includeAchuras = true,
    includeSalads = true,
    includeBread = true,
    includeDrinks = true,
    selectedBeefCuts = BEEF_CUTS.filter((c) => c.defaultSelected).map((c) => c.key),
    lockedBeefTenths = {},
    customBeefShares = {
      tira: 40,
      vacio: 40,
      entrana: 20,
      bifeChorizo: 0,
      ojoBife: 0,
      picana: 0,
      colita: 0,
      matambre: 0,
      lomo: 0,
      marucha: 0
    }
  } = state;

  const appetiteConfig = APPETITE_LEVELS[appetite] || APPETITE_LEVELS.clasico;
  
  // Total Meat Target (Grams)
  let rawMeatGrams = (adults * appetiteConfig.meatPerAdult) + (kids * appetiteConfig.meatPerKid);

  // If salads and heavy sides are enabled, meat intake slightly reduces (~10%)
  if (includeSalads) {
    rawMeatGrams *= 0.92;
  }

  // Distribution buckets (percentages of total protein)
  // Let's establish balanced default ratios
  let sausageGrams = 0;
  let morcillaGrams = 0;
  let chickenGrams = 0;
  let porkGrams = 0;
  let achurasGrams = 0; // chinchulin/molleja

  // 1 chorizo per adult (or 1 every 2 if lots of other cuts), ~120g each
  if (includeAchuras) {
    const totalPeople = adults + (kids * 0.5);
    const chorizosCount = Math.round(totalPeople);
    const morcillasCount = Math.round(totalPeople * 0.5);
    sausageGrams = chorizosCount * 125;
    morcillaGrams = morcillasCount * 110;
    achurasGrams = adults * 60; // mollejas / chinchulines
  }

  let remainingGramsForMeats = Math.max(0, rawMeatGrams - (sausageGrams + morcillaGrams + achurasGrams));

  if (includeChicken && includePork) {
    chickenGrams = remainingGramsForMeats * 0.22;
    porkGrams = remainingGramsForMeats * 0.20;
  } else if (includeChicken) {
    chickenGrams = remainingGramsForMeats * 0.35;
  } else if (includePork) {
    porkGrams = remainingGramsForMeats * 0.30;
  }

  const potentialBeefGrams = Math.max(0, remainingGramsForMeats - chickenGrams - porkGrams);
  const potentialBeefKg = round(potentialBeefGrams / 1000, 1);

  const selectedKeys = Array.isArray(selectedBeefCuts) ? selectedBeefCuts : [];
  const beefGramsTotal = selectedKeys.length > 0 ? potentialBeefGrams : 0;
  const beefTotalKg = selectedKeys.length > 0 ? potentialBeefKg : 0;
  const beefTotalTenths = Math.round(beefTotalKg * 10);

  const lockedKeys = selectedKeys.filter((k) => Object.prototype.hasOwnProperty.call(lockedBeefTenths, k));
  const unlockedKeys = selectedKeys.filter((k) => !Object.prototype.hasOwnProperty.call(lockedBeefTenths, k));

  let resolvedLockedTenths = {};
  const rawLockedSum = lockedKeys.reduce((acc, k) => acc + Math.max(0, Math.round(Number(lockedBeefTenths[k]) || 0)), 0);

  if (lockedKeys.length > 0) {
    if (rawLockedSum > beefTotalTenths) {
      resolvedLockedTenths = distributeTenths(beefTotalTenths, lockedKeys, lockedBeefTenths);
    } else {
      lockedKeys.forEach((k) => {
        resolvedLockedTenths[k] = Math.max(0, Math.round(Number(lockedBeefTenths[k]) || 0));
      });
    }
  }

  const lockedSum = Object.values(resolvedLockedTenths).reduce((acc, v) => acc + v, 0);
  const remainingTenths = Math.max(0, beefTotalTenths - lockedSum);
  const unlockedTenths = distributeTenths(remainingTenths, unlockedKeys, customBeefShares);

  const cutTenths = { ...resolvedLockedTenths, ...unlockedTenths };
  if (unlockedKeys.length === 0 && lockedKeys.length > 0 && remainingTenths > 0) {
    // Fallback if all selected cuts were locked and total grew
    const extra = distributeTenths(beefTotalTenths, lockedKeys, resolvedLockedTenths);
    Object.assign(cutTenths, extra);
  }
  const getCutKg = (key) => round((cutTenths[key] || 0) / 10, 1);

  const tiraKg = getCutKg('tira');
  const vacioKg = getCutKg('vacio');
  const entranaKg = getCutKg('entrana');
  const bifeChorizoKg = getCutKg('bifeChorizo');
  const ojoBifeKg = getCutKg('ojoBife');
  const picanaKg = getCutKg('picana');
  const colitaKg = getCutKg('colita');
  const matambreKg = getCutKg('matambre');
  const lomoKg = getCutKg('lomo');
  const maruchaKg = getCutKg('marucha');

  const totalProteinsKg = (
    beefGramsTotal +
    chickenGrams +
    porkGrams +
    sausageGrams +
    morcillaGrams +
    achurasGrams
  ) / 1000;

  // Fuel Calculation (Based on Clarín formula: 1kg coal per 1kg meat + buffer, or 2.2kg wood, or 0 for Gas)
  let fuelResult = {
    type: fuelType,
    isGas: fuelType === 'gas',
    coalKg: 0,
    coalBags: 0,
    woodKg: 0,
    woodBags: 0,
    notes: ""
  };

  if (fuelType === 'gas') {
    fuelResult.notes = "Parrilla a gas seleccionada. No requiere carbón ni leña. Asegúrate de tener el tanque lleno o conexión de red.";
  } else if (fuelType === 'carbon') {
    // 1 kg per kg meat + 25% safety margin, minimum 3.5 kg
    const estimatedKg = Math.max(3.5, Math.ceil(totalProteinsKg * 1.25));
    const bags = Math.ceil(estimatedKg / 4); // bolsas de 4kg estándar
    fuelResult.coalKg = bags * 4;
    fuelResult.coalBags = bags;
    fuelResult.notes = `Regla de 1 kg/kg carne + margen. Te conviene comprar ${bags} bolsa${bags > 1 ? 's' : ''} de 4 kg (${bags * 4} kg total).`;
  } else if (fuelType === 'lena') {
    // 2.2 kg wood per kg meat, min 8 kg
    const estimatedKg = Math.max(8, Math.ceil(totalProteinsKg * 2.2));
    const bags = Math.ceil(estimatedKg / 10); // bolsas de 10kg
    fuelResult.woodKg = bags * 10;
    fuelResult.woodBags = bags;
    fuelResult.notes = `La leña rinde menos en brasa que el carbón. Te conviene comprar ${bags} bolsa${bags > 1 ? 's' : ''} de leña de 10 kg (${bags * 10} kg total).`;
  } else if (fuelType === 'mix') {
    const coalKg = Math.max(2.5, Math.ceil(totalProteinsKg * 0.6));
    const woodKg = Math.max(5, Math.ceil(totalProteinsKg * 1.2));
    const coalBags = Math.ceil(coalKg / 4);
    const woodBags = Math.ceil(woodKg / 10);
    fuelResult.coalKg = coalBags * 4;
    fuelResult.coalBags = coalBags;
    fuelResult.woodKg = woodBags * 10;
    fuelResult.woodBags = woodBags;
    fuelResult.notes = `Mix tradicional: ${coalBags} bolsa(s) de carbón para la base rápida + ${woodBags} bolsa(s) de leña para aroma y brasa sostenida.`;
  }

  // Sides & Bread
  const breadKg = includeBread ? Math.ceil(((adults * 150) + (kids * 80)) / 100) / 10 : 0;
  const baguettes = includeBread ? Math.ceil((adults + kids * 0.5) * 1.2) : 0;
  const saladsCount = includeSalads ? (adults > 8 ? 2 : 1) : 0;

  // Drinks
  let wineBottles = 0;
  let beerLiters = 0;
  let sodaLiters = 0;
  let iceBags = 0;

  if (includeDrinks) {
    wineBottles = Math.ceil(adults * 0.4); // ~1 botella cada 2.5 adultos
    beerLiters = Math.ceil(adults * 1.0); // 1L de cerveza por adulto
    sodaLiters = Math.ceil((adults * 0.5) + (kids * 0.75));
    iceBags = Math.max(1, Math.ceil((adults + kids) / 5));
  }

  return {
    people: { adults, kids, total: adults + kids },
    totalProteinsKg: round(totalProteinsKg, 1),
    beefTotalKg,
    potentialBeefKg,
    meats: {
      tiraKg: round(tiraKg, 1),
      vacioKg: round(vacioKg, 1),
      entranaKg: round(entranaKg, 1),
      bifeChorizoKg: round(bifeChorizoKg, 1),
      ojoBifeKg: round(ojoBifeKg, 1),
      picanaKg: round(picanaKg, 1),
      colitaKg: round(colitaKg, 1),
      matambreKg: round(matambreKg, 1),
      lomoKg: round(lomoKg, 1),
      maruchaKg: round(maruchaKg, 1),
      porkKg: round(porkGrams / 1000, 1),
      chickenKg: round(chickenGrams / 1000, 1),
      chorizos: Math.round(sausageGrams / 125),
      morcillas: Math.round(morcillaGrams / 110),
      provoletas: Math.max(1, Math.ceil(adults / 4)),
      mollejasKg: round(achurasGrams / 1000, 1)
    },
    fuel: fuelResult,
    sides: {
      breadKg: round(breadKg, 1),
      baguettes,
      salads: includeSalads ? ["Ensalada Mixta (Lechuga, Tomate, Cebolla)", "Papas / Batatas al plomo"] : []
    },
    drinks: {
      wineBottles,
      beerLiters,
      sodaLiters,
      iceBags
    }
  };
}

function round(value, decimals = 1) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function formatWhatsAppShoppingList(calc, state) {
  let lines = [];
  lines.push(`🥩 *LISTA DE COMPRAS PARA EL ASADO* 🥩`);
  lines.push(`👥 Comensales: ${calc.people.adults} adultos + ${calc.people.kids} niños`);
  lines.push(`⚖️ Total estimado de carne: *${calc.totalProteinsKg} kg*`);
  lines.push(``);

  lines.push(`🔥 *FUEGO:*`);
  if (calc.fuel.isGas) {
    lines.push(`• Parrilla a gas (verificar tanque/conexión)`);
  } else if (calc.fuel.type === 'carbon') {
    lines.push(`• Carbón: ${calc.fuel.coalBags} bolsa(s) de 4kg (~${calc.fuel.coalKg} kg)`);
  } else if (calc.fuel.type === 'lena') {
    lines.push(`• Leña: ${calc.fuel.woodBags} bolsa(s) de 10kg (~${calc.fuel.woodKg} kg)`);
  } else {
    lines.push(`• Carbón: ${calc.fuel.coalBags} bolsa(s) de 4kg`);
    lines.push(`• Leña: ${calc.fuel.woodBags} bolsa(s) de 10kg`);
  }
  lines.push(``);

  lines.push(`🥩 *CARNICERÍA:*`);
  if (calc.meats.tiraKg > 0) lines.push(`• Asado de tira: ${calc.meats.tiraKg} kg`);
  if (calc.meats.vacioKg > 0) lines.push(`• Vacío: ${calc.meats.vacioKg} kg`);
  if (calc.meats.entranaKg > 0) lines.push(`• Entraña: ${calc.meats.entranaKg} kg`);
  if (calc.meats.bifeChorizoKg > 0) lines.push(`• Bife de Chorizo: ${calc.meats.bifeChorizoKg} kg`);
  if (calc.meats.ojoBifeKg > 0) lines.push(`• Ojo de Bife: ${calc.meats.ojoBifeKg} kg`);
  if (calc.meats.picanaKg > 0) lines.push(`• Picaña: ${calc.meats.picanaKg} kg`);
  if (calc.meats.colitaKg > 0) lines.push(`• Colita de Cuadril: ${calc.meats.colitaKg} kg`);
  if (calc.meats.matambreKg > 0) lines.push(`• Matambre: ${calc.meats.matambreKg} kg`);
  if (calc.meats.lomoKg > 0) lines.push(`• Lomo: ${calc.meats.lomoKg} kg`);
  if (calc.meats.maruchaKg > 0) lines.push(`• Marucha / Arañita: ${calc.meats.maruchaKg} kg`);
  if (calc.meats.porkKg > 0) lines.push(`• Pechito / Bondiola de cerdo: ${calc.meats.porkKg} kg`);
  if (calc.meats.chickenKg > 0) lines.push(`• Pollo (pata-muslo): ${calc.meats.chickenKg} kg`);
  if (calc.meats.chorizos > 0) lines.push(`• Chorizos: ${calc.meats.chorizos} unidades`);
  if (calc.meats.morcillas > 0) lines.push(`• Morcillas: ${calc.meats.morcillas} unidades`);
  if (calc.meats.mollejasKg > 0) lines.push(`• Mollejas: ${calc.meats.mollejasKg} kg`);
  if (state.includeAchuras) lines.push(`• Provoleta: ${calc.meats.provoletas} rueda(s)`);
  lines.push(``);

  lines.push(`🥖 *PAN & VERDULERÍA:*`);
  if (calc.sides.breadKg > 0) lines.push(`• Pan francés / baguettes: ~${calc.sides.breadKg} kg (${calc.sides.baguettes} unidades)`);
  if (state.includeSalads) {
    lines.push(`• Lechuga, Tomate, Cebolla (ensalada)`);
    lines.push(`• Papas para hacer al plomo`);
    lines.push(`• Limones (para achuras y carne)`);
  }
  lines.push(`• Sal parrillera entrefina`);
  lines.push(``);

  if (state.includeDrinks) {
    lines.push(`🍷 *BEBIDAS & HIELO:*`);
    lines.push(`• Vino tinto: ${calc.drinks.wineBottles} botella(s)`);
    lines.push(`• Cerveza: ${calc.drinks.beerLiters} L`);
    lines.push(`• Gaseosas / Agua: ${calc.drinks.sodaLiters} L`);
    lines.push(`• Hielo: ${calc.drinks.iceBags} bolsa(s)`);
    lines.push(``);
  }

  lines.push(`_Calculado con Asado Calculator_ 🥩🔥`);
  return lines.join("\n");
}
