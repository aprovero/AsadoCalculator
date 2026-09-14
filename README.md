# 🥩 Calculadora de Asado & Enciclopedia de Cortes

Una aplicación web moderna, rápida y sin dependencias para calcular con precisión de asador todo lo necesario para un asado: carne, carbón, leña, achuras, guarniciones y bebidas. Además incluye una **Enciclopedia Interactiva de Cortes Vacunos** con mapa anatómico de la vaca.

Inspirada en el minimalismo y usabilidad de **[DoughGuy](https://doughguy.co/pages/dough)** y las reglas de fuego del **[artículo de Clarín Gourmet](https://www.clarin.com/gourmet/carbon-necesita-asado-calcular-cantidad-kilos-carne_0_7l5dgyQsDW.html)**.

---

## ✨ Características Principales

### 1. Calculadora Dinámica en Vivo (Cero recargas)
- **Controles Duales (Sliders + Inputs Numéricos):** Podés deslizar o **escribir directamente el número exacto** en cada parámetro (comensales, niños, porcentaje de cortes vacunos, etc.).
- **Niveles de Apetito:**
  - *Tranqui / Liviano:* ~350g por adulto.
  - *Clásico Parrillero:* ~500g por adulto (estándar tradicional).
  - *Picapedrero / Buen Diente:* ~650g por adulto.
- **Selector de Combustible (Carbón, Leña, Mix, Gas):**
  - **Carbón vegetal:** Aplica la regla áurea de *1 kg de carbón por cada 1 kg de carne* con margen de seguridad del 25%, redondeando automáticamente al tamaño comercial de bolsas de 4 kg.
  - **Leña (Quebracho / Espinillo):** Rinde menos masa en brasa que el carbón (~2.2 kg de leña por cada 1 kg de carne) redondeado a bolsas de 10 kg.
  - **Mix Leña + Carbón:** Base rápida con carbón + aroma y brasa sostenida con leña.
  - **Parrilla a Gas:** **0 kg de carbón o leña.** Te recuerda verificar la garrafa o conexión a gas.
- **Personalización de Carnes & Acompañamientos:**
  - Toggles para incluir o quitar: Pollo, Pechito/Bondiola de Cerdo, Achuras & Chori, Pan francés, Ensaladas & Papas al plomo, y Bebidas (vino, cerveza, gaseosas y bolsas de hielo).
  - Sliders para balancear los cortes vacunos (Asado de tira, Vacío, Entraña).
- **Lista de Compras Lista para WhatsApp:** Botón de un solo clic que formatea la comanda con emojis para enviarla al grupo de amigos o familiares.
- **Dividir la Cuenta ("La Vaquita"):** Ingresás el costo total estimado y te divide al instante el valor por persona.

---

### 2. 🐂 Enciclopedia de Cortes & Anatomía Vacuna
Ubicada debajo de la calculadora:
- **Diagrama Anatómico Interactivo:** Mapa vectorial de la vaca con zonas delimitadas (Costillar, Vacío, Entraña, Bife de Chorizo, Ojo de Bife, Cuadril, Mollejas, etc.).
- **Interactividad Bidireccional:**
  - Hacé clic en cualquier corte sobre la vaca y la enciclopedia baja automáticamente a la tarjeta de ese corte.
  - Pasá el mouse sobre la tarjeta de un corte y se iluminará su ubicación en la vaca.
- **Tu Propia Foto de la Vaca:**
  - Cuenta con un botón **"Subir / Cambiar Foto de la Vaca"** para cargar cualquier imagen desde tu computadora o celular (se guarda en tu navegador para tus próximas visitas).
  - También podés cambiar entre la vista de *Diagrama Interactivo* y *Mi Foto*.
- **Fichas Técnicas de Cada Corte:**
  - **Ubicación anatómica:** De qué parte del animal proviene.
  - **Para qué es mejor:** Estilo de cocción (fuego lento, vuelta y vuelta, a la cruz).
  - **Fuego y tiempo estimado:** Intensidad en segundos de aguante de mano.
  - **Nivel de grasa y terneza.**
  - **Secretos y tips del asador:** Salado, corte del cuerito, cómo empezar la cocción.
- **Buscador y Filtros en Tiempo Real:** Filtrá por texto ("vacío", "tira", "entraña") o por categorías (*Vacunos* vs *Achuras & Extras*).

---

## 🚀 Cómo Usarlo

No requiere instalar Node.js ni compilar nada. Está construido con tecnologías web modernas estándar (HTML5, CSS3, JavaScript ES Modules y SVG interactivo).

### Opción 1: Abrir directamente en el navegador
Hacé doble clic en el archivo `index.html` con cualquier navegador (Chrome, Safari, Firefox, Edge).

### Opción 2: Servidor local ligero (Recomendado para desarrollo)
Podés correr el servidor interno de Python:
```bash
python3 -m http.server 8080
```
Y abrir `http://localhost:8080` en tu navegador.

---

## 📂 Estructura del Proyecto

```
AsadoCalculator/
├── index.html            # Estructura semántica, calculadora y enciclopedia
├── css/
│   └── style.css         # Estilos inspirados en DoughGuy (modo oscuro rústico/moderno)
├── js/
│   ├── app.js            # Controlador principal, sincronización dual y eventos
│   ├── calculator.js     # Motor de cálculo de carnes, carbón/leña y lista de WhatsApp
│   └── data.js           # Base de datos de cortes, ratios de combustibles y apetito
├── assets/
│   └── cow-cuts.svg      # Diagrama vectorial interactivo de la vaca
└── README.md             # Documentación y guía de uso
```

---

¡Que disfrutes del fuego y del asado! 🇦🇷🔥
