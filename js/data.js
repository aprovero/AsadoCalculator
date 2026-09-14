// Asado Calculator & Cut Encyclopedia Data

export const CUTS_ENCYCLOPEDIA = [
  {
    id: "asado-de-tira",
    name: "Asado de Tira / Costillar",
    englishName: "Short Ribs / Flanken Cut",
    category: "vacuno",
    anatomy: "Zona costillar (caja torácica del novillo). Se corta de forma transversal a los huesos de las costillas.",
    bestFor: "El corte emblema del asado. Ideal a fuego medio-bajo y constante para dorar bien la grasa y que la carne quede tierna pegada al hueso.",
    fireLevel: "Fuego medio (la mano aguanta 7-8 segundos)",
    cookingTime: "45 a 60 min (según grosor: tira ancha o tira fina)",
    fatLevel: "Medio - Alto (grasa intramuscular y perióstica)",
    tenderness: "Muy tierna si se cocina al punto justo",
    tips: "Siempre se coloca primero del lado del hueso para que absorba calor y no queme la carne. Se sala con sal parrillera o entrefina unos minutos antes de tirar a la parrilla.",
    svgPartId: "cow-ribs"
  },
  {
    id: "vacio",
    name: "Vacío",
    englishName: "Flank Steak / Bavette",
    category: "vacuno",
    anatomy: "Región lateral de los cuartos traseros, entre las costillas falsas y las caderas (zona abdominal).",
    bestFor: "Cocción lenta y paciente. Gran sabor gracias al cuerito o tela que lo recubre, que queda crocante mientras el interior se mantiene jugoso.",
    fireLevel: "Fuego bajo a medio (la mano aguanta 8-10 segundos)",
    cookingTime: "60 a 90 min (fuego pausado)",
    fatLevel: "Medio (con una capa externa de grasa y membrana protectora)",
    tenderness: "Fibrosa pero muy jugosa y tierna con cocción lenta",
    tips: "No le saques la membrana ('cuerito'). Se empieza a cocinar con el cuerito hacia abajo para que quede bien crocante. No apurar el fuego porque se seca o queda gomoso.",
    svgPartId: "cow-flank"
  },
  {
    id: "entrana",
    name: "Entraña",
    englishName: "Skirt Steak",
    category: "vacuno",
    anatomy: "Es la parte carnosa del diafragma, adherida a las costillas del animal.",
    bestFor: "Vuelta y vuelta a fuego fuerte. Una de las estrellas de la parrilla moderna por su terneza extrema e intenso sabor.",
    fireLevel: "Fuego fuerte (la mano aguanta 4-5 segundos)",
    cookingTime: "15 a 25 min en total",
    fatLevel: "Medio",
    tenderness: "Extremadamente tierna",
    tips: "Muchos prefieren dejarle la fina piel para que quede crocante; otros se la retiran. Se cocina rápido para que no pierda su jugo. Excelente con un toque de limón o chimichurri.",
    svgPartId: "cow-plate"
  },
  {
    id: "matambre",
    name: "Matambre Vacuno",
    englishName: "Flank / Rose Meat",
    category: "vacuno",
    anatomy: "Músculo plano y delgado situado entre el cuero y el costillar del animal.",
    bestFor: "Matambre a la pizza (con salsa, muzzarella y orégano) o a la parrilla dorado crocante con limón.",
    fireLevel: "Fuego medio-fuerte",
    cookingTime: "25 a 35 min",
    fatLevel: "Medio (capa de grasa lateral)",
    tenderness: "Firme; requiere buena técnica o marinado previo si es grueso",
    tips: "Primero se tuesta la cara con grasa hacia las brasas. Para que no quede duro, algunos parrilleros lo tiernizan previamente en leche o caldo, aunque si es de novillo joven va directo a la parrilla.",
    svgPartId: "cow-brisket"
  },
  {
    id: "ojo-de-bife",
    name: "Ojo de Bife / Bife Ancho",
    englishName: "Ribeye",
    category: "vacuno",
    anatomy: "Sector dorsal delantero, deshuesado del lomo alto (vértebras dorsales 5 a 10).",
    bestFor: "Para quienes buscan la máxima jugosidad y terneza. Perfecto en bifes gruesos (2-3 dedos) sellados a fuego vivo y terminados a fuego medio.",
    fireLevel: "Fuego fuerte inicial (sellado), luego fuego medio",
    cookingTime: "20 a 30 min (según punto deseado: jugoso o a punto)",
    fatLevel: "Alto marmoleo intramuscular",
    tenderness: "Suprema",
    tips: "El marmoleo (grasa entreverada) se derrite en la parrilla aportando un sabor inigualable. Cortar grueso y no sobrecocinar.",
    svgPartId: "cow-loin-front"
  },
  {
    id: "bife-de-chorizo",
    name: "Bife de Chorizo / Bife Angosto",
    englishName: "Striploin / New York Strip",
    category: "vacuno",
    anatomy: "Parte externa del lomo bajo (a lo largo de las vértebras lumbares).",
    bestFor: "Corte clásico de los bodegones y parrillas argentinas. Carne tierna y magra con una franja lateral de grasa que le da todo el sabor.",
    fireLevel: "Fuego medio-fuerte",
    cookingTime: "25 a 35 min en bifes gruesos",
    fatLevel: "Medio (grasa de cobertura perimetral)",
    tenderness: "Muy tierna y consistente",
    tips: "Parar los bifes sobre la franja de grasa al principio para que se dore y desgrase bien antes de cocinar las caras principales.",
    svgPartId: "cow-shortloin"
  },
  {
    id: "colita-de-cuadril",
    name: "Colita de Cuadril",
    englishName: "Tri-Tip",
    category: "vacuno",
    anatomy: "Músculo de forma triangular situado en la parte baja del cuarto trasero (anca del animal).",
    bestFor: "Pieza entera asada a fuego bajo y parejo. Excelente para cortar en rodajas finas, muy rendidora y magra.",
    fireLevel: "Fuego bajo a medio constante",
    cookingTime: "40 a 50 min",
    fatLevel: "Bajo (carne muy magra con una pequeña tapa de grasa)",
    tenderness: "Alta si no se sobrecocina",
    tips: "Al ser tan magra, si se pasa de punto se seca fácilmente. Se recomienda sacarla jugosa o a punto rosado.",
    svgPartId: "cow-rump"
  },
  {
    id: "picana",
    name: "Picaña / Tapa de Cuadril",
    englishName: "Top Sirloin Cap / Picanha",
    category: "vacuno",
    anatomy: "Capa superior del cuadril, rematada por una generosa y uniforme capa de grasa.",
    bestFor: "Pieza entera o en bifes en forma de herradura ensartados en espadín. La grasa se derrite humedeciendo la carne.",
    fireLevel: "Fuego medio",
    cookingTime: "35 a 45 min entera",
    fatLevel: "Alto en cobertura, magra por dentro",
    tenderness: "Muy tierna",
    tips: "Hacer cortes en cuadrícula superficiales sobre la grasa (sin tocar la carne) para que penetre la sal y dore parejo sin curvarse.",
    svgPartId: "cow-rump"
  },
  {
    id: "tapa-de-asado",
    name: "Tapa de Asado",
    englishName: "Rib Cover / Cap of Ribs",
    category: "vacuno",
    anatomy: "Cubre la parte superior y delantera del costillar.",
    bestFor: "Corte sabroso y tradicional para cocciones lentas o marinado previo.",
    fireLevel: "Fuego medio-bajo",
    cookingTime: "50 a 60 min",
    fatLevel: "Medio",
    tenderness: "Firme con buen nervio; requiere cocción lenta",
    tips: "Cortar siempre en sentido contrario a las fibras para mejorar la textura en boca.",
    svgPartId: "cow-chuck"
  },
  {
    id: "lomo",
    name: "Lomo",
    englishName: "Tenderloin / Filet Mignon",
    category: "vacuno",
    anatomy: "Músculo alargado y cilíndrico ubicado bajo las vértebras lumbares, zona no trabajada por el animal.",
    bestFor: "El corte más tierno y magro de la res. Ideal en medallones envueltos en panceta o pieza entera sellada a fuego fuerte.",
    fireLevel: "Fuego medio-fuerte",
    cookingTime: "20 a 30 min",
    fatLevel: "Muy bajo (casi nulo)",
    tenderness: "Máxima (se corta con tenedor)",
    tips: "Al no tener grasa propia, no tolera el fuego excesivo ni tiempos largos porque se reseca. Retirar apenas al punto o jugoso.",
    svgPartId: "cow-tenderloin"
  },
  {
    id: "chorizo",
    name: "Chorizo Criollo / Parrillero",
    englishName: "Fresh Pork & Beef Sausage",
    category: "achuras",
    anatomy: "Embutido fresco típicamente 70% cerdo y 30% vacuno con especias (pimentón, nuez moscada, vino).",
    bestFor: "Apertura obligatoria del asado en choripán con chimichurri o salsa criolla.",
    fireLevel: "Fuego medio (nunca fuego directo arrebatador)",
    cookingTime: "30 a 40 min",
    fatLevel: "Alto",
    tenderness: "Jugoso",
    tips: "¡No pinchar el chorizo! Al pincharlo pierde sus jugos naturales y queda seco. Dorar despacio de todos sus lados.",
    svgPartId: "cow-extras"
  },
  {
    id: "morcilla",
    name: "Morcilla Criolla",
    englishName: "Blood Sausage",
    category: "achuras",
    anatomy: "Embutido a base de sangre cocida, tocino, cebolla y especias.",
    bestFor: "Entrada del asado. Al estar previamente cocida, solo necesita calentarse y adquirir una piel crocante.",
    fireLevel: "Fuego bajo o en la parte alta/fría de la parrilla",
    cookingTime: "15 a 20 min",
    fatLevel: "Medio",
    tenderness: "Cremosa por dentro, crocante por fuera",
    tips: "Ponerla sobre la parrilla cuando ya casi sale la carne o a un costado con poco calor para que no reviente el cuero.",
    svgPartId: "cow-extras"
  },
  {
    id: "mollejas",
    name: "Mollejas",
    englishName: "Sweetbreads",
    category: "achuras",
    anatomy: "Glándula del timo (molleja de corazón) o glándula parótida (molleja de cogote).",
    bestFor: "El caviar del asado. Muy crocante por fuera y suave y mantecosa por dentro, con abundante limón.",
    fireLevel: "Fuego medio a fuerte",
    cookingTime: "35 a 45 min",
    fatLevel: "Alto",
    tenderness: "Excepcional",
    tips: "Blanquearlas previamente en agua hirviendo con limón o directamente asarlas con paciencia aplastándolas ligeramente para que queden bien doradas y crocantes.",
    svgPartId: "cow-neck"
  },
  {
    id: "chinchulines",
    name: "Chinchulines",
    englishName: "Beef Small Intestine",
    category: "achuras",
    anatomy: "Primera porción del intestino delgado vacuno.",
    bestFor: "Los amantes de las achuras crocantes. Imprescindible servirlos bien calientes y crocantes con sal y limón.",
    fireLevel: "Fuego medio constante",
    cookingTime: "40 a 50 min",
    fatLevel: "Medio",
    tenderness: "Crocante exterior, textura tierna interior",
    tips: "Cocinar en forma de trenza o rosca a fuego suave hasta que estén bien dorados de ambos lados. Se salan y enlimonan al final.",
    svgPartId: "cow-belly"
  },
  {
    id: "provoleta",
    name: "Provoleta Parrillera",
    englishName: "Provolone Cheese Slab",
    category: "achuras",
    anatomy: "Queso hilado semiduro argentino derivado del provolone italiano.",
    bestFor: "Queso derretido con corteza crocante, aceite de oliva, orégano y ají molido.",
    fireLevel: "Fuego medio-fuerte en provoletera o directo a la parrilla bien caliente",
    cookingTime: "10 a 15 min",
    fatLevel: "Alto",
    tenderness: "Fundido por dentro, crocante por fuera",
    tips: "Dejar orear la rodaja de queso descubierta en la heladera 24h antes para que arme corteza y no se derrita entre los hierros.",
    svgPartId: "cow-extras"
  }
];

export const FUEL_TYPES = {
  carbon: {
    id: "carbon",
    name: "Carbón Vegetal",
    description: "Regla clásica: 1 kg de carbón por cada 1 kg de carne (+ margen de seguridad del 25%).",
    ratio: 1.25,
    unit: "kg",
    bagSize: 4, // bolsas estándar de 4 kg o 5 kg
    bagLabel: "bolsas de carbón (4 kg)",
    icon: "🔥"
  },
  lena: {
    id: "lena",
    name: "Leña (Quebracho / Espinillo)",
    description: "La leña pierde masa al convertirse en brasas: ~2.2 kg de leña dura por cada 1 kg de carne.",
    ratio: 2.2,
    unit: "kg",
    bagSize: 10, // bolsas estándar de 10 kg
    bagLabel: "bolsas de leña (10 kg)",
    icon: "🪵"
  },
  mix: {
    id: "mix",
    name: "Mix Leña + Carbón",
    description: "Fuego mixto: leña para aroma y duración + carbón para encendido rápido y base de brasas.",
    ratioCarbon: 0.6,
    ratioLena: 1.2,
    icon: "🔥🪵"
  },
  gas: {
    id: "gas",
    name: "Parrilla a Gas",
    description: "No requiere carbón ni leña. Solo asegurate de tener la garrafa cargada o gas de red.",
    ratio: 0,
    icon: "🔵"
  }
};

export const APPETITE_LEVELS = {
  tranqui: {
    id: "tranqui",
    name: "Tranqui / Liviano",
    desc: "Para picar sin exagerar o con muchas ensaladas",
    meatPerAdult: 350, // gramos
    meatPerKid: 200
  },
  clasico: {
    id: "clasico",
    name: "Clásico Parrillero",
    desc: "El punto justo: nadie se queda con hambre",
    meatPerAdult: 500, // gramos
    meatPerKid: 250
  },
  gloton: {
    id: "gloton",
    name: "Picapedrero / Buen Diente",
    desc: "Comedores profesionales y sobremesa larga",
    meatPerAdult: 650, // gramos
    meatPerKid: 350
  }
};
