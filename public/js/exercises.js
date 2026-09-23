/* ══════════════════════════════════════════════════════════
   BASES DE DATOS DE PREGUNTAS Y EJERCICIOS
══════════════════════════════════════════════════════════ */

const ACHIEVEMENTS = [
  { id:'first_star',  emoji:'⛏️', name:'Primer Golpe',         desc:'Respondiste tu primera pregunta. ¡El Héroe empieza su aventura!',   cond: s => s.totalAnswered >= 1 },
  { id:'star5',       emoji:'💎', name:'5 Diamantes',           desc:'Acumulaste 5 diamantes en el inventario.',                           cond: s => s.stars >= 5 },
  { id:'star20',      emoji:'🌟', name:'Cofre de Gemas',         desc:'¡20 diamantes! Tu inventario brilla en la oscuridad.',              cond: s => s.stars >= 20 },
  { id:'star50',      emoji:'🏆', name:'Tesoro del Overworld',  desc:'¡50 diamantes! Sos la leyenda del Overworld.',                       cond: s => s.stars >= 50 },
  { id:'perfect',     emoji:'🗡️', name:'Espada Encantada',      desc:'Completaste una misión sin ningún error. ¡Puro crafteo!',           cond: s => s.perfectSections >= 1 },
  { id:'perfect3',    emoji:'👑', name:'Rey del Overworld',     desc:'3 misiones perfectas. ¡Los mobs te temen!',                         cond: s => s.perfectSections >= 3 },
  { id:'math_done',   emoji:'🔢', name:'Minero de Números',     desc:'Completaste una misión de la mina de diamantes.',                   cond: s => s.mathSections >= 1 },
  { id:'lang_done',   emoji:'📜', name:'Lector de Tomos',       desc:'Descifraste un libro encantado del Overworld.',                      cond: s => s.langSections >= 1 },
  { id:'eng_done',    emoji:'🗺️', name:'Explorador de Mapas',   desc:'Exploraste el mapa del mundo en otro idioma.',                      cond: s => s.engSections >= 1 },
  { id:'all_subjects',emoji:'🎓', name:'Héroe Completo',        desc:'Misiones de minería, tomos y mapas completadas. ¡Leyenda total!',   cond: s => s.mathSections>=1&&s.langSections>=1&&s.engSections>=1 },
  { id:'ans10',       emoji:'🔥', name:'En Llamas',             desc:'10 respuestas correctas. ¡Como el fuego del Nether!',               cond: s => s.totalCorrect >= 10 },
  { id:'ans30',       emoji:'💥', name:'Destructor de Bloques', desc:'30 respuestas correctas. ¡Nada te detiene!',                        cond: s => s.totalCorrect >= 30 },
  { id:'hard_done',   emoji:'🌋', name:'Héroe del Nether',      desc:'Completaste una misión en el Bioma Nether. ¡Valentísimo!',         cond: s => s.hardSections >= 1 },
  { id:'hard3',       emoji:'🐉', name:'Domador de Dragones',   desc:'3 misiones en el Nether. ¡El Ender Dragon tiembla!',               cond: s => s.hardSections >= 3 },
  { id:'medium_done', emoji:'🏜️', name:'Explorador del Desierto',desc:'Completaste una misión en el Bioma Desierto.',                    cond: s => s.mediumSections >= 1 },
  { id:'science_done',emoji:'🔬', name:'Científico del Overworld',desc:'Descubriste los secretos del Laboratorio y la Naturaleza.',      cond: s => (s.scienceSections || 0) >= 1 },
  { id:'history_done',emoji:'🏛️', name:'Cronista del Tiempo',    desc:'Viajaste por la historia y exploraste civilizaciones pasadas.',   cond: s => (s.historySections || 0) >= 1 },
  { id:'daily_done',  emoji:'⚡', name:'Desafío Diario',          desc:'Completaste con éxito el reto especial del día.',                  cond: s => (s.dailySections || 0) >= 1 },
  { id:'fashion_hero',emoji:'👑', name:'Héroe con Estilo',         desc:'Desbloqueaste y equipaste una nueva skin en la Tienda.',           cond: s => (s.customSkins || 0) >= 1 },
];

/* ══════════════════════════════════════════════════════════
   CATÁLOGO DE LA TIENDA DE SKINS Y AVATARES VOXEL
══════════════════════════════════════════════════════════ */
const SHOP_ITEMS = [
  { id: 'skin_steve',   name: 'Guerrero Clásico',  emoji: '🧒', price: 0,   desc: 'El explorador original del Overworld.', type: 'skin' },
  { id: 'skin_alex',    name: 'Arquera Valiente',  emoji: '👧', price: 0,   desc: 'Ágil y experta en arco y flecha.', type: 'skin' },
  { id: 'skin_knight',  name: 'Caballero Diamante',emoji: '🛡️', price: 15,  desc: 'Armadura forjada con diamantes puros.', type: 'skin' },
  { id: 'skin_wizard',  name: 'Mago Arcano',       emoji: '🧙‍♂️', price: 25,  desc: 'Domina los encantamientos antiguos.', type: 'skin' },
  { id: 'skin_robot',   name: 'Gólem Cibernético', emoji: '🤖', price: 30,  desc: 'Construido con redstone y precisión.', type: 'skin' },
  { id: 'skin_ninja',   name: 'Ninja de las Sombras', emoji: '🥷', price: 35, desc: 'Silencioso y veloz como el viento.', type: 'skin' },
  { id: 'skin_dragon',  name: 'Domador de Dragones', emoji: '🐲', price: 50, desc: 'Tiene el poder del Ender Dragon.', type: 'skin' },
  { id: 'skin_astronaut', name: 'Astronauta Espacial', emoji: '👨‍🚀', price: 40, desc: 'Explorador de galaxias lejanas.', type: 'skin' },
  { id: 'skin_super',   name: 'Superhéroe Cósmico', emoji: '🦸', price: 45,  desc: 'Capaz de volar sobre los biomas.', type: 'skin' },
  { id: 'skin_alien',   name: 'Visitante Alien',   emoji: '👽', price: 60,  desc: 'Vino de otra dimensión con sabiduría.', type: 'skin' }
];

/* ══════════════════════════════════════════════════════════
   CIENCIAS NATURALES & EXPERIMENTOS
══════════════════════════════════════════════════════════ */
const SCIENCE_QUESTIONS = {
  ecosistemas: [
    { q: '¿Qué necesitan las plantas para hacer la fotosíntesis?', opts: ['Luz del sol, agua y aire', 'Solo tierra y oscuridad', 'Jugo de frutas', 'Caramelos'], ans: 'Luz del sol, agua y aire' },
    { q: '¿Cuál de estos animales es un hervíboro?', opts: ['Vaca 🐄', 'León 🦁', 'Tiburón 🦈', 'Lobo 🐺'], ans: 'Vaca 🐄' },
    { q: '¿Qué tipo de animal es el delfín?', opts: ['Mamífero acuático 🐬', 'Pez con escamas', 'Reptil', 'Anfibio'], ans: 'Mamífero acuático 🐬' },
    { q: '¿En qué bioma podemos encontrar cactus y camellos?', opts: ['Desierto 🏜️', 'Selva tropical 🌴', 'Polo Norte ❄️', 'Océano 🌊'], ans: 'Desierto 🏜️' },
    { q: '¿Cómo se llaman los animales que comen plantas y carne?', opts: ['Omnívoros', 'Carnívoros', 'Herbívoros', 'Insectívoros'], ans: 'Omnívoros' }
  ],
  cuerpo_humano: [
    { q: '¿Cuál es el órgano que bombea la sangre por todo nuestro cuerpo?', opts: ['El corazón ❤️', 'El estómago 🫁', 'El cerebro 🧠', 'Los pulmones'], ans: 'El corazón ❤️' },
    { q: '¿Cuántos sentidos principales tenemos los seres humanos?', opts: ['5 sentidos 👁️👃👂👅✋', '3 sentidos', '10 sentidos', '2 sentidos'], ans: '5 sentidos 👁️👃👂👅✋' },
    { q: '¿Qué huesos protegen nuestro cerebro?', opts: ['El cráneo 💀', 'Las costillas', 'La columna', 'El fémur'], ans: 'El cráneo 💀' },
    { q: '¿Qué sentido usamos para escuchar las melodías musicales?', opts: ['El oído 👂', 'La vista 👁️', 'El gusto 👅', 'El tacto ✋'], ans: 'El oído 👂' },
    { q: '¿Qué órgano usamos principalmente para respirar oxígeno?', opts: ['Los pulmones 🫁', 'El hígado', 'El estómago', 'Los riñones'], ans: 'Los pulmones 🫁' }
  ],
  materia_energia: [
    { q: '¿En qué estado se encuentra el agua cuando se congela en hielo?', opts: ['Sólido 🧊', 'Líquido 💧', 'Gaseoso 💨', 'Plasma'], ans: 'Sólido 🧊' },
    { q: '¿Cuál es la principal fuente natural de luz y calor para la Tierra?', opts: ['El Sol ☀️', 'La Luna 🌙', 'Las fogatas 🔥', 'Las linternas 🔦'], ans: 'El Sol ☀️' },
    { q: '¿Qué le pasa al agua líquida cuando hierve a 100°C?', opts: ['Se convierte en vapor de agua 💨', 'Se convierte en hielo 🧊', 'Se vuelve arena', 'Desaparece sin evaporarse'], ans: 'Se convierte en vapor de agua 💨' },
    { q: '¿Qué objeto es atraído fuertemente por un imán?', opts: ['Un clavo de hierro 🧲', 'Una hoja de papel 📄', 'Una goma de borrar', 'Un bloque de madera 🪵'], ans: 'Un clavo de hierro 🧲' }
  ],
  planeta_espacio: [
    { q: '¿Cuál es el planeta en el que vivimos?', opts: ['La Tierra 🌍', 'Marte 🔴', 'Júpiter 🪐', 'Venus 🌟'], ans: 'La Tierra 🌍' },
    { q: '¿Cuánto tarda la Tierra en dar una vuelta completa sobre sí misma?', opts: ['24 horas (1 día) ⏰', '365 días (1 año)', '12 horas', '1 mes'], ans: '24 horas (1 día) ⏰' },
    { q: '¿Cuál es el satélite natural que gira alrededor de la Tierra?', opts: ['La Luna 🌙', 'El Sol ☀️', 'La Estrella Polar', 'Un asteroide'], ans: 'La Luna 🌙' },
    { q: '¿Qué movimiento de la Tierra produce las 4 estaciones del año?', opts: ['Traslación alrededor del Sol ☀️', 'Rotación sobre sí misma', 'Viento polar', 'Las mareas'], ans: 'Traslación alrededor del Sol ☀️' }
  ]
};

/* ══════════════════════════════════════════════════════════
   HISTORIA, SOCIEDAD & GEOGRAFÍA
══════════════════════════════════════════════════════════ */
const HISTORY_QUESTIONS = {
  civilizaciones: [
    { q: '¿En qué país antiguo se construyeron las famosas Grandes Pirámides?', opts: ['Egipto 🏛️', 'Roma ⚔️', 'Grecia 🏺', 'China 🏯'], ans: 'Egipto 🏛️' },
    { q: '¿Qué civilización inventó los Juegos Olímpicos en la antigüedad?', opts: ['Grecia antigua 🇬🇷', 'Vikingos 🛡️', 'Mayas 🌿', 'Egipcios 🏺'], ans: 'Grecia antigua 🇬🇷' },
    { q: '¿Qué usaban los antiguos caballeros medievales para protegerse?', opts: ['Armaduras de metal y escudos 🛡️', 'Ropa de seda fina', 'Cascos de plástico', 'Capas invisibles'], ans: 'Armaduras de metal y escudos 🛡️' },
    { q: '¿Cómo se comunicaban las personas antes de que existieran los teléfonos?', opts: ['Cartas escritas a mano y mensajeros ✉️', 'Por WhatsApp', 'Por videollamada', 'Por satélite'], ans: 'Cartas escritas a mano y mensajeros ✉️' }
  ],
  sociedad_normas: [
    { q: '¿Para qué sirven las normas de convivencia en la escuela y en casa?', opts: ['Para convivir en paz, respeto y seguridad 🤝', 'Para aburrir a la gente', 'Para no tener amigos', 'Para romper juguetes'], ans: 'Para convivir en paz, respeto y seguridad 🤝' },
    { q: '¿Qué debemos hacer cuando un semáforo peatonal está en luz roja?', opts: ['Esperar en la vereda sin cruzar 🛑', 'Cruzar corriendo rápido', 'Cerrar los ojos', 'Saltar en la calle'], ans: 'Esperar en la vereda sin cruzar 🛑' },
    { q: '¿Cuál es una forma de cuidar el medio ambiente en nuestra ciudad?', opts: ['Separar y reciclar la basura ♻️', 'Tirar papeles al suelo', 'Dejar la canilla abierta', 'Gastar plástico'], ans: 'Separar y reciclar la basura ♻️' }
  ],
  geografia_mapas: [
    { q: '¿Qué representan los colores azules en un mapa del mundo?', opts: ['Océanos, mares y ríos 🌊', 'Montañas nevadas 🏔️', 'Bosques verdes 🌲', 'Desiertos de arena 🏜️'], ans: 'Océanos, mares y ríos 🌊' },
    { q: '¿Cómo se llama la línea imaginaria que divide la Tierra en Hemisferio Norte y Sur?', opts: ['La línea del Ecuador 🌐', 'El Trópico de Cáncer', 'El Polo Sur', 'El Meridiano Verde'], ans: 'La línea del Ecuador 🌐' },
    { q: '¿Cuál es el océano más grande del planeta Tierra?', opts: ['Océano Pacífico 🌊', 'Océano Atlántico', 'Océano Índico', 'Océano Ártico'], ans: 'Océano Pacífico 🌊' }
  ]
};

/* ══════════════════════════════════════════════════════════
   GENERADOR DE DESAFÍO DIARIO (DAILY QUEST)
   Pool amplio de preguntas. Cada día selecciona 5 al azar
   usando la fecha como semilla para consistencia del día.
══════════════════════════════════════════════════════════ */
const DAILY_POOL = [
  // ── MATEMÁTICA ──
  { subject: 'math', intro: '🔢 Matemática Diaria:', q: '¿Cuánto es 45 + 55?', opts: ['100', '90', '110', '95'], ans: '100' },
  { subject: 'math', intro: '🔢 Matemática Diaria:', q: '¿Cuánto es 8 × 7?', opts: ['56', '54', '63', '48'], ans: '56' },
  { subject: 'math', intro: '🔢 Matemática Diaria:', q: '¿Cuántos lados tiene un hexágono?', opts: ['6', '5', '8', '4'], ans: '6' },
  { subject: 'math', intro: '🔢 Matemática Diaria:', q: '¿Cuánto es 200 − 75?', opts: ['125', '135', '115', '150'], ans: '125' },
  { subject: 'math', intro: '🔢 Matemática Diaria:', q: '¿Cuánto es 6 × 9?', opts: ['54', '48', '63', '56'], ans: '54' },
  { subject: 'math', intro: '🔢 Matemática Diaria:', q: '¿Cuánto es la mitad de 180?', opts: ['90', '80', '100', '85'], ans: '90' },
  { subject: 'math', intro: '🔢 Matemática Diaria:', q: '¿Qué número le sigue a 999?', opts: ['1000', '1001', '998', '9990'], ans: '1000' },
  { subject: 'math', intro: '🔢 Matemática Diaria:', q: '¿Cuánto es 4 × 4 × 2?', opts: ['32', '16', '64', '24'], ans: '32' },
  { subject: 'math', intro: '🔢 Matemática Diaria:', q: 'Un rectángulo tiene 4 lados. ¿Cuántos ángulos rectos tiene?', opts: ['4', '2', '3', '1'], ans: '4' },
  { subject: 'math', intro: '🔢 Matemática Diaria:', q: '¿Cuánto es 350 + 150?', opts: ['500', '450', '550', '600'], ans: '500' },
  // ── LENGUA ──
  { subject: 'lang', intro: '📜 Lengua Diaria:', q: '¿Cuál es el sustantivo propio en "El valiente Steve viaja a París"?', opts: ['Steve y París', 'valiente', 'viaja', 'Overworld'], ans: 'Steve y París' },
  { subject: 'lang', intro: '📜 Lengua Diaria:', q: '¿Cuál de estas palabras es un adjetivo?', opts: ['Valiente', 'Correr', 'Mesa', 'Rápidamente'], ans: 'Valiente' },
  { subject: 'lang', intro: '📜 Lengua Diaria:', q: '¿Qué signo de puntuación se usa al final de una pregunta?', opts: ['¿?', '!', '.', ','], ans: '¿?' },
  { subject: 'lang', intro: '📜 Lengua Diaria:', q: '¿Cuál es el plural de "ciudad"?', opts: ['Ciudades', 'Ciudads', 'Ciudades', 'Ciuda'], ans: 'Ciudades' },
  { subject: 'lang', intro: '📜 Lengua Diaria:', q: '¿Qué tipo de texto cuenta una historia con personajes inventados?', opts: ['Cuento de ficción', 'Noticia', 'Receta', 'Manual'], ans: 'Cuento de ficción' },
  { subject: 'lang', intro: '📜 Lengua Diaria:', q: '¿Cuál es el diminutivo de "casa"?', opts: ['Casita', 'Casona', 'Casota', 'Casura'], ans: 'Casita' },
  { subject: 'lang', intro: '📜 Lengua Diaria:', q: '¿Cuál de estas palabras es un verbo?', opts: ['Volar', 'Árbol', 'Azul', 'Niño'], ans: 'Volar' },
  { subject: 'lang', intro: '📜 Lengua Diaria:', q: '¿Qué significa la palabra "veloz"?', opts: ['Muy rápido', 'Muy lento', 'Muy alto', 'Muy pesado'], ans: 'Muy rápido' },
  // ── INGLÉS ──
  { subject: 'eng', intro: '🌍 Inglés Diario:', q: 'Choose the correct: "The dolphin ___ in the ocean."', opts: ['lives', 'live', 'living', 'lived'], ans: 'lives' },
  { subject: 'eng', intro: '🌍 Inglés Diario:', q: 'What is the English word for "gato"?', opts: ['Cat', 'Dog', 'Bird', 'Fish'], ans: 'Cat' },
  { subject: 'eng', intro: '🌍 Inglés Diario:', q: 'Choose the correct: "She ___ not eat meat."', opts: ['does', 'do', 'is', 'are'], ans: 'does' },
  { subject: 'eng', intro: '🌍 Inglés Diario:', q: 'What animal lives in the ocean?', opts: ['Dolphin 🐬', 'Eagle 🦅', 'Bear 🐻', 'Horse 🐴'], ans: 'Dolphin 🐬' },
  { subject: 'eng', intro: '🌍 Inglés Diario:', q: 'Translate: "I can swim fast."', opts: ['Puedo nadar rápido', 'No puedo correr', 'Ella vuela rápido', 'Puedo saltar'], ans: 'Puedo nadar rápido' },
  { subject: 'eng', intro: '🌍 Inglés Diario:', q: 'Where does a fish live?', opts: ['In the ocean / river 🌊', 'In the forest 🌲', 'In the desert 🏜️', 'In a cave 🪨'], ans: 'In the ocean / river 🌊' },
  { subject: 'eng', intro: '🌍 Inglés Diario:', q: 'Choose: "Do tigers live in the jungle?"', opts: ['Yes, they do.', 'No, they doesn\'t.', 'Yes, it do.', 'No, they live.'], ans: 'Yes, they do.' },
  { subject: 'eng', intro: '🌍 Inglés Diario:', q: 'What is the opposite of "big"?', opts: ['Small', 'Tall', 'Fast', 'Strong'], ans: 'Small' },
];

function getDailyChallengeData() {
  const todayStr = new Date().toISOString().slice(0, 10);
  // Semilla del día: convertir la fecha en un número para mezcla reproducible
  const seed = todayStr.replace(/-/g, '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  // Fisher-Yates con semilla determinística (mismo resultado para el mismo día)
  const pool = [...DAILY_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = (seed * (i + 1) * 31337) % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  // Tomar al menos 1 de cada materia (math, lang, eng) + rellenar hasta 6 total
  const pick = [];
  ['math', 'lang', 'eng'].forEach(subj => {
    const q = pool.find(x => x.subject === subj && !pick.includes(x));
    if (q) pick.push(q);
  });
  // Completar con más preguntas hasta llegar a 6
  for (const q of pool) {
    if (pick.length >= 6) break;
    if (!pick.includes(q)) pick.push(q);
  }
  return {
    date: todayStr,
    title: '⚡ DESAFÍO DIARIO DEL OVERWORLD',
    questions: pick
  };
}

const FINISH_MSGS = {
  perfect: [
    `¡${'{name}'}, sos una LEYENDA! Rompiste todos los bloques sin fallar. ¡El aldeano está feliz! +{bonus} 💎`,
    `¡PERFECTO, Héroe! Ningún mob pudo con vos. ¡El inventario está lleno de diamantes! +{bonus} 💎`,
    `¡WOW, {name}! La espada brilló con cada respuesta correcta. ¡El Overworld te celebra! +{bonus} 💎`,
  ],
  good: [
    `¡Buen trabajo, {name}! Superaste el desafío del bioma {bioma}. ¡Seguí adelante! +{bonus} 💎`,
    `¡El aldeano está orgulloso de vos, {name}! Obtuviste {correct} de {total} bloques. +{bonus} 💎`,
    `¡Genial, {name}! El portal del Overworld se abrió un poco más. +{bonus} 💎`,
  ],
  retry: [
    `¡Hey {name}! Los mejores héroes intentan de nuevo. ¡Los bloques de hierro son para practicar!`,
    `¡No pasa nada, {name}! Hasta Steve se cayó mil veces antes de llegar al Nether. ¡Inténtalo otra vez!`,
    `¡{name}, el Overworld te necesita fuerte! Volvé a practicar y vencé esos bloques.`,
  ]
};

const NEXT_BTN_TEXTS = [
  '⛏️ ¡Romper el siguiente bloque!',
  '🗡️ ¡Enfrentar el próximo desafío!',
  '🌿 ¡Explorar más del bioma!',
  '💎 ¡A buscar más diamantes!',
  '🧭 ¡Siguiente coordenada!',
];

const MATH_TOPIC_LABELS = {
  read:      '🔢 Leer y escribir',
  valpos:    '🏗️ Valor posicional',
  order:     '🔄 Orden y secuencias',
  mental:    '🧠 Cálculo mental',
  problem:   '📝 Problemas aditivos',
  multintro: '✖️ Intro multiplicación',
  figuras:   '🔺 Figuras geométricas',
  cuerpos:   '📦 Cuerpos geométricos',
  espacio:   '🗺️ Orientación espacial',
  medida:    '📏 Unidades de medida',
  tiempo:    '🕐 El tiempo',
};

const MC_CORRECT = [
  '✅ ¡Bloque roto! +1 diamante al inventario.',
  '✅ ¡Correcto, Héroe! El mob no pudo contigo.',
  '✅ ¡Increíble! Eso va directo al cofre.',
  '✅ ¡Steve estaría orgulloso de vos!',
  '✅ ¡Eso sí es craftear con la cabeza!',
];

const MC_WRONG = [
  '❌ ¡Oops! Los creepers también fallan a veces. Era: ',
  '❌ ¡El bloque resistió! La respuesta era: ',
  '❌ ¡Casi! El aldeano dice que era: ',
  '❌ ¡El mob ganó esta vez! Pero la respuesta era: ',
];

const FIGURA_SVG = {
  'Cuadrado': `<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="140" height="140" fill="#5D9E3A" stroke="#1a1a1a" stroke-width="7" rx="4"/>
    <circle cx="20" cy="20" r="7" fill="#1a1a1a"/>
    <circle cx="160" cy="20" r="7" fill="#1a1a1a"/>
    <circle cx="20" cy="160" r="7" fill="#1a1a1a"/>
    <circle cx="160" cy="160" r="7" fill="#1a1a1a"/>
  </svg>`,

  'Rectángulo': `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="20" width="180" height="100" fill="#2E86AB" stroke="#1a1a1a" stroke-width="7" rx="4"/>
    <circle cx="10" cy="20" r="7" fill="#1a1a1a"/>
    <circle cx="190" cy="20" r="7" fill="#1a1a1a"/>
    <circle cx="10" cy="120" r="7" fill="#1a1a1a"/>
    <circle cx="190" cy="120" r="7" fill="#1a1a1a"/>
  </svg>`,

  'Triángulo': `<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
    <polygon points="90,15 170,165 10,165" fill="#F5C518" stroke="#1a1a1a" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="90" cy="15" r="8" fill="#1a1a1a"/>
    <circle cx="170" cy="165" r="8" fill="#1a1a1a"/>
    <circle cx="10" cy="165" r="8" fill="#1a1a1a"/>
  </svg>`,

  'Círculo': `<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
    <circle cx="90" cy="90" r="78" fill="#c0392b" stroke="#1a1a1a" stroke-width="7"/>
  </svg>`,
};

const CUERPO_SVG = {

  // CUBO: 3 caras visibles con perspectiva isométrica
  'Cubo': `<svg viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg">
    <!-- cara frontal -->
    <polygon points="20,75 120,75 120,175 20,175"
             fill="#5D9E3A" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
    <!-- cara superior -->
    <polygon points="20,75 70,25 170,25 120,75"
             fill="#7ec850" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
    <!-- cara lateral derecha -->
    <polygon points="120,75 170,25 170,125 120,175"
             fill="#3a6e20" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
  </svg>`,

  // PRISMA TRIANGULAR: dos triángulos paralelos unidos por tres rectángulos
  // Vista: cara triangular frontal centrada, cara trasera desplazada, aristas de unión
  'Prisma': `<svg viewBox="0 0 220 190" xmlns="http://www.w3.org/2000/svg">
    <!-- cara rectangular inferior (base) -->
    <polygon points="35,165 75,140 175,140 135,165"
             fill="#4a3eb0" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
    <!-- cara rectangular lateral izquierda -->
    <polygon points="35,60 35,165 75,140 75,35"
             fill="#6c5ce7" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
    <!-- cara triangular trasera (visible arriba a la derecha) -->
    <polygon points="75,35 175,35 175,140 75,140"
             fill="none" stroke="none"/>
    <polygon points="75,35 125,35 175,140 75,140"
             fill="#8e7cf0" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
    <!-- cara triangular delantera -->
    <polygon points="35,60 135,165 35,165"
             fill="#a29bfe" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
    <!-- arista superior (línea de cumbrera) -->
    <line x1="35" y1="60" x2="75" y2="35" stroke="#1a1a1a" stroke-width="3" stroke-dasharray="6,4"/>
    <line x1="75" y1="35" x2="125" y2="35" stroke="#1a1a1a" stroke-width="4"/>
    <line x1="125" y1="35" x2="135" y2="60" stroke="#1a1a1a" stroke-width="4"/>
    <!-- aristas de unión delantera-trasera -->
    <line x1="135" y1="60" x2="135" y2="165" stroke="#1a1a1a" stroke-width="4"/>
  </svg>`,

  // PIRÁMIDE: base cuadrada en perspectiva + 2 caras triangulares visibles
  'Pirámide': `<svg viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg">
    <!-- base en perspectiva (rombo) -->
    <polygon points="100,110 170,145 100,175 30,145"
             fill="#d4a800" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
    <!-- cara izquierda -->
    <polygon points="30,145 100,110 100,30"
             fill="#F5C518" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
    <!-- cara derecha -->
    <polygon points="170,145 100,110 100,30"
             fill="#b8860b" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
    <!-- vértice superior -->
    <circle cx="100" cy="30" r="6" fill="#1a1a1a"/>
  </svg>`,

  // ESFERA: círculo con gradiente y líneas de latitud/longitud
  'Esfera': `<svg viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="esferaGrad" cx="35%" cy="30%" r="65%">
        <stop offset="0%"   stop-color="#ff9ff3"/>
        <stop offset="55%"  stop-color="#c0392b"/>
        <stop offset="100%" stop-color="#7f0000"/>
      </radialGradient>
    </defs>
    <!-- sombra -->
    <ellipse cx="100" cy="175" rx="55" ry="9" fill="rgba(0,0,0,0.15)"/>
    <!-- esfera -->
    <circle cx="100" cy="88" r="80" fill="url(#esferaGrad)" stroke="#1a1a1a" stroke-width="4"/>
    <!-- meridiano vertical -->
    <ellipse cx="100" cy="88" rx="28" ry="80" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    <!-- ecuador horizontal -->
    <ellipse cx="100" cy="88" rx="80" ry="24" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
  </svg>`,

  // CILINDRO: tapa inferior, cuerpo lateral, tapa superior
  'Cilindro': `<svg viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg">
    <!-- cuerpo lateral -->
    <rect x="30" y="55" width="140" height="110" fill="#2E86AB" stroke="none"/>
    <!-- líneas laterales -->
    <line x1="30"  y1="55" x2="30"  y2="165" stroke="#1a1a1a" stroke-width="4"/>
    <line x1="170" y1="55" x2="170" y2="165" stroke="#1a1a1a" stroke-width="4"/>
    <!-- tapa inferior -->
    <ellipse cx="100" cy="165" rx="70" ry="20" fill="#1a6a8a" stroke="#1a1a1a" stroke-width="4"/>
    <!-- tapa superior -->
    <ellipse cx="100" cy="55"  rx="70" ry="20" fill="#5bb8d4" stroke="#1a1a1a" stroke-width="4"/>
    <!-- tapa superior oculta el rect de arriba -->
    <rect x="31" y="56" width="138" height="3" fill="#2E86AB"/>
  </svg>`,
};

const LANG_BOOKS = {
  1: {
    label: '📘 Cuadernillo 1 — En la escuela',
    topics: [
      { id:'b1_vocales',   label:'🔤 Vocales i, u',           icon:'🔤' },
      { id:'b1_digrafos',  label:'✏️ Dígrafos ch/ll/rr/qu',   icon:'✏️' },
      { id:'b1_plural',    label:'📝 Plural -es',              icon:'📝' },
      { id:'b1_diminutivo',label:'💛 Sufijos -ito/-ita',       icon:'💛' },
      { id:'b1_verbosp',   label:'⏱️ Verbos en presente',      icon:'⏱️' },
      { id:'b1_lectura',   label:'📖 Lectura comprensiva',     icon:'📖' },
    ]
  },
  2: {
    label: '📗 Cuadernillo 2 — En la ciudad',
    topics: [
      { id:'b2_grupos',    label:'🔡 Grupos consonánticos',    icon:'🔡' },
      { id:'b2_interroga', label:'❓ Pronombres interrogativos',icon:'❓' },
      { id:'b2_tiempos',   label:'⏳ Tiempos verbales',        icon:'⏳' },
      { id:'b2_diasest',   label:'📅 Días y estaciones',       icon:'📅' },
      { id:'b2_lectura',   label:'📖 Lectura comprensiva',     icon:'📖' },
    ]
  },
  3: {
    label: '📙 Cuadernillo 3 — El bosque olvidado',
    topics: [
      { id:'b3_sufijos',   label:'🏷️ Sufijos -mente/-ción',    icon:'🏷️' },
      { id:'b3_familias',  label:'🌳 Familias de palabras',    icon:'🌳' },
      { id:'b3_compuestas',label:'🔗 Palabras compuestas',     icon:'🔗' },
      { id:'b3_verbpron',  label:'🔄 Verbos pronominales',     icon:'🔄' },
      { id:'b3_lectura',   label:'📖 Lectura comprensiva',     icon:'📖' },
    ]
  }
};

const BOOK_COLORS = {
  1: ['#fd79a8','#e84393'],
  2: ['#74b9ff','#0984e3'],
  3: ['#55efc4','#00b894']
};

const ENG_TOPIC_LABELS = {
  places:'🏙️ Places in Town', prepositions:'📍 Preposiciones',
  isthere:'❓ Is there / Are there', sentences:'💬 Armar oraciones'
};

const MC_CORRECT_ENG = [
  '✅ ¡Explorador! El mapa del mundo tiene un nuevo marcador.',
  '✅ ¡Correcto! El aldeano extranjero te entendió perfecto.',
  '✅ ¡Genial! Ese bioma ahora está en tu inventario.',
  '✅ ¡Bloque de idioma desbloqueado! ¡Sos increíble!',
];

const MC_WRONG_ENG = [
  '❌ ¡Oops! El mapa decía otra cosa. Era: ',
  '❌ ¡El aldeano no te entendió! La respuesta era: ',
  '❌ ¡Ese bloque no era el correcto! Era: ',
];

const USER_AVATARS = ['🧒','👧','👦','🧑','🦊','🐸','🐼','🦁','🐯','🐧','🦄','🐲'];

const PARCIAL_TOPIC_LABELS = {
  p_comprension:     '📖 Lectura y comprensión',
  p_escritura:       '✏️ Escritura de oraciones',
  p_sustantivos:     '🔤 Sustantivos',
  p_adjetivos:       '🎨 Adjetivos',
  p_numread:         '🔢 Leer y escribir números',
  p_orden:           '🔄 Orden y secuencias',
  p_mental:          '🧠 Cálculo mental',
  p_problema:        '📝 Problemas aditivos',
  p_eng_vocab:       '🐾 Animals & Habitats',
  p_eng_grammar:     '📝 Present Simple +/−',
  p_eng_doquestions: '❓ Do / Does Questions',
  p_eng_where:       '🗺️ Where + Can/Can\'t',
  p_eng_reading:     '📖 Reading Comprehension',
  p_eng_match:       '🐾 Match the Animal!',
  p_eng_spell:       '🔤 Spell the Animal!',
  p_eng_spellsent:   '🔡 Spell the Words!',
  p_eng_pickanimal:  '🖼️ Pick the Animal!',
  p_eng_habitats:    '🏞️ Match the Habitats!',
  p_eng_dodoes_photo:'❓ Do they / Does it? (Yes/No)',
  p_eng_types:       '🦎 Animal Types',
  p_eng_truefalse:   '✅ True or False',
  p_eng_writesent:   '✏️ Complete the Sentence',
  p_eng_describe:    '🔍 Describe the Animal',
  p_eng_bodyparts:   '🦴 Match Body Parts!',
};

const P_TEXTOS = [
  { texto: 'Ana tiene una gata que se llama Luna. Luna duerme todo el día y juega de noche.',
    preguntas: [
      { q:'¿Cómo se llama la gata?',          ans:'Luna',       opts:['Luna','Ana','Mia','Noche'] },
      { q:'¿Cuándo juega la gata?',            ans:'de noche',   opts:['de noche','de día','a la tarde','al mediodía'] },
      { q:'¿Qué hace Luna todo el día?',       ans:'duerme',     opts:['duerme','juega','come','corre'] },
    ]
  },
  { texto: 'El sol sale por la mañana y se esconde por la tarde. Las flores abren sus pétalos cuando hay luz.',
    preguntas: [
      { q:'¿Cuándo sale el sol?',              ans:'por la mañana',    opts:['por la mañana','por la noche','al mediodía','a la tarde'] },
      { q:'¿Qué hacen las flores cuando hay luz?', ans:'abren sus pétalos', opts:['abren sus pétalos','duermen','corren','llueven'] },
      { q:'¿Cuándo se esconde el sol?',        ans:'por la tarde',    opts:['por la tarde','por la noche','al amanecer','a la mañana'] },
    ]
  },
  { texto: 'Tomás fue al mercado con su mamá. Compraron manzanas, pan y leche. Tomás cargó la bolsa.',
    preguntas: [
      { q:'¿Con quién fue Tomás al mercado?',  ans:'con su mamá',    opts:['con su mamá','con su papá','con su hermano','solo'] },
      { q:'¿Qué compró la mamá de Tomás?',     ans:'manzanas, pan y leche', opts:['manzanas, pan y leche','juguetes y ropa','fruta y dulces','libros y lapices'] },
      { q:'¿Qué hizo Tomás con la bolsa?',     ans:'la cargó',       opts:['la cargó','la tiró','la perdió','la regaló'] },
    ]
  },
  { texto: 'El perro de la escuela se llama Manchas. Es blanco con puntos negros. A todos los chicos les gusta acariciarlo.',
    preguntas: [
      { q:'¿Cómo es el perro de la escuela?', ans:'blanco con puntos negros', opts:['blanco con puntos negros','negro con manchas blancas','marrón y grande','todo blanco'] },
      { q:'¿Cómo se llama el perro?',         ans:'Manchas',        opts:['Manchas','Lunares','Toby','Rex'] },
      { q:'¿Qué hacen los chicos con el perro?', ans:'lo acarician', opts:['lo acarician','le dan de comer','lo bañan','lo pasean'] },
    ]
  },
];

const P_ESCRITURA_Q = [
  { intro:'✏️ ¿Cuál de estas oraciones está escrita CORRECTAMENTE?',
    ans:'El niño come pan.',
    opts:['El niño come pan.','el niño Come pan.','El niño come Pan','el Niño come pan'] },
  { intro:'✏️ ¿Cuál oración empieza con MAYÚSCULA y termina con PUNTO?',
    ans:'La mariposa vuela alto.',
    opts:['La mariposa vuela alto.','la mariposa Vuela alto','La mariposa vuela alto','la mariposa vuela alto.'] },
  { intro:'✏️ Completá la oración: "El gato ___ en el sillón."',
    ans:'duerme',
    opts:['duerme','dormir','durmió','dormirá'] },
  { intro:'✏️ ¿Qué palabra completa la oración? "María ___ a la escuela todos los días."',
    ans:'va',
    opts:['va','fue','irá','voy'] },
  { intro:'✏️ ¿Cuál es la oración completa (sujeto + predicado)?',
    ans:'Los pájaros cantan en el árbol.',
    opts:['Los pájaros cantan en el árbol.','Cantan en el árbol.','Los pájaros.','En el árbol.'] },
  { intro:'✏️ ¿Cuál oración describe una acción?',
    ans:'El perro corre por el parque.',
    opts:['El perro corre por el parque.','El perro.','Un parque grande.','Corre.'] },
  { intro:'✏️ Elegí la palabra que falta: "El cielo es de color ___."',
    ans:'azul',
    opts:['azul','correr','rápido','cantar'] },
  { intro:'✏️ ¿Cuál de estas palabras es una ACCIÓN (verbo)?',
    ans:'saltar',
    opts:['saltar','mesa','bonito','escuela'] },
];

const P_SUST_Q = [
  { intro:'🔤 ¿Cuál es un SUSTANTIVO PROPIO?',
    ans:'Buenos Aires',
    opts:['Buenos Aires','ciudad','perro','árbol'] },
  { intro:'🔤 ¿Cuál es un SUSTANTIVO COMÚN?',
    ans:'libro',
    opts:['libro','Lucía','Argentina','Río de la Plata'] },
  { intro:'🔤 "El perro de Ramón vive en Córdoba." — ¿Cuál es el sustantivo PROPIO?',
    ans:'Ramón',
    opts:['Ramón','perro','vive','Córdoba'] },
  { intro:'🔤 ¿Cuántos sustantivos PROPIOS hay? "Ana y su gato Michi pasean en Buenos Aires."',
    ans:'3 (Ana, Michi, Buenos Aires)',
    opts:['3 (Ana, Michi, Buenos Aires)','1 (Ana)','2 (Ana, Buenos Aires)','4'] },
  { intro:'🔤 Indicá el tipo de sustantivo subrayado: "La <u>maestra</u> enseña en el aula."',
    ans:'Sustantivo común',
    opts:['Sustantivo común','Sustantivo propio','Adjetivo','Verbo'] },
  { intro:'🔤 ¿Cuál de estas palabras es un SUSTANTIVO (cosa, persona o lugar)?',
    ans:'escuela',
    opts:['escuela','bonita','correr','muy'] },
  { intro:'🔤 ¿Cuál es un SUSTANTIVO PROPIO?',
    ans:'Martín',
    opts:['Martín','niño','ciudad','animal'] },
  { intro:'🔤 En "El río Paraná es muy largo", ¿cuál es el sustantivo propio?',
    ans:'Paraná',
    opts:['Paraná','río','largo','muy'] },
];

const P_ADJ_Q = [
  { intro:'🎨 ¿Cuál de estas palabras es un ADJETIVO (cómo es)?',
    ans:'rojo',
    opts:['rojo','perro','correr','escuela'] },
  { intro:'🎨 ¿Qué adjetivo describe la pelota? "La pelota ___ rueda por la cancha."',
    ans:'grande',
    opts:['grande','pelota','rueda','cancha'] },
  { intro:'🎨 En "El gato negro duerme en la silla cómoda", ¿cuántos adjetivos hay?',
    ans:'2 (negro, cómoda)',
    opts:['2 (negro, cómoda)','1 (negro)','3','ninguno'] },
  { intro:'🎨 ¿Cuál palabra describe cómo ES el sol?',
    ans:'brillante',
    opts:['brillante','salir','mañana','cielo'] },
  { intro:'🎨 Completá: "La flor ___ huele muy bien." (adjetivo de color)',
    ans:'amarilla',
    opts:['amarilla','corre','libro','escuela'] },
  { intro:'🎨 ¿Qué función cumple "alto" en "El edificio alto tiene muchos pisos"?',
    ans:'Adjetivo (describe al edificio)',
    opts:['Adjetivo (describe al edificio)','Sustantivo','Verbo','Artículo'] },
  { intro:'🎨 ¿Cuál adjetivo puede acompañar a "día"? "___ día soleado"',
    ans:'lindo',
    opts:['lindo','correr','mesa','siempre'] },
  { intro:'🎨 En "Ana tiene una mochila azul y pesada", ¿cuáles son los adjetivos?',
    ans:'azul y pesada',
    opts:['azul y pesada','mochila y Ana','tiene y azul','Ana y pesada'] },
];

const P_ORDEN_Q = [
  // anterior / posterior
  ()=>{
    const n = rand(11,998);
    const tipo = rand(0,1);
    const ans = tipo===0 ? String(n-1) : String(n+1);
    const label = tipo===0 ? 'ANTERIOR' : 'POSTERIOR';
    const d = [n-2,n+2,n+3].filter(x=>x>0).map(String);
    return { intro:`🔄 ¿Cuál es el número ${label} de ${n}?`, ans, opts:shuffle([ans,...d]).slice(0,4) };
  },
  // completar secuencia de 2 en 2
  ()=>{
    const ini = rand(2,40)*2;
    const seq = [ini, ini+2, ini+4, '?', ini+8];
    const ans = String(ini+6);
    const d = [ini+5,ini+7,ini+10].map(String);
    return { intro:`🔄 Completá la secuencia: ${seq.join(' — ')}`, ans, opts:shuffle([ans,...d]) };
  },
  // completar secuencia de 5 en 5
  ()=>{
    const ini = rand(1,18)*5;
    const seq = [ini, ini+5, ini+10, '?', ini+20];
    const ans = String(ini+15);
    const d = [ini+13,ini+16,ini+20].map(String);
    return { intro:`🔄 Completá la secuencia: ${seq.join(' — ')}`, ans, opts:shuffle([ans,...d]) };
  },
  // completar secuencia de 10 en 10
  ()=>{
    const ini = rand(1,9)*10;
    const seq = [ini, ini+10, '?', ini+30, ini+40];
    const ans = String(ini+20);
    const d = [ini+15,ini+25,ini+35].map(String);
    return { intro:`🔄 Completá la secuencia: ${seq.join(' — ')}`, ans, opts:shuffle([ans,...d]) };
  },
  // ordenar de menor a mayor
  ()=>{
    const base = rand(10,90);
    const nums = shuffle([base, base+15, base+7, base+22]);
    const ans = [...nums].sort((a,b)=>a-b).join(' — ');
    const d = [
      [...nums].sort((a,b)=>b-a).join(' — '),
      [nums[1],nums[0],nums[2],nums[3]].join(' — '),
      [nums[2],nums[3],nums[0],nums[1]].join(' — '),
    ];
    return { intro:`🔄 Ordená de MENOR a MAYOR: ${nums.join(' — ')}`, ans, opts:shuffle([ans,...d]) };
  },
  // ordenar de mayor a menor
  ()=>{
    const base = rand(10,90);
    const nums = shuffle([base, base+12, base+5, base+19]);
    const ans = [...nums].sort((a,b)=>b-a).join(' — ');
    const d = [
      [...nums].sort((a,b)=>a-b).join(' — '),
      [nums[1],nums[0],nums[2],nums[3]].join(' — '),
      [nums[0],nums[2],nums[3],nums[1]].join(' — '),
    ];
    return { intro:`🔄 Ordená de MAYOR a MENOR: ${nums.join(' — ')}`, ans, opts:shuffle([ans,...d]) };
  },
  // escala de 3 en 3
  ()=>{
    const ini = rand(1,30)*3;
    const seq = [ini, ini+3, ini+6, '?', ini+12];
    const ans = String(ini+9);
    const d = [ini+7,ini+10,ini+13].map(String);
    return { intro:`🔄 Completá la secuencia: ${seq.join(' — ')}`, ans, opts:shuffle([ans,...d]) };
  },
  // ¿qué número va entre?
  ()=>{
    const n = rand(20,97);
    const ans = String(n);
    const d = [n-2, n+2, n-1].map(String);
    return { intro:`🔄 ¿Qué número va ENTRE ${n-1} y ${n+1}?`, ans, opts:shuffle([ans,...d]) };
  },
];

const P_PROBLEMA_GEN = [
  ()=>{
    const a=rand(10,60), b=rand(5,30);
    const t=a+b;
    return { prob:`Sofía tenía ${a} figuritas. Su amiga le regaló ${b} más. ¿Cuántas figuritas tiene ahora?`, ans:String(t), opts:[t,t-1,t+1,t+b].map(String) };
  },
  ()=>{
    const t=rand(30,80), b=rand(5,25);
    const a=t-b;
    return { prob:`Había ${t} manzanas en la canasta. Se usaron ${b} para hacer jugo. ¿Cuántas manzanas quedan?`, ans:String(a), opts:[a,a+1,a-1,a+5].map(String) };
  },
  ()=>{
    const a=rand(15,50), b=rand(10,40);
    const t=a+b;
    return { prob:`En el recreo hay ${a} nenes y ${b} nenas jugando. ¿Cuántos chicos hay en total?`, ans:String(t), opts:[t,t-1,t+1,t+10].map(String) };
  },
  ()=>{
    const total=rand(40,90), a=rand(10,30);
    const b=total-a;
    return { prob:`Hay ${total} soldados en el cuartel. ${a} salieron de misión. ¿Cuántos quedaron en la base?`, ans:String(b), opts:[b,b+1,b-1,b+5].map(String) };
  },
  ()=>{
    const pc=rand(20,60), pm=rand(10,30);
    const t=pc+pm;
    return { prob:`En la caja hay ${pc} caramelos de chocolate y ${pm} de menta. ¿Cuántos caramelos hay en total?`, ans:String(t), opts:[t,t-1,t+1,t+pm].map(String) };
  },
  ()=>{
    const t=rand(50,100), v=rand(10,40);
    const q=t-v;
    return { prob:`Había ${t} bloques en el inventario. Se usaron ${v} para construir una casa. ¿Cuántos bloques quedan?`, ans:String(q), opts:[q,q+1,q-1,q-v].map(String) };
  },
  ()=>{
    const a=rand(10,40), b=rand(10,40);
    const t=a+b;
    return { prob:`Un granjero cosechó ${a} zanahorias el lunes y ${b} el martes. ¿Cuántas cosechó en los dos días?`, ans:String(t), opts:[t,t-1,t+1,t+5].map(String) };
  },
  ()=>{
    const total=rand(30,70), roto=rand(5,20);
    const ok=total-roto;
    return { prob:`En la caja había ${total} huevos. Se rompieron ${roto}. ¿Cuántos huevos están enteros?`, ans:String(ok), opts:[ok,ok+1,ok-1,ok+roto].map(String) };
  },
];

const P_ENG_VOCAB_Q = [
  { intro:'🐾 Choose the correct translation:',
    q:'What does <b>"rainforest"</b> mean?', ans:'selva tropical',
    opts:['selva tropical','desierto','cueva','océano'] },
  { intro:'🐾 Choose the correct translation:',
    q:'What does <b>"cave"</b> mean?', ans:'cueva',
    opts:['cueva','selva','tierra','agua'] },
  { intro:'🐾 Choose the correct translation:',
    q:'What does <b>"hunt"</b> mean?', ans:'cazar',
    opts:['cazar','nadar','volar','comer'] },
  { intro:'🐾 Choose the correct translation:',
    q:'What does <b>"wings"</b> mean?', ans:'alas',
    opts:['alas','patas','cola','pelaje'] },
  { intro:'🐾 Choose the correct habitat:',
    q:'A shark lives in…', ans:'water',
    opts:['water','a cave','the desert','land'] },
  { intro:'🐾 Choose the correct habitat:',
    q:'A camel lives in the…', ans:'desert',
    opts:['desert','rainforest','water','cave'] },
  { intro:'🐾 Choose the correct habitat:',
    q:'A bat lives in a…', ans:'cave',
    opts:['cave','desert','river','rainforest'] },
  { intro:'🐾 Choose the correct word:',
    q:'A crocodile can live on land and in water. It is a…', ans:'reptile',
    opts:['reptile','mammal','bird','insect'] },
  { intro:'🐾 Choose the correct translation:',
    q:'What does <b>"fur"</b> mean?', ans:'pelaje',
    opts:['pelaje','alas','patas','cola'] },
  { intro:'🐾 Choose the correct translation:',
    q:'What does <b>"dangerous"</b> mean?', ans:'peligroso',
    opts:['peligroso','amigable','pequeño','grande'] },
  { intro:'🐾 Choose the correct word:',
    q:'Birds have <b>___</b> to fly.', ans:'wings',
    opts:['wings','legs','tail','fur'] },
  { intro:'🐾 Choose the correct habitat:',
    q:'A monkey lives in the…', ans:'rainforest',
    opts:['rainforest','desert','cave','ocean'] },
];

const P_ENG_GRAMMAR_Q = [
  { intro:'📝 Complete the sentence (affirmative):',
    q:'A lion ___ on land. (live)', ans:'lives',
    opts:['lives','live','does not live','living'] },
  { intro:'📝 Complete the sentence (affirmative):',
    q:'Frogs ___ in rivers. (live)', ans:'live',
    opts:['live','lives','is living','lived'] },
  { intro:'📝 Complete the sentence (negative):',
    q:'A fish ___ on land. (live)', ans:"doesn't live",
    opts:["doesn't live","don't live",'lives','living'] },
  { intro:'📝 Complete the sentence (negative):',
    q:'Crocodiles ___ in the desert. (live)', ans:"don't live",
    opts:["don't live","doesn't live",'lives','live'] },
  { intro:'📝 Which sentence is CORRECT?',
    q:'Choose the correct sentence about a penguin:', ans:'It swims in the water.',
    opts:['It swims in the water.','It swim in the water.','It swimming.','It does swim.'] },
  { intro:'📝 Complete the sentence (negative):',
    q:'An eagle ___ in the water. (hunt)', ans:"doesn't hunt",
    opts:["doesn't hunt","don't hunt",'hunts','hunt'] },
  { intro:'📝 Which sentence is CORRECT?',
    q:'Choose the correct affirmative sentence:', ans:'She eats leaves.',
    opts:['She eats leaves.','She eat leaves.','She eating leaves.','She do eat leaves.'] },
  { intro:'📝 Complete the sentence:',
    q:'They ___ meat. They eat plants. (eat — negative)', ans:"don't eat",
    opts:["don't eat","doesn't eat",'eats',"don't eats"] },
  { intro:'📝 Choose the correct form:',
    q:'A snake ___ in a cave. (sleep)', ans:'sleeps',
    opts:['sleeps','sleep','sleeping','slept'] },
  { intro:'📝 Choose the correct negative:',
    q:'Elephants ___ in caves. (live)', ans:"don't live",
    opts:["don't live","doesn't live",'lives','live'] },
];

const P_ENG_DOQUES_Q = [
  { intro:'❓ Choose the correct question:',
    q:'How do you ask if koalas eat leaves?', ans:'Do koalas eat leaves?',
    opts:['Do koalas eat leaves?','Does koalas eat leaves?','Do koala eats leaves?','Are koalas eat leaves?'] },
  { intro:'❓ Choose the correct question:',
    q:'How do you ask if a shark lives in water?', ans:'Does a shark live in water?',
    opts:['Does a shark live in water?','Do a shark live in water?','Does a shark lives in water?','Is a shark live in water?'] },
  { intro:'❓ Choose the correct short answer:',
    q:'Do penguins swim? (YES)', ans:'Yes, they do.',
    opts:['Yes, they do.','Yes, they does.','Yes, it do.','Yes, it does.'] },
  { intro:'❓ Choose the correct short answer:',
    q:'Does a camel live in the rainforest? (NO)', ans:"No, it doesn't.",
    opts:["No, it doesn't.","No, it don't.",'No, they do.',"No, it isn't."] },
  { intro:'❓ Choose the correct short answer:',
    q:'Do lions eat meat? (YES)', ans:'Yes, they do.',
    opts:['Yes, they do.','Yes, they does.','Yes, it does.','Yes, it do.'] },
  { intro:'❓ Choose the correct question:',
    q:'How do you ask if a bat hunts at night?', ans:'Does a bat hunt at night?',
    opts:['Does a bat hunt at night?','Do a bat hunt at night?','Does a bat hunts at night?','Is a bat hunt at night?'] },
  { intro:'❓ Choose the correct short answer:',
    q:'Does an eagle live in water? (NO)', ans:"No, it doesn't.",
    opts:["No, it doesn't.","No, it don't.",'No, they do.',"No, it don't."] },
  { intro:'❓ Choose the correct auxiliary for "They":',
    q:'"___ crocodiles live on land and in water?"', ans:'Do',
    opts:['Do','Does','Are','Is'] },
  { intro:'❓ Choose the correct auxiliary for "It":',
    q:'"___ a frog jump?"', ans:'Does',
    opts:['Does','Do','Is','Are'] },
  { intro:'❓ Choose the correct short answer:',
    q:'Do fish walk? (NO)', ans:"No, they don't.",
    opts:["No, they don't.","No, they doesn't.","No, it don't.","No, it doesn't."] },
];

const P_ENG_WHERE_Q = [
  { intro:'🗺️ Complete the question:',
    q:'"___ a crocodile live?"', ans:'Where does',
    opts:['Where does','Where do','What does','What do'] },
  { intro:'🗺️ Complete the question:',
    q:'"___ penguins live?"', ans:'Where do',
    opts:['Where do','Where does','What do','What does'] },
  { intro:'🗺️ Choose the correct answer:',
    q:'Where does a camel live?', ans:'It lives in the desert.',
    opts:['It lives in the desert.','They live in the desert.','It live in the desert.','It lives desert.'] },
  { intro:'🗺️ Choose the correct answer:',
    q:'Where do dolphins live?', ans:'They live in the water.',
    opts:['They live in the water.','It lives in the water.','They lives in the water.','They in the water.'] },
  { intro:'🐦 Can or Can\'t?',
    q:'A bird ___ fly because it has wings.', ans:'can',
    opts:['can',"can't","doesn't",'not'] },
  { intro:'🐸 Can or Can\'t?',
    q:'A frog ___ fly. It has no wings.', ans:"can't",
    opts:["can't",'can','does','not'] },
  { intro:'🐟 Choose the correct sentence:',
    q:'A fish — swim ✓ / walk ✗', ans:"A fish can swim but it can't walk.",
    opts:["A fish can swim but it can't walk.","A fish can't swim but it can walk.",'A fish can swim and walk.',"A fish can't swim or walk."] },
  { intro:'🗺️ Choose the correct answer:',
    q:'Where does a monkey live?', ans:'It lives in the rainforest.',
    opts:['It lives in the rainforest.','They live in the rainforest.','It live in the rainforest.','It lives rainforest.'] },
  { intro:'🐦 Choose the correct sentence:',
    q:'Eagles — fly ✓ / swim ✗', ans:"Eagles can fly but they can't swim.",
    opts:["Eagles can fly but they can't swim.","Eagles can't fly but they can swim.",'Eagles can fly and swim.',"Eagles don't fly."] },
  { intro:'🗺️ Complete with Where do or Where does:',
    q:'"___ sharks live?" — They live in the ocean.', ans:'Where do',
    opts:['Where do','Where does','What do','What does'] },
];

const P_ENG_READING_TEXTS = [
  {
    title: '🐊 The Crocodile',
    text: 'The crocodile is a reptile. It lives on land and in the water. It has four legs and a long tail. It hunts fish and other animals. It does not live in the desert.',
    qs: [
      { q:'Where does a crocodile live?', ans:'on land and in the water',
        opts:['on land and in the water','only in the water','in the desert','in a cave'] },
      { q:'What type of animal is a crocodile?', ans:'a reptile',
        opts:['a reptile','a mammal','a bird','an insect'] },
      { q:'Does a crocodile live in the desert?', ans:"No, it doesn't.",
        opts:["No, it doesn't.",'Yes, it does.',"No, they don't.",'Yes, it do.'] },
    ]
  },
  {
    title: '🐨 The Koala',
    text: 'The koala is a mammal. It lives in Australia. Koalas eat leaves. They do not eat meat. They sleep a lot during the day. They are friendly animals.',
    qs: [
      { q:'What do koalas eat?', ans:'leaves',
        opts:['leaves','meat','fish','insects'] },
      { q:'What type of animal is a koala?', ans:'a mammal',
        opts:['a mammal','a reptile','a bird','an insect'] },
      { q:'Do koalas eat meat?', ans:"No, they don't.",
        opts:["No, they don't.",'Yes, they do.',"No, it doesn't.",'Yes, it does.'] },
    ]
  },
  {
    title: '🦅 The Eagle',
    text: 'The eagle is a bird. It has big wings and it can fly very high. It lives in the mountains and forests. It hunts small animals. Eagles do not swim.',
    qs: [
      { q:'Can an eagle fly?', ans:'Yes, it can.',
        opts:['Yes, it can.',"No, it can't.",'Yes, they can.',"No, they can't."] },
      { q:'Where does an eagle live?', ans:'in the mountains and forests',
        opts:['in the mountains and forests','in the water','in the desert','in a cave'] },
      { q:'Do eagles swim?', ans:"No, they don't.",
        opts:["No, they don't.",'Yes, they do.',"No, it doesn't.",'Yes, it does.'] },
    ]
  },
  {
    title: '🐸 The Frog',
    text: 'The frog is an amphibian. It can jump and swim. It lives near rivers and ponds. It eats insects. Frogs cannot fly because they do not have wings.',
    qs: [
      { q:'What can a frog do?', ans:'jump and swim',
        opts:['jump and swim','fly and swim','fly and jump','hunt and fly'] },
      { q:'Why cannot frogs fly?', ans:'because they do not have wings',
        opts:['because they do not have wings','because they live in water','because they are small','because they eat insects'] },
      { q:'Where does a frog live?', ans:'near rivers and ponds',
        opts:['near rivers and ponds','in the desert','in caves','in the rainforest'] },
    ]
  },
];

const ANIMALS = [
  { name:'lion',      emoji:'🦁', hint:'lives in the savanna 🌾',          type:'mammal' },
  { name:'zebra',     emoji:'🦓', hint:'lives on the grassland 🌿',         type:'mammal' },
  { name:'giraffe',   emoji:'🦒', hint:'the tallest animal on land 🌳',     type:'mammal' },
  { name:'crocodile', emoji:'🐊', hint:'lives on land and in water 💧',     type:'reptile' },
  { name:'monkey',    emoji:'🐒', hint:'lives in the rainforest 🌴',        type:'mammal' },
  { name:'shark',     emoji:'🦈', hint:'lives in the ocean 🌊',             type:'fish' },
  { name:'whale',     emoji:'🐋', hint:'the biggest animal in the water 🌊', type:'mammal' },
  { name:'hippo',     emoji:'🦛', hint:'lives in rivers and lakes 💦',      type:'mammal' },
  { name:'penguin',   emoji:'🐧', hint:'lives in cold land and water 🧊',   type:'bird' },
  { name:'elephant',  emoji:'🐘', hint:'the biggest animal on land 🌍',     type:'mammal' },
];

const SPELL_SENT_DATA = [
  { animal: { emoji:'🦓', name:'zebra'    }, words: ['eat',   'grass']   },
  { animal: { emoji:'🦁', name:'lion'     }, words: ['sleep', 'in', 'a', 'tree']  },
  { animal: { emoji:'🐒', name:'monkey'   }, words: ['like',  'fruit']   },
  { animal: { emoji:'🐘', name:'elephant' }, words: ['drink', 'water']   },
  { animal: { emoji:'🦈', name:'shark'    }, words: ['hunt',  'animals'] },
  { animal: { emoji:'🦒', name:'giraffe'  }, words: ['live',  'in', 'a', 'group'] },
  { animal: { emoji:'🐊', name:'crocodile'}, words: ['live',  'on', 'land']       },
  { animal: { emoji:'🐋', name:'whale'    }, words: ['swim',  'in', 'the', 'sea'] },
  { animal: { emoji:'🦛', name:'hippo'    }, words: ['walk',  'in', 'water']      },
  { animal: { emoji:'🐧', name:'penguin'  }, words: ['jump',  'and', 'swim']      },
];

const PICK_COLORS = [
  '#3b82f6', '#ef4444', '#f97316', '#22c55e',
  '#a855f7', '#06b6d4', '#e11d48', '#84cc16',
];

const P_ENG_PICK_Q = [
  // Hábitat
  { sentence: 'It lives in the rainforest.',   correct: { emoji:'🐒', name:'Monkey'  }, wrong: [{ emoji:'🐄', name:'Cow'     },{ emoji:'🐧', name:'Penguin' },{ emoji:'🦈', name:'Shark'   }] },
  { sentence: 'It lives in the ocean.',        correct: { emoji:'🐳', name:'Whale'   }, wrong: [{ emoji:'🦁', name:'Lion'    },{ emoji:'🐘', name:'Elephant'},{ emoji:'🐕', name:'Dog'     }] },
  { sentence: 'It lives in the savannah.',     correct: { emoji:'🦒', name:'Giraffe' }, wrong: [{ emoji:'🐟', name:'Fish'    },{ emoji:'🐇', name:'Rabbit' },{ emoji:'🦅', name:'Eagle'   }] },
  { sentence: 'It lives in the jungle.',       correct: { emoji:'🐆', name:'Leopard' }, wrong: [{ emoji:'🐄', name:'Cow'     },{ emoji:'🐑', name:'Sheep'  },{ emoji:'🐧', name:'Penguin' }] },
  { sentence: 'It lives in cold weather.',     correct: { emoji:'🐧', name:'Penguin' }, wrong: [{ emoji:'🦁', name:'Lion'    },{ emoji:'🐒', name:'Monkey' },{ emoji:'🐊', name:'Crocodile'}] },
  { sentence: 'It lives in water and on land.',correct: { emoji:'🐊', name:'Crocodile'},wrong: [{ emoji:'🦁', name:'Lion'    },{ emoji:'🐕', name:'Dog'    },{ emoji:'🐦', name:'Bird'    }] },
  { sentence: 'It lives on a farm.',           correct: { emoji:'🐄', name:'Cow'     }, wrong: [{ emoji:'🦁', name:'Lion'    },{ emoji:'🐳', name:'Whale'  },{ emoji:'🐆', name:'Leopard' }] },
  // Comportamiento / comida
  { sentence: 'It eats grass.',                correct: { emoji:'🐴', name:'Horse'   }, wrong: [{ emoji:'🦈', name:'Shark'   },{ emoji:'🐧', name:'Penguin'},{ emoji:'🐊', name:'Crocodile'}] },
  { sentence: 'It eats leaves from trees.',    correct: { emoji:'🦒', name:'Giraffe' }, wrong: [{ emoji:'🐧', name:'Penguin' },{ emoji:'🦈', name:'Shark'  },{ emoji:'🐕', name:'Dog'     }] },
  { sentence: 'It eats fish.',                 correct: { emoji:'🐻', name:'Bear'    }, wrong: [{ emoji:'🐄', name:'Cow'     },{ emoji:'🐴', name:'Horse'  },{ emoji:'🐑', name:'Sheep'   }] },
  { sentence: 'It likes fruit.',               correct: { emoji:'🐒', name:'Monkey'  }, wrong: [{ emoji:'🐧', name:'Penguin' },{ emoji:'🦈', name:'Shark'  },{ emoji:'🐊', name:'Crocodile'}] },
  { sentence: 'It hunts animals.',             correct: { emoji:'🦁', name:'Lion'    }, wrong: [{ emoji:'🐕', name:'Dog'     },{ emoji:'🐄', name:'Cow'    },{ emoji:'🐇', name:'Rabbit'  }] },
  // Acciones / características
  { sentence: 'It sleeps in a tree.',          correct: { emoji:'🐨', name:'Koala'   }, wrong: [{ emoji:'🦛', name:'Hippo'   },{ emoji:'🐄', name:'Cow'    },{ emoji:'🐧', name:'Penguin' }] },
  { sentence: 'It can swim very fast.',        correct: { emoji:'🐬', name:'Dolphin' }, wrong: [{ emoji:'🐘', name:'Elephant'},{ emoji:'🦒', name:'Giraffe'},{ emoji:'🐄', name:'Cow'     }] },
  { sentence: 'It has a very long neck.',      correct: { emoji:'🦒', name:'Giraffe' }, wrong: [{ emoji:'🐊', name:'Crocodile'},{ emoji:'🐕', name:'Dog'   },{ emoji:'🐸', name:'Frog'    }] },
  { sentence: 'It lives in a group.',          correct: { emoji:'🐘', name:'Elephant'}, wrong: [{ emoji:'🐈', name:'Cat'     },{ emoji:'🐊', name:'Crocodile'},{ emoji:'🦈', name:'Shark' }] },
  { sentence: 'It can fly.',                   correct: { emoji:'🦅', name:'Eagle'   }, wrong: [{ emoji:'🐊', name:'Crocodile'},{ emoji:'🐄', name:'Cow'   },{ emoji:'🦁', name:'Lion'    }] },
  { sentence: 'It has spots on its body.',     correct: { emoji:'🐆', name:'Leopard' }, wrong: [{ emoji:'🐧', name:'Penguin' },{ emoji:'🐴', name:'Horse'  },{ emoji:'🐳', name:'Whale'   }] },
  { sentence: "It doesn't have legs.",         correct: { emoji:'🐍', name:'Snake'   }, wrong: [{ emoji:'🐕', name:'Dog'     },{ emoji:'🐄', name:'Cow'    },{ emoji:'🐇', name:'Rabbit'  }] },
  { sentence: 'It carries its home.',          correct: { emoji:'🐢', name:'Turtle'  }, wrong: [{ emoji:'🦁', name:'Lion'    },{ emoji:'🐟', name:'Fish'   },{ emoji:'🐒', name:'Monkey'  }] },
  { sentence: 'It can run very fast.',         correct: { emoji:'🐎', name:'Horse'   }, wrong: [{ emoji:'🐢', name:'Turtle'  },{ emoji:'🐟', name:'Fish'   },{ emoji:'🐍', name:'Snake'   }] },
  // Hábitat + acción
  { sentence: 'It lives in the sea and has fins.',correct: { emoji:'🦈', name:'Shark'},  wrong: [{ emoji:'🦒', name:'Giraffe' },{ emoji:'🐕', name:'Dog'    },{ emoji:'🐸', name:'Frog'    }] },
  { sentence: 'It jumps very high.',           correct: { emoji:'🦘', name:'Kangaroo'},wrong: [{ emoji:'🐄', name:'Cow'     },{ emoji:'🐍', name:'Snake'  },{ emoji:'🦈', name:'Shark'   }] },
  { sentence: 'It lives in Australia.',        correct: { emoji:'🦘', name:'Kangaroo'},wrong: [{ emoji:'🦁', name:'Lion'    },{ emoji:'🐧', name:'Penguin'},{ emoji:'🐊', name:'Crocodile'}] },
  { sentence: 'It swims and has black and white stripes.',correct:{ emoji:'🦓', name:'Zebra'}, wrong:[{ emoji:'🐟', name:'Fish'},{ emoji:'🐘', name:'Elephant'},{ emoji:'🦅', name:'Eagle'}] },
];

const HABITAT_DATA = [
  {
    id: 'ocean',
    name: 'Ocean',
    color: '#3B82F6',
    svg: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="oc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#93c5fd"/><stop offset="50%" stop-color="#bfdbfe"/><stop offset="100%" stop-color="#dbeafe"/>
        </linearGradient>
        <linearGradient id="oc-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2563eb"/><stop offset="40%" stop-color="#1d4ed8"/><stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="300" height="90" fill="url(#oc-sky)"/>
      <rect y="85" width="300" height="95" fill="url(#oc-sea)"/>
      <!-- olas marinas -->
      <path d="M0,88 Q25,80 50,88 T100,88 T150,88 T200,88 T250,88 T300,88 L300,180 L0,180 Z" fill="#1e40af" opacity="0.6"/>
      <path d="M0,105 Q30,96 60,105 T120,105 T180,105 T240,105 T300,105 L300,180 L0,180 Z" fill="#1d4ed8" opacity="0.8"/>
      <path d="M0,125 Q35,115 70,125 T140,125 T210,125 T280,125 T350,125 L300,180 L0,180 Z" fill="#172554"/>
      <!-- crestas blancas de espuma -->
      <path d="M10,87 Q25,82 40,87" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M110,87 Q125,82 140,87" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M210,87 Q225,82 240,87" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M50,106 Q70,99 90,106" stroke="#93c5fd" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M160,106 Q180,99 200,106" stroke="#93c5fd" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- brillo sol -->
      <circle cx="240" cy="40" r="18" fill="#fef08a" opacity="0.8"/>
      <circle cx="240" cy="40" r="28" fill="#fef08a" opacity="0.3"/>
    </svg>`
  },
  {
    id: 'rainforest',
    name: 'Rainforest',
    color: '#DC2626',
    svg: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rf-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#bef264"/><stop offset="50%" stop-color="#4ade80"/><stop offset="100%" stop-color="#14532d"/>
        </linearGradient>
      </defs>
      <rect width="300" height="180" fill="url(#rf-bg)"/>
      <!-- niebla / luz de selva -->
      <ellipse cx="150" cy="90" rx="140" ry="70" fill="#fef08a" opacity="0.35"/>
      <!-- enredaderas superiores -->
      <path d="M-10,0 Q60,40 130,10 Q200,45 310,0" stroke="#166534" stroke-width="6" fill="none"/>
      <path d="M20,10 Q40,60 30,100" stroke="#14532d" stroke-width="3" fill="none"/>
      <path d="M260,10 Q240,70 250,110" stroke="#14532d" stroke-width="3" fill="none"/>
      <!-- hojas gigantes de palmera y selva -->
      <ellipse cx="40" cy="120" rx="60" ry="35" fill="#15803d" transform="rotate(-25 40 120)"/>
      <ellipse cx="20" cy="145" rx="55" ry="30" fill="#166534" transform="rotate(-10 20 145)"/>
      <ellipse cx="260" cy="120" rx="60" ry="35" fill="#15803d" transform="rotate(25 260 120)"/>
      <ellipse cx="280" cy="145" rx="55" ry="30" fill="#166534" transform="rotate(10 280 145)"/>
      <!-- vegetación baja y flores exóticas -->
      <ellipse cx="150" cy="165" rx="100" ry="40" fill="#14532d"/>
      <ellipse cx="110" cy="160" rx="50" ry="30" fill="#16a34a"/>
      <ellipse cx="190" cy="160" rx="50" ry="30" fill="#16a34a"/>
      <!-- flor roja -->
      <circle cx="95" cy="145" r="7" fill="#ef4444"/>
      <circle cx="95" cy="145" r="3" fill="#facc15"/>
      <!-- tucán pequeño posado -->
      <ellipse cx="130" cy="135" rx="10" ry="7" fill="#0f172a"/>
      <path d="M136,134 L148,136 L136,140 Z" fill="#f97316"/>
    </svg>`
  },
  {
    id: 'savannah',
    name: 'Savannah',
    color: '#F97316',
    svg: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sav-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#bae6fd"/><stop offset="65%" stop-color="#fef08a"/><stop offset="100%" stop-color="#fed7aa"/>
        </linearGradient>
        <linearGradient id="sav-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ca8a04"/><stop offset="40%" stop-color="#d97706"/><stop offset="100%" stop-color="#854d0e"/>
        </linearGradient>
      </defs>
      <rect width="300" height="110" fill="url(#sav-sky)"/>
      <rect y="110" width="300" height="70" fill="url(#sav-ground)"/>
      <!-- nubes bajas -->
      <ellipse cx="70" cy="40" rx="40" ry="12" fill="#ffffff" opacity="0.6"/>
      <ellipse cx="230" cy="50" rx="50" ry="14" fill="#ffffff" opacity="0.5"/>
      <!-- árbol de acacia clásico silueta -->
      <!-- tronco -->
      <path d="M150,135 Q149,105 145,90 Q150,88 153,90 Q152,105 154,135 Z" fill="#451a03"/>
      <!-- ramas extendidas -->
      <path d="M146,92 Q125,82 105,75 Q125,78 147,90" stroke="#451a03" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M152,92 Q175,82 200,74 Q175,78 151,90" stroke="#451a03" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- copa aplanada tipo paraguas -->
      <ellipse cx="150" cy="72" rx="55" ry="10" fill="#14532d"/>
      <ellipse cx="130" cy="74" rx="30" ry="8" fill="#166534"/>
      <ellipse cx="175" cy="73" rx="35" ry="8" fill="#15803d"/>
      <ellipse cx="108" cy="75" rx="16" ry="6" fill="#14532d"/>
      <ellipse cx="196" cy="74" rx="16" ry="6" fill="#14532d"/>
      <!-- árbol lejano pequeño -->
      <path d="M60,122 L59,112 L61,122 Z" stroke="#78350f" stroke-width="2"/>
      <ellipse cx="60" cy="110" rx="14" ry="4" fill="#365314"/>
    </svg>`
  },
  {
    id: 'desert',
    name: 'Desert',
    color: '#16A34A',
    svg: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="des-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e293b"/><stop offset="35%" stop-color="#475569"/><stop offset="70%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
        <linearGradient id="dune-f" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f59e0b"/><stop offset="60%" stop-color="#d97706"/><stop offset="100%" stop-color="#b45309"/>
        </linearGradient>
        <linearGradient id="dune-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#b45309"/><stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
      </defs>
      <rect width="300" height="85" fill="url(#des-sky)"/>
      <!-- dunas traseras onduladas -->
      <path d="M0,85 Q70,60 160,82 T300,75 L300,180 L0,180 Z" fill="url(#dune-b)"/>
      <!-- duna media con crestas de arena -->
      <path d="M0,105 Q90,75 190,110 T300,95 L300,180 L0,180 Z" fill="url(#dune-f)"/>
      <!-- duna primer plano con rizado de arena -->
      <path d="M0,135 Q110,105 210,145 T300,130 L300,180 L0,180 Z" fill="#f59e0b"/>
      <!-- líneas de viento onduladas -->
      <path d="M10,145 Q50,138 90,146 T180,148" stroke="#d97706" stroke-width="1.8" fill="none" opacity="0.7"/>
      <path d="M20,158 Q70,150 120,160 T220,162" stroke="#b45309" stroke-width="1.8" fill="none" opacity="0.6"/>
      <path d="M130,120 Q180,112 230,122" stroke="#d97706" stroke-width="1.5" fill="none" opacity="0.7"/>
    </svg>`
  },
  {
    id: 'forest',
    name: 'Forest',
    color: '#A855F7',
    svg: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="for-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e2e8f0"/><stop offset="60%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#94a3b8"/>
        </linearGradient>
        <linearGradient id="for-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4d7c0f"/><stop offset="40%" stop-color="#3f6212"/><stop offset="100%" stop-color="#14532d"/>
        </linearGradient>
      </defs>
      <rect width="300" height="110" fill="url(#for-sky)"/>
      <rect y="110" width="300" height="70" fill="url(#for-ground)"/>
      <!-- capa de árboles lejanos en niebla -->
      <rect x="40" y="30" width="8" height="90" fill="#94a3b8" opacity="0.7"/>
      <rect x="120" y="25" width="10" height="95" fill="#94a3b8" opacity="0.7"/>
      <rect x="220" y="35" width="9" height="85" fill="#94a3b8" opacity="0.7"/>
      <!-- troncos de pinos y árboles verticales principales -->
      <rect x="15" y="10" width="14" height="130" fill="#3e2723"/>
      <rect x="80" y="5" width="16" height="135" fill="#2e1a0f"/>
      <rect x="155" y="15" width="12" height="125" fill="#3e2723"/>
      <rect x="200" y="5" width="18" height="135" fill="#27160c"/>
      <rect x="265" y="10" width="15" height="130" fill="#3e2723"/>
      <!-- copas y follaje denso superior -->
      <path d="M0,0 L300,0 L300,45 Q240,25 180,45 Q120,20 60,45 Q30,25 0,40 Z" fill="#14532d"/>
      <path d="M0,0 L300,0 L300,30 Q200,10 100,32 Q50,15 0,25 Z" fill="#166534"/>
      <!-- helechos y suelo verde boscoso -->
      <ellipse cx="60" cy="145" rx="55" ry="25" fill="#4d7c0f"/>
      <ellipse cx="140" cy="150" rx="65" ry="28" fill="#3f6212"/>
      <ellipse cx="230" cy="145" rx="60" ry="26" fill="#4d7c0f"/>
      <ellipse cx="290" cy="155" rx="40" ry="20" fill="#365314"/>
    </svg>`
  },
  {
    id: 'arctic',
    name: 'Arctic',
    color: '#1D4ED8',
    svg: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="arc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#94a3b8"/><stop offset="50%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
        <linearGradient id="ice-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f172a"/><stop offset="40%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0284c7"/>
        </linearGradient>
      </defs>
      <rect width="300" height="70" fill="url(#arc-sky)"/>
      <rect y="70" width="300" height="110" fill="url(#ice-water)"/>
      <!-- témpanos de hielo flotantes -->
      <!-- témpano grande centro-izq -->
      <polygon points="10,85 130,80 150,105 30,115" fill="#f8fafc"/>
      <polygon points="30,115 150,105 145,120 25,125" fill="#93c5fd" opacity="0.8"/>
      <!-- témpano oso polar -->
      <polygon points="170,88 285,82 270,120 180,118" fill="#f1f5f9"/>
      <polygon points="180,118 270,120 265,132 175,128" fill="#93c5fd" opacity="0.85"/>
      <!-- silueta oso polar de espaldas mirando el horizonte -->
      <ellipse cx="230" cy="82" rx="14" ry="11" fill="#f8fafc"/>
      <ellipse cx="241" cy="74" rx="7" ry="7" fill="#f8fafc"/>
      <ellipse cx="225" cy="90" rx="4" ry="7" fill="#f8fafc"/>
      <ellipse cx="237" cy="90" rx="4" ry="7" fill="#f8fafc"/>
      <!-- témpanos de primer plano -->
      <polygon points="-10,135 120,130 100,168 -20,170" fill="#ffffff"/>
      <polygon points="130,145 280,138 290,175 140,175" fill="#ffffff"/>
      <!-- agua helada entre témpanos -->
      <path d="M120,100 Q150,95 180,102" stroke="#38bdf8" stroke-width="2" fill="none" opacity="0.7"/>
      <path d="M80,140 Q110,135 140,142" stroke="#38bdf8" stroke-width="2" fill="none" opacity="0.7"/>
    </svg>`
  }
];

const DO_DOES_PHOTO_QS = [
  {
    question: 'Do fish live in groups?',
    correct: 'YES',
    btnColors: ['#16a34a', '#a855f7'], // [top, bottom]
    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fish-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284c7"/><stop offset="60%" stop-color="#0369a1"/><stop offset="100%" stop-color="#082f49"/>
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#fish-bg)"/>
      <!-- cardumen de peces nadando juntos -->
      <!-- pez 1 -->
      <ellipse cx="60" cy="50" rx="16" ry="7" fill="#f43f5e"/><polygon points="44,50 35,43 35,57" fill="#f43f5e"/><circle cx="70" cy="48" r="2" fill="#fff"/>
      <!-- pez 2 -->
      <ellipse cx="110" cy="40" rx="20" ry="9" fill="#38bdf8"/><polygon points="90,40 78,32 78,48" fill="#38bdf8"/><circle cx="122" cy="38" r="2.5" fill="#fff"/>
      <!-- pez 3 -->
      <ellipse cx="170" cy="60" rx="22" ry="10" fill="#f59e0b"/><polygon points="148,60 135,50 135,70" fill="#f59e0b"/><circle cx="184" cy="58" r="2.5" fill="#fff"/>
      <!-- pez 4 centro -->
      <ellipse cx="140" cy="110" rx="25" ry="11" fill="#ec4899"/><polygon points="115,110 100,98 100,122" fill="#ec4899"/><circle cx="156" cy="107" r="3" fill="#fff"/>
      <!-- pez 5 -->
      <ellipse cx="80" cy="120" rx="18" ry="8" fill="#a855f7"/><polygon points="62,120 50,112 50,128" fill="#a855f7"/><circle cx="92" cy="118" r="2" fill="#fff"/>
      <!-- pez 6 -->
      <ellipse cx="220" cy="100" rx="22" ry="9" fill="#10b981"/><polygon points="198,100 185,90 185,110" fill="#10b981"/><circle cx="234" cy="98" r="2.5" fill="#fff"/>
      <!-- pez 7 -->
      <ellipse cx="180" cy="150" rx="20" ry="9" fill="#f43f5e"/><polygon points="160,150 148,142 148,158" fill="#f43f5e"/><circle cx="193" cy="148" r="2" fill="#fff"/>
      <!-- pez 8 -->
      <ellipse cx="100" cy="165" rx="16" ry="7" fill="#38bdf8"/><polygon points="84,165 75,158 75,172" fill="#38bdf8"/><circle cx="110" cy="163" r="2" fill="#fff"/>
      <!-- pez 9 -->
      <ellipse cx="240" cy="145" rx="17" ry="8" fill="#fbbf24"/><polygon points="223,145 212,138 212,152" fill="#fbbf24"/><circle cx="251" cy="143" r="2" fill="#fff"/>
      <!-- burbujas de agua -->
      <circle cx="50" cy="30" r="3" fill="#fff" opacity="0.6"/>
      <circle cx="250" cy="70" r="4" fill="#fff" opacity="0.5"/>
      <circle cx="150" cy="35" r="2" fill="#fff" opacity="0.6"/>
    </svg>`
  },
  {
    question: 'Do monkeys live in the rainforest?',
    correct: 'YES',
    btnColors: ['#10b981', '#ea580c'],
    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="monk-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#bef264"/><stop offset="50%" stop-color="#22c55e"/><stop offset="100%" stop-color="#14532d"/>
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#monk-bg)"/>
      <!-- ramas y hojas gruesas -->
      <path d="M40,0 Q60,100 45,200" stroke="#78350f" stroke-width="26" fill="none"/>
      <path d="M260,0 Q240,100 255,200" stroke="#78350f" stroke-width="20" fill="none"/>
      <path d="M50,110 Q150,130 250,90" stroke="#78350f" stroke-width="14" fill="none"/>
      <!-- hojas gigantes -->
      <ellipse cx="30" cy="40" rx="45" ry="25" fill="#15803d" transform="rotate(30 30 40)"/>
      <ellipse cx="270" cy="50" rx="45" ry="25" fill="#16a34a" transform="rotate(-30 270 50)"/>
      <ellipse cx="150" cy="25" rx="55" ry="20" fill="#166534"/>
      <!-- monito/orangután trepado en el centro -->
      <!-- cuerpo -->
      <ellipse cx="145" cy="115" rx="20" ry="26" fill="#b45309"/>
      <!-- cabeza -->
      <circle cx="145" cy="85" r="16" fill="#b45309"/>
      <circle cx="145" cy="88" r="11" fill="#fed7aa"/>
      <circle cx="141" cy="86" r="2.5" fill="#1e293b"/>
      <circle cx="149" cy="86" r="2.5" fill="#1e293b"/>
      <ellipse cx="145" cy="93" rx="4" ry="2" fill="#78350f"/>
      <!-- orejas -->
      <circle cx="130" cy="85" r="5" fill="#b45309"/>
      <circle cx="160" cy="85" r="5" fill="#b45309"/>
      <!-- brazos agarrando tronco/rama -->
      <path d="M130,105 Q105,95 70,105" stroke="#b45309" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M160,105 Q195,95 230,100" stroke="#b45309" stroke-width="8" fill="none" stroke-linecap="round"/>
      <!-- cola larga enroscada -->
      <path d="M145,138 Q130,170 150,180 Q165,185 170,170" stroke="#b45309" stroke-width="6" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    question: 'Do elephants live in the savannah?',
    correct: 'YES',
    btnColors: ['#a855f7', '#2563eb'],
    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ele-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#93c5fd"/><stop offset="50%" stop-color="#fef08a"/><stop offset="100%" stop-color="#fed7aa"/>
        </linearGradient>
      </defs>
      <rect width="300" height="130" fill="url(#ele-sky)"/>
      <rect y="130" width="300" height="70" fill="#ca8a04"/>
      <!-- monte kilimanjaro al fondo -->
      <polygon points="120,130 190,65 260,130" fill="#64748b"/>
      <polygon points="175,80 190,65 205,80 190,85" fill="#ffffff"/>
      <!-- acacia árbol silueta -->
      <path d="M60,135 L58,100 L62,135" stroke="#451a03" stroke-width="4"/>
      <ellipse cx="60" cy="98" rx="35" ry="8" fill="#365314"/>
      <!-- elefante grande en primer plano -->
      <!-- cuerpo -->
      <ellipse cx="140" cy="140" rx="38" ry="30" fill="#64748b"/>
      <!-- cabeza -->
      <circle cx="105" cy="130" r="22" fill="#64748b"/>
      <!-- oreja grande -->
      <ellipse cx="118" cy="130" rx="12" ry="18" fill="#475569"/>
      <!-- trompa curvada -->
      <path d="M92,132 Q78,145 84,165 Q88,172 94,168" stroke="#64748b" stroke-width="8" fill="none" stroke-linecap="round"/>
      <!-- colmillo de marfil blanco -->
      <path d="M96,144 Q85,155 80,162" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- ojo -->
      <circle cx="100" cy="124" r="2" fill="#0f172a"/>
      <!-- patas -->
      <rect x="110" y="150" width="12" height="35" rx="5" fill="#475569"/>
      <rect x="130" y="152" width="12" height="33" rx="5" fill="#64748b"/>
      <rect x="155" y="150" width="12" height="35" rx="5" fill="#475569"/>
      <rect x="170" y="152" width="11" height="33" rx="5" fill="#64748b"/>
      <!-- cría de elefante pequeña al lado -->
      <ellipse cx="205" cy="155" rx="18" ry="14" fill="#64748b"/>
      <circle cx="192" cy="150" r="10" fill="#64748b"/>
      <path d="M185,150 Q180,160 182,168" stroke="#64748b" stroke-width="4" fill="none"/>
      <rect x="195" y="162" width="6" height="18" fill="#475569"/>
      <rect x="212" y="162" width="6" height="18" fill="#475569"/>
    </svg>`
  },
  {
    question: 'Do crocodiles sleep in trees?',
    correct: 'NO',
    btnColors: ['#0284c7', '#dc2626'],
    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="croc-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#047857"/><stop offset="50%" stop-color="#065f46"/><stop offset="100%" stop-color="#064e3b"/>
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#croc-water)"/>
      <!-- ondas de agua verde río pantano -->
      <ellipse cx="150" cy="120" rx="140" ry="35" fill="#047857" opacity="0.6"/>
      <!-- cocodrilo flotando en el agua con boca abierta -->
      <!-- cuerpo escamoso -->
      <ellipse cx="140" cy="125" rx="95" ry="28" fill="#14532d"/>
      <ellipse cx="140" cy="122" rx="85" ry="22" fill="#166534"/>
      <!-- crestas dorsales -->
      <polygon points="70,105 75,98 80,105" fill="#0f391b"/>
      <polygon points="90,103 95,95 100,103" fill="#0f391b"/>
      <polygon points="110,102 115,94 120,102" fill="#0f391b"/>
      <polygon points="130,102 135,94 140,102" fill="#0f391b"/>
      <!-- cabeza con hocico largo abierto hacia arriba -->
      <!-- mandíbula superior -->
      <polygon points="200,120 255,90 235,115" fill="#14532d"/>
      <!-- mandíbula inferior -->
      <polygon points="200,125 260,120 220,135" fill="#166534"/>
      <!-- interior boca rosa -->
      <polygon points="205,122 245,100 248,118" fill="#f43f5e"/>
      <!-- dientes puntiagudos blancos -->
      <polygon points="215,121 218,114 221,121" fill="#fff"/>
      <polygon points="225,120 228,112 231,120" fill="#fff"/>
      <polygon points="235,119 238,110 241,119" fill="#fff"/>
      <!-- ojo amarillo brillante con pupila reptil -->
      <circle cx="205" cy="108" r="6" fill="#facc15"/>
      <ellipse cx="205" cy="108" rx="1.5" ry="5" fill="#000"/>
      <!-- patas laterales con garras -->
      <ellipse cx="110" cy="148" rx="22" ry="10" fill="#14532d"/>
      <ellipse cx="170" cy="148" rx="20" ry="9" fill="#14532d"/>
    </svg>`
  },
  {
    question: 'Do sharks live in the ocean?',
    correct: 'YES',
    btnColors: ['#ea580c', '#16a34a'],
    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shark-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284c7"/><stop offset="50%" stop-color="#0369a1"/><stop offset="100%" stop-color="#0c4a6e"/>
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#shark-bg)"/>
      <!-- rayos solares submarinos -->
      <polygon points="40,0 90,0 160,200 90,200" fill="#ffffff" opacity="0.08"/>
      <polygon points="140,0 200,0 270,200 190,200" fill="#ffffff" opacity="0.08"/>
      <!-- gran tiburón blanco nadando -->
      <!-- cuerpo aerodinámico gris / blanco -->
      <path d="M40,110 Q90,65 190,78 Q250,90 275,108 Q240,135 180,140 Q90,145 40,110 Z" fill="#64748b"/>
      <!-- vientre blanco -->
      <path d="M70,120 Q120,138 180,140 Q240,135 275,108 Q230,125 170,125 Q110,125 70,120 Z" fill="#f8fafc"/>
      <!-- aleta dorsal superior grande y triangular -->
      <polygon points="135,73 160,25 185,76" fill="#475569"/>
      <!-- aleta pectoral lateral -->
      <polygon points="150,120 180,175 205,125" fill="#475569"/>
      <!-- aleta caudal (cola) -->
      <polygon points="45,112 10,65 30,110 5,145 42,116" fill="#475569"/>
      <!-- ojo negro -->
      <circle cx="245" cy="98" r="4.5" fill="#0f172a"/>
      <!-- branquias hendiduras -->
      <line x1="205" y1="95" x2="202" y2="115" stroke="#334155" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="212" y1="96" x2="209" y2="114" stroke="#334155" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="219" y1="97" x2="216" y2="113" stroke="#334155" stroke-width="2.5" stroke-linecap="round"/>
      <!-- boca con dientes afilados -->
      <path d="M255,114 Q240,118 230,115" stroke="#1e293b" stroke-width="2.5" fill="none"/>
    </svg>`
  },
  {
    question: 'Do whales live in the forest?',
    correct: 'NO',
    btnColors: ['#0284c7', '#dc2626'],
    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="whale-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8"/><stop offset="30%" stop-color="#0284c7"/><stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#whale-bg)"/>
      <!-- superficie del mar con espuma -->
      <path d="M0,45 Q75,35 150,45 T300,45" stroke="#e0f2fe" stroke-width="4" fill="none"/>
      <!-- ballena jorobada madre nadando -->
      <!-- cuerpo azul marino oscuro -->
      <ellipse cx="155" cy="95" rx="90" ry="35" fill="#1e293b"/>
      <!-- cabeza con protuberancias -->
      <path d="M235,90 Q255,95 260,110 Q240,122 210,122" fill="#1e293b"/>
      <!-- vientre estriado blanco -->
      <path d="M130,115 Q180,125 220,120 Q180,132 130,124 Z" fill="#cbd5e1"/>
      <!-- aleta pectoral larga blanca y azul -->
      <path d="M160,105 Q195,145 225,160 Q215,145 175,105" fill="#ffffff"/>
      <!-- aleta caudal (cola) -->
      <polygon points="70,95 25,70 45,95 20,118 68,98" fill="#1e293b"/>
      <!-- ojo -->
      <circle cx="230" cy="100" r="3" fill="#ffffff"/>
      <circle cx="230" cy="100" r="1.5" fill="#000"/>
      <!-- ballenita bebé nadando al lado -->
      <ellipse cx="90" cy="130" rx="40" ry="15" fill="#334155"/>
      <polygon points="52,130 30,118 42,130 28,142 50,132" fill="#334155"/>
      <path d="M90,135 Q105,152 118,158 Q112,148 95,135" fill="#e2e8f0"/>
      <!-- chorro de agua respiración -->
      <path d="M230,85 Q228,60 220,40 Q235,50 232,85" stroke="#ffffff" stroke-width="2.5" fill="none" opacity="0.8"/>
    </svg>`
  }
];

const P_ENG_TYPES_Q = [
  { intro:'🦎 What type of animal is it?',
    q:'A <b>lion</b> 🦁 feeds its babies with milk. It is a…', ans:'mammal',
    opts:['mammal','reptile','bird','fish'] },
  { intro:'🦎 What type of animal is it?',
    q:'A <b>crocodile</b> 🐊 has scales and lays eggs on land. It is a…', ans:'reptile',
    opts:['reptile','mammal','amphibian','bird'] },
  { intro:'🦎 What type of animal is it?',
    q:'A <b>penguin</b> 🐧 has wings and feathers. It is a…', ans:'bird',
    opts:['bird','mammal','reptile','fish'] },
  { intro:'🦎 What type of animal is it?',
    q:'A <b>shark</b> 🦈 lives in the water and breathes through gills. It is a…', ans:'fish',
    opts:['fish','mammal','reptile','bird'] },
  { intro:'🦎 What type of animal is it?',
    q:'A <b>frog</b> 🐸 can live on land and in water. It is an…', ans:'amphibian',
    opts:['amphibian','reptile','mammal','fish'] },
  { intro:'🦎 What type of animal is it?',
    q:'A <b>whale</b> 🐋 lives in the ocean and breathes air. It is a…', ans:'mammal',
    opts:['mammal','fish','reptile','bird'] },
  { intro:'🦎 What type of animal is it?',
    q:'An <b>eagle</b> 🦅 has wings and feathers and can fly. It is a…', ans:'bird',
    opts:['bird','reptile','mammal','insect'] },
  { intro:'🦎 What type of animal is it?',
    q:'A <b>snake</b> 🐍 has scales and is cold-blooded. It is a…', ans:'reptile',
    opts:['reptile','amphibian','mammal','fish'] },
  { intro:'🦎 What type of animal is it?',
    q:'A <b>dolphin</b> 🐬 feeds its babies with milk and lives in the sea. It is a…', ans:'mammal',
    opts:['mammal','fish','reptile','bird'] },
  { intro:'🦎 Which animal is a reptile?',
    q:'Choose the reptile from these animals:', ans:'crocodile 🐊',
    opts:['crocodile 🐊','eagle 🦅','whale 🐋','frog 🐸'] },
  { intro:'🦎 Which animal is a bird?',
    q:'Choose the bird from these animals:', ans:'penguin 🐧',
    opts:['penguin 🐧','shark 🦈','lion 🦁','frog 🐸'] },
  { intro:'🦎 Which animal is a mammal?',
    q:'Choose the mammal from these animals:', ans:'elephant 🐘',
    opts:['elephant 🐘','crocodile 🐊','shark 🦈','frog 🐸'] },
];

const P_ENG_TF_Q = [
  { intro: '✅ Is this sentence TRUE or FALSE?',
    q: 'It has got feathers.', ans: 'TRUE',
    opts: ['TRUE', 'FALSE'],
    explain: 'Yes! Parrots have beautiful colorful feathers.',
    layout: 'horizontal',
    btnColors: ['#e11d48', '#f97316'],
    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-parrot1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#bae6fd"/>
          <stop offset="100%" stop-color="#e0f2fe"/>
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#bg-parrot1)"/>
      <path d="M 0,0 Q 50,40 100,0 Z" fill="#15803d" opacity="0.6"/>
      <path d="M 300,0 Q 250,50 200,0 Z" fill="#166534" opacity="0.5"/>
      <rect x="-10" y="140" width="320" height="25" rx="8" fill="#8b5e3c" transform="rotate(-5, 150, 150)"/>
      <path d="M 120,130 L 110,195 L 125,190 Z" fill="#1d4ed8"/>
      <path d="M 125,130 L 118,198 L 132,192 Z" fill="#16a34a"/>
      <ellipse cx="140" cy="110" rx="25" ry="40" fill="#15803d" transform="rotate(-15, 140, 110)"/>
      <ellipse cx="120" cy="112" rx="22" ry="36" fill="#fbbf24"/>
      <ellipse cx="112" cy="98" rx="12" ry="18" fill="#f97316"/>
      <path d="M 135,80 Q 165,100 145,140 Q 125,130 135,80 Z" fill="#166534"/>
      <path d="M 140,90 Q 160,105 145,130 Q 132,120 140,90 Z" fill="#eab308"/>
      <circle cx="115" cy="65" r="22" fill="#facc15"/>
      <circle cx="106" cy="68" r="11" fill="#ea580c" opacity="0.9"/>
      <circle cx="106" cy="62" r="4.5" fill="#1e293b"/>
      <circle cx="104.5" cy="60" r="1.5" fill="#ffffff"/>
      <path d="M 95,60 Q 82,65 95,80 Q 98,72 98,68 Z" fill="#334155"/>
      <circle cx="120" cy="146" r="4.5" fill="#64748b"/>
      <circle cx="130" cy="144" r="4.5" fill="#64748b"/>
    </svg>`
  },
  { intro: '✅ Is this sentence TRUE or FALSE?',
    q: 'It has got teeth.', ans: 'TRUE',
    opts: ['TRUE', 'FALSE'],
    explain: 'Yes! Koalas have got sharp teeth to chew eucalyptus leaves.',
    layout: 'horizontal',
    btnColors: ['#7c3aed', '#3b82f6'],
    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-koala" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#bbf7d0"/>
          <stop offset="100%" stop-color="#f0fdf4"/>
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#bg-koala)"/>
      <path d="M 230,-10 Q 210,100 240,210" stroke="#7c2d12" stroke-width="24" fill="none"/>
      <path d="M 220,110 Q 110,130 50,150" stroke="#7c2d12" stroke-width="14" fill="none"/>
      <ellipse cx="70" cy="120" rx="25" ry="12" fill="#15803d" transform="rotate(-15, 70, 120)"/>
      <ellipse cx="120" cy="105" rx="30" ry="14" fill="#166534" transform="rotate(10, 120, 105)"/>
      <ellipse cx="170" cy="100" rx="24" ry="11" fill="#15803d" transform="rotate(-5, 170, 100)"/>
      <ellipse cx="150" cy="150" rx="32" ry="38" fill="#94a3b8"/>
      <ellipse cx="150" cy="150" rx="24" ry="30" fill="#cbd5e1"/>
      <circle cx="150" cy="95" r="30" fill="#94a3b8"/>
      <circle cx="118" cy="82" r="16" fill="#94a3b8"/>
      <circle cx="118" cy="82" r="11" fill="#e2e8f0"/>
      <circle cx="118" cy="82" r="8" fill="#ffffff" opacity="0.6"/>
      <circle cx="182" cy="82" r="16" fill="#94a3b8"/>
      <circle cx="182" cy="82" r="11" fill="#e2e8f0"/>
      <circle cx="182" cy="82" r="8" fill="#ffffff" opacity="0.6"/>
      <circle cx="138" cy="92" r="3.5" fill="#1e293b"/>
      <circle cx="162" cy="92" r="3.5" fill="#1e293b"/>
      <circle cx="136.5" cy="90" r="1" fill="#ffffff"/>
      <circle cx="160.5" cy="90" r="1" fill="#ffffff"/>
      <path d="M 144,92 Q 140,116 150,116 Q 160,116 156,92 Z" fill="#1e293b"/>
      <path d="M 144,118 Q 150,124 156,118" stroke="#475569" stroke-width="2" fill="none"/>
      <polygon points="148,118 149,122 151,122 152,118" fill="#ffffff"/>
      <path d="M 175,136 Q 200,134 216,128" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M 125,148 Q 100,154 75,150" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" fill="none"/>
    </svg>`
  },
  { intro: '✅ Is this sentence TRUE or FALSE?',
    q: 'It has got wings.', ans: 'FALSE',
    opts: ['TRUE', 'FALSE'],
    explain: "No, seals don't have wings. They have got flippers to swim!",
    layout: 'vertical',
    btnColors: ['#d946ef', '#2563eb'],
    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-seal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="50%" stop-color="#0369a1"/>
          <stop offset="100%" stop-color="#082f49"/>
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#bg-seal)"/>
      <ellipse cx="150" cy="140" rx="100" ry="25" fill="#38bdf8" opacity="0.3"/>
      <ellipse cx="150" cy="160" rx="42" ry="55" fill="#64748b" transform="rotate(-10, 150, 160)"/>
      <circle cx="150" cy="105" r="28" fill="#64748b"/>
      <circle cx="138" cy="98" r="4.5" fill="#0f172a"/>
      <circle cx="136" cy="96" r="1.5" fill="#ffffff"/>
      <circle cx="162" cy="98" r="4.5" fill="#0f172a"/>
      <circle cx="160" cy="96" r="1.5" fill="#ffffff"/>
      <ellipse cx="150" cy="114" rx="11" ry="8" fill="#475569"/>
      <polygon points="146,110 154,110 150,116" fill="#0f172a"/>
      <line x1="138" y1="115" x2="114" y2="112" stroke="#ffffff" stroke-width="1.5" opacity="0.8"/>
      <line x1="138" y1="118" x2="110" y2="122" stroke="#ffffff" stroke-width="1.5" opacity="0.8"/>
      <line x1="139" y1="121" x2="114" y2="132" stroke="#ffffff" stroke-width="1.5" opacity="0.8"/>
      <line x1="162" y1="115" x2="186" y2="112" stroke="#ffffff" stroke-width="1.5" opacity="0.8"/>
      <line x1="162" y1="118" x2="190" y2="122" stroke="#ffffff" stroke-width="1.5" opacity="0.8"/>
      <line x1="161" y1="121" x2="186" y2="132" stroke="#ffffff" stroke-width="1.5" opacity="0.8"/>
      <circle cx="138" cy="140" r="1.5" fill="#334155"/>
      <circle cx="162" cy="142" r="2" fill="#334155"/>
      <path d="M 80,135 Q 150,155 220,135" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.7"/>
      <path d="M 100,145 Q 150,162 200,145" stroke="#38bdf8" stroke-width="2.5" fill="none" opacity="0.8"/>
    </svg>`
  },
  { intro: '✅ Is this sentence TRUE or FALSE?',
    q: 'It has got wings.', ans: 'TRUE',
    opts: ['TRUE', 'FALSE'],
    explain: 'Yes! Parrots have got wings to fly around the forest.',
    layout: 'horizontal',
    btnColors: ['#10b981', '#f97316'],
    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-parrot2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#a7f3d0"/>
          <stop offset="100%" stop-color="#d1fae5"/>
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#bg-parrot2)"/>
      <rect x="-10" y="135" width="320" height="20" rx="6" fill="#78350f" transform="rotate(4, 150, 140)"/>
      <path d="M 130,130 L 145,195 L 132,192 Z" fill="#ea580c"/>
      <path d="M 135,130 L 152,198 L 138,195 Z" fill="#6366f1"/>
      <ellipse cx="140" cy="105" rx="24" ry="38" fill="#dc2626"/>
      <ellipse cx="152" cy="100" rx="14" ry="24" fill="#4f46e5" transform="rotate(15, 152, 100)"/>
      <circle cx="125" cy="65" r="21" fill="#dc2626"/>
      <circle cx="125" cy="65" r="18" fill="#ef4444"/>
      <circle cx="118" cy="60" r="4.5" fill="#facc15"/>
      <circle cx="118" cy="60" r="2.5" fill="#0f172a"/>
      <path d="M 106,62 Q 95,65 106,78 Q 110,70 109,66 Z" fill="#1e293b"/>
      <circle cx="132" cy="142" r="4" fill="#475569"/>
      <circle cx="142" cy="140" r="4" fill="#475569"/>
    </svg>`
  },
  { intro: '✅ Is this sentence TRUE or FALSE?',
    q: 'It has got a shell.', ans: 'TRUE',
    opts: ['TRUE', 'FALSE'],
    explain: 'Yes! Sea turtles have got a strong shell to protect their body.',
    layout: 'vertical',
    btnColors: ['#f97316', '#16a34a'],
    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-turtle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#075985"/>
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#bg-turtle)"/>
      <circle cx="50" cy="40" r="3" fill="#ffffff" opacity="0.4"/>
      <circle cx="55" cy="30" r="1.5" fill="#ffffff" opacity="0.5"/>
      <circle cx="240" cy="150" r="4.5" fill="#ffffff" opacity="0.3"/>
      <path d="M 90,130 Q 75,150 70,160 Z" fill="#15803d"/>
      <path d="M 130,135 Q 135,155 140,165 Z" fill="#166534"/>
      <path d="M 160,95 Q 230,50 250,45 Q 220,90 170,110 Z" fill="#15803d"/>
      <path d="M 100,95 Q 40,55 20,52 Q 50,92 90,112 Z" fill="#166534"/>
      <ellipse cx="130" cy="105" rx="42" ry="32" fill="#7c2d12" transform="rotate(-5, 130, 105)"/>
      <ellipse cx="130" cy="105" rx="36" ry="26" fill="none" stroke="#fb923c" stroke-width="2" transform="rotate(-5, 130, 105)"/>
      <line x1="130" y1="73" x2="130" y2="137" stroke="#fb923c" stroke-width="1.5" transform="rotate(-5, 130, 105)"/>
      <line x1="88" y1="105" x2="172" y2="105" stroke="#fb923c" stroke-width="1.5" transform="rotate(-5, 130, 105)"/>
      <path d="M 168,105 Q 190,95 195,110 Q 185,122 165,115 Z" fill="#15803d"/>
      <circle cx="184" cy="105" r="2.5" fill="#0f172a"/>
    </svg>`
  },
  { intro: '✅ Is this sentence TRUE or FALSE?',
    q: 'It has got feathers.', ans: 'FALSE',
    opts: ['TRUE', 'FALSE'],
    explain: "No, puppies don't have feathers! They have got soft hair or fur.",
    layout: 'horizontal',
    btnColors: ['#c084fc', '#1d4ed8'],
    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-puppy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fed7aa"/>
          <stop offset="100%" stop-color="#ffedd5"/>
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#bg-puppy)"/>
      <line x1="0" y1="150" x2="300" y2="150" stroke="#d97706" stroke-width="3" opacity="0.4"/>
      <line x1="0" y1="175" x2="300" y2="175" stroke="#d97706" stroke-width="3" opacity="0.4"/>
      <path d="M 210,135 Q 240,110 250,90 Q 235,115 205,142" fill="#eab308"/>
      <ellipse cx="155" cy="140" rx="55" ry="30" fill="#fef08a"/>
      <rect x="110" y="145" width="12" height="45" rx="5" fill="#fef08a"/>
      <rect x="135" y="148" width="12" height="42" rx="5" fill="#fde047"/>
      <rect x="175" y="145" width="12" height="45" rx="5" fill="#fef08a"/>
      <rect x="195" y="148" width="11" height="42" rx="5" fill="#fde047"/>
      <circle cx="105" cy="100" r="26" fill="#fef08a"/>
      <path d="M 85,82 Q 74,105 82,122 Q 94,115 91,92 Z" fill="#eab308"/>
      <path d="M 125,82 Q 136,105 128,122 Q 116,115 119,92 Z" fill="#eab308"/>
      <circle cx="98" cy="98" r="3.5" fill="#1e293b"/>
      <circle cx="114" cy="98" r="3.5" fill="#1e293b"/>
      <circle cx="96" cy="96" r="1" fill="#ffffff"/>
      <circle cx="112" cy="96" r="1" fill="#ffffff"/>
      <ellipse cx="106" cy="108" rx="8" ry="6" fill="#fde047"/>
      <polygon points="102,105 110,105 106,110" fill="#1e293b"/>
      <path d="M 104,111 Q 106,114 108,111" stroke="#1e293b" stroke-width="1.5" fill="none"/>
    </svg>`
  },
  { intro: '✅ Is this sentence TRUE or FALSE?',
    q: 'It has got a tail.', ans: 'TRUE',
    opts: ['TRUE', 'FALSE'],
    explain: 'Yes! Cats have got long tails to balance themselves.',
    layout: 'horizontal',
    btnColors: ['#f97316', '#15803d'],
    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-cat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fed7aa"/>
          <stop offset="100%" stop-color="#ffeedd"/>
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#bg-cat)"/>
      <rect y="145" width="300" height="55" fill="#e2e8f0"/>
      <rect y="140" width="300" height="5" fill="#cbd5e1"/>
      <path d="M 230,145 Q 260,110 250,75 Q 235,110 215,145" fill="#b45309" transform="rotate(5, 230, 145)"/>
      <ellipse cx="150" cy="155" rx="55" ry="30" fill="#fb923c"/>
      <circle cx="150" cy="105" r="32" fill="#fb923c"/>
      <path d="M 130,85 Q 140,95 135,100" stroke="#b45309" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M 170,85 Q 160,95 165,100" stroke="#b45309" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M 150,73 L 150,85" stroke="#b45309" stroke-width="3" fill="none" stroke-linecap="round"/>
      <polygon points="120,85 110,50 135,78" fill="#fb923c"/>
      <polygon points="120,80 115,56 131,76" fill="#fecdd3"/>
      <polygon points="180,85 190,50 165,78" fill="#fb923c"/>
      <polygon points="180,80 185,56 169,76" fill="#fecdd3"/>
      <circle cx="134" cy="105" r="8.5" fill="#a3e635"/>
      <ellipse cx="134" cy="105" rx="3" ry="8.5" fill="#0f172a"/>
      <circle cx="132" cy="101" r="2.5" fill="#ffffff"/>
      <circle cx="166" cy="105" r="8.5" fill="#a3e635"/>
      <ellipse cx="166" cy="105" rx="3" ry="8.5" fill="#0f172a"/>
      <circle cx="164" cy="101" r="2.5" fill="#ffffff"/>
      <polygon points="146,112 154,112 150,117" fill="#f43f5e"/>
      <line x1="126" y1="120" x2="96" y2="118" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="126" y1="124" x2="98" y2="128" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="174" y1="120" x2="204" y2="118" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="174" y1="124" x2="202" y2="128" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="125" cy="148" r="11" fill="#ffffff"/>
      <circle cx="175" cy="148" r="11" fill="#ffffff"/>
    </svg>`
  },
  { intro: '✅ Is this sentence TRUE or FALSE?',
    q: 'It has got fur.', ans: 'TRUE',
    opts: ['TRUE', 'FALSE'],
    explain: 'Yes! Dogs have got fur (hair) all over their bodies.',
    layout: 'horizontal',
    btnColors: ['#3b82f6', '#ef4444'],
    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-chocdog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f1f5f9"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#bg-chocdog)"/>
      <ellipse cx="150" cy="175" rx="55" ry="35" fill="#451a03"/>
      <path d="M 115,145 Q 150,165 185,145 L 180,154 Q 150,172 120,154 Z" fill="#ec4899"/>
      <circle cx="150" cy="165" r="7" fill="#cbd5e1"/>
      <circle cx="150" cy="100" r="30" fill="#451a03"/>
      <path d="M 124,80 Q 106,110 114,130 Q 128,122 125,98 Z" fill="#2d1200"/>
      <path d="M 176,80 Q 194,110 186,130 Q 172,122 175,98 Z" fill="#2d1200"/>
      <circle cx="138" cy="98" r="4.5" fill="#0f172a"/>
      <circle cx="162" cy="98" r="4.5" fill="#0f172a"/>
      <circle cx="136" cy="96" r="1" fill="#ffffff"/>
      <circle cx="160" cy="96" r="1" fill="#ffffff"/>
      <ellipse cx="150" cy="112" rx="11" ry="8" fill="#2d1200"/>
      <polygon points="144,108 156,108 150,114" fill="#0f172a"/>
    </svg>`
  },
  { intro: '✅ Is this sentence TRUE or FALSE?',
    q: 'It has got claws.', ans: 'TRUE',
    opts: ['TRUE', 'FALSE'],
    explain: 'Yes! Lions have got sharp retractable claws to hunt and climb.',
    layout: 'vertical',
    btnColors: ['#3b82f6', '#ef4444'],
    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-lionpaws" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fffbeb"/>
          <stop offset="100%" stop-color="#fef3c7"/>
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#bg-lionpaws)"/>
      <ellipse cx="150" cy="165" rx="110" ry="12" fill="#eab308" opacity="0.3"/>
      <path d="M 0,0 Q 100,50 300,0 L 300,25 Q 150,80 0,25 Z" fill="#451a03" opacity="0.25"/>
      <path d="M 0,0 Q 150,60 300,0 L 300,10 L 0,10 Z" fill="#451a03" opacity="0.3"/>
      <rect x="70" y="50" width="36" height="110" rx="8" fill="#ca8a04"/>
      <rect x="73" y="55" width="30" height="100" rx="4" fill="#eab308"/>
      <rect x="180" y="50" width="36" height="110" rx="8" fill="#ca8a04"/>
      <rect x="183" y="55" width="30" height="100" rx="4" fill="#eab308"/>
      <ellipse cx="88" cy="158" rx="24" ry="14" fill="#ca8a04"/>
      <circle cx="72" cy="158" r="8" fill="#eab308"/>
      <circle cx="88" cy="158" r="8" fill="#eab308"/>
      <circle cx="104" cy="158" r="8" fill="#eab308"/>
      <path d="M 72,162 Q 72,172 68,172 Q 74,168 74,162 Z" fill="#1e293b"/>
      <path d="M 88,162 Q 88,174 84,174 Q 90,170 90,162 Z" fill="#1e293b"/>
      <path d="M 104,162 Q 104,172 100,172 Q 106,168 106,162 Z" fill="#1e293b"/>
      <ellipse cx="198" cy="158" rx="24" ry="14" fill="#ca8a04"/>
      <circle cx="182" cy="158" r="8" fill="#eab308"/>
      <circle cx="198" cy="158" r="8" fill="#eab308"/>
      <circle cx="214" cy="158" r="8" fill="#eab308"/>
      <path d="M 182,162 Q 182,172 178,172 Q 184,168 184,162 Z" fill="#1e293b"/>
      <path d="M 198,162 Q 198,174 194,174 Q 200,170 200,162 Z" fill="#1e293b"/>
      <path d="M 214,162 Q 214,172 210,172 Q 216,168 216,162 Z" fill="#1e293b"/>
    </svg>`
  },
  { intro:'✅ Is this sentence TRUE or FALSE?',
    q:'🐊 A crocodile lives only in the water.', ans:'FALSE',
    opts:['TRUE','FALSE'],
    explain:'A crocodile lives on land AND in water.' },
  { intro:'✅ Is this sentence TRUE or FALSE?',
    q:'🦁 A lion is a mammal.', ans:'TRUE',
    opts:['TRUE','FALSE'],
    explain:'Yes! A lion feeds its babies with milk. It is a mammal.' },
  { intro:'✅ Is this sentence TRUE or FALSE?',
    q:'🦈 Sharks live in the desert.', ans:'FALSE',
    opts:['TRUE','FALSE'],
    explain:'Sharks live in the ocean, not the desert.' },
  { intro:'✅ Is this sentence TRUE or FALSE?',
    q:'🐧 Penguins can fly.', ans:'FALSE',
    opts:['TRUE','FALSE'],
    explain:'Penguins cannot fly. They can swim.' },
  { intro:'✅ Is this sentence TRUE or FALSE?',
    q:'🐘 Elephants eat meat.', ans:'FALSE',
    opts:['TRUE','FALSE'],
    explain:"Elephants don't eat meat. They eat plants and grass." },
  { intro:'✅ Is this sentence TRUE or FALSE?',
    q:'🦅 Eagles have wings and can fly.', ans:'TRUE',
    opts:['TRUE','FALSE'],
    explain:'Yes! Eagles have big wings and can fly very high.' },
  { intro:'✅ Is this sentence TRUE or FALSE?',
    q:'🐒 Monkeys live in the rainforest.', ans:'TRUE',
    opts:['TRUE','FALSE'],
    explain:'Yes! Monkeys live in the rainforest and eat fruit.' },
  { intro:'✅ Is this sentence TRUE or FALSE?',
    q:'🐸 A frog is a reptile.', ans:'FALSE',
    opts:['TRUE','FALSE'],
    explain:'A frog is an amphibian, not a reptile.' },
  { intro:'✅ Is this sentence TRUE or FALSE?',
    q:'🦒 A giraffe has a very long neck.', ans:'TRUE',
    opts:['TRUE','FALSE'],
    explain:'Yes! The giraffe is the tallest animal on land.' },
  { intro:'✅ Is this sentence TRUE or FALSE?',
    q:'🐋 A whale is a fish.', ans:'FALSE',
    opts:['TRUE','FALSE'],
    explain:'A whale is a mammal. It breathes air and feeds its babies with milk.' },
  { intro:'✅ Is this sentence TRUE or FALSE?',
    q:'🦓 A zebra has stripes.', ans:'TRUE',
    opts:['TRUE','FALSE'],
    explain:'Yes! A zebra has black and white stripes.' },
  { intro:'✅ Is this sentence TRUE or FALSE?',
    q:"🐊 A crocodile doesn't have legs.", ans:'FALSE',
    opts:['TRUE','FALSE'],
    explain:'A crocodile has four short legs.' },
];

const P_ENG_WRITESENT_Q = [
  { intro:'✏️ Choose the correct word to complete the sentence:',
    q:'A giraffe ___ leaves from tall trees. (eat)', ans:'eats',
    opts:['eats','eat','eating','eaten'] },
  { intro:'✏️ Choose the correct word to complete the sentence:',
    q:'Penguins ___ in cold water. (swim)', ans:'swim',
    opts:['swim','swims','swimming','swam'] },
  { intro:'✏️ Choose the correct word to complete the sentence:',
    q:'A lion ___ meat. It is a carnivore. (eat)', ans:'eats',
    opts:['eats','eat','does eat','eating'] },
  { intro:'✏️ Choose the correct word to complete the sentence:',
    q:'Elephants ___ plants and grass. (eat)', ans:'eat',
    opts:['eat','eats','eating','ate'] },
  { intro:'✏️ Choose the correct word to complete the sentence:',
    q:'A snake ___ have legs. (not)', ans:"doesn't have",
    opts:["doesn't have","don't have","has not","not have"] },
  { intro:'✏️ Choose the correct word to complete the sentence:',
    q:'Sharks ___ in the forest. (live — negative)', ans:"don't live",
    opts:["don't live","doesn't live","not live","lives not"] },
  { intro:'✏️ Choose the correct word to complete the sentence:',
    q:'A crocodile ___ on land and in water. (live)', ans:'lives',
    opts:['lives','live','is living','lived'] },
  { intro:'✏️ Choose the correct word to complete the sentence:',
    q:'___ eagles fly? Yes, they can!', ans:'Can',
    opts:['Can','Do','Does','Are'] },
  { intro:'✏️ Choose the correct word to complete the sentence:',
    q:'___ a whale live in the ocean? Yes, it does.', ans:'Does',
    opts:['Does','Do','Can','Is'] },
  { intro:'✏️ Choose the correct word to complete the sentence:',
    q:'Monkeys like fruit. ___ eat bananas every day. (they)', ans:'They',
    opts:['They','It','He','She'] },
  { intro:'✏️ Choose the correct word to complete the sentence:',
    q:'A frog ___ jump very high. (can)', ans:'can',
    opts:['can','cans',"can't",'does'] },
  { intro:'✏️ Choose the correct word to complete the sentence:',
    q:'A bat ___ fly at night. It uses sound to find food. (can)', ans:'can',
    opts:['can','cannot','does','is'] },
];

const P_ENG_DESCRIBE_Q = [
  { intro:'🔍 Read the description — which animal is it?',
    q:'It is a mammal. It lives in the savannah. It has a very long neck. It eats leaves from tall trees.',
    ans:'giraffe 🦒', opts:['giraffe 🦒','crocodile 🐊','shark 🦈','penguin 🐧'] },
  { intro:'🔍 Read the description — which animal is it?',
    q:'It is a reptile. It lives on land and in water. It has four legs and a long tail. It hunts fish.',
    ans:'crocodile 🐊', opts:['crocodile 🐊','whale 🐋','elephant 🐘','zebra 🦓'] },
  { intro:'🔍 Read the description — which animal is it?',
    q:'It is a mammal. It lives in the ocean. It is the biggest animal in the world. It cannot live on land.',
    ans:'whale 🐋', opts:['whale 🐋','shark 🦈','dolphin 🐬','hippo 🦛'] },
  { intro:'🔍 Read the description — which animal is it?',
    q:'It is a bird. It lives in cold places. It can swim but it cannot fly.',
    ans:'penguin 🐧', opts:['penguin 🐧','eagle 🦅','monkey 🐒','lion 🦁'] },
  { intro:'🔍 Read the description — which animal is it?',
    q:'It is a mammal. It lives in the rainforest. It likes fruit. It can climb trees.',
    ans:'monkey 🐒', opts:['monkey 🐒','shark 🦈','crocodile 🐊','penguin 🐧'] },
  { intro:'🔍 Read the description — which animal is it?',
    q:'It is a fish. It lives in the ocean. It has fins and sharp teeth. It is very dangerous.',
    ans:'shark 🦈', opts:['shark 🦈','whale 🐋','dolphin 🐬','frog 🐸'] },
  { intro:'🔍 Read the description — which animal is it?',
    q:'It is a mammal. It lives on the grassland. It has black and white stripes.',
    ans:'zebra 🦓', opts:['zebra 🦓','elephant 🐘','hippo 🦛','lion 🦁'] },
  { intro:'🔍 Read the description — which animal is it?',
    q:'It is a mammal. It lives in the savannah. It is the biggest animal on land. It has a long nose called a trunk.',
    ans:'elephant 🐘', opts:['elephant 🐘','hippo 🦛','giraffe 🦒','whale 🐋'] },
  { intro:'🔍 Read the description — which animal is it?',
    q:'It is a bird. It has big wings and it can fly very high. It hunts small animals. It lives in mountains.',
    ans:'eagle 🦅', opts:['eagle 🦅','penguin 🐧','shark 🦈','frog 🐸'] },
  { intro:'🔍 Read the description — which animal is it?',
    q:'It is an amphibian. It can jump and swim. It lives near rivers. It eats insects.',
    ans:'frog 🐸', opts:['frog 🐸','crocodile 🐊','snake 🐍','fish 🐟'] },
  { intro:'🔍 Read the description — which animal is it?',
    q:'It is a mammal. It lives in rivers and lakes in Africa. It has a very big mouth. It can run fast on land.',
    ans:'hippo 🦛', opts:['hippo 🦛','crocodile 🐊','elephant 🐘','whale 🐋'] },
  { intro:'🔍 Read the description — which animal is it?',
    q:'It is a mammal. It lives in the savannah. It is a carnivore. It lives and hunts in groups called prides.',
    ans:'lion 🦁', opts:['lion 🦁','zebra 🦓','giraffe 🦒','elephant 🐘'] },
];

const BP_WORDS = ['tail','teeth','feathers','wings','shell','fur'];

const BP_ROUNDS = [
  /* round 1 — igual a la imagen */
  {
    animals: [
      { emoji:'🐰', name:'rabbit',    answer:'tail',     border:'#f59e0b' },
      { emoji:'🦜', name:'parrot',    answer:'feathers', border:'#38bdf8' },
      { emoji:'🐯', name:'tiger',     answer:'teeth',    border:'#a855f7' },
      { emoji:'🐢', name:'turtle',    answer:'shell',    border:'#f59e0b' },
      { emoji:'🦅', name:'eagle',     answer:'wings',    border:'#22c55e' },
      { emoji:'🦁', name:'lion',      answer:'fur',      border:'#f97316' },
    ]
  },
  /* round 2 */
  {
    animals: [
      { emoji:'🦊', name:'fox',       answer:'tail',     border:'#f59e0b' },
      { emoji:'🦈', name:'shark',     answer:'teeth',    border:'#38bdf8' },
      { emoji:'🦆', name:'duck',      answer:'feathers', border:'#a855f7' },
      { emoji:'🦋', name:'butterfly', answer:'wings',    border:'#22c55e' },
      { emoji:'🐌', name:'snail',     answer:'shell',    border:'#f59e0b' },
      { emoji:'🐻', name:'bear',      answer:'fur',      border:'#f97316' },
    ]
  },
  /* round 3 */
  {
    animals: [
      { emoji:'🐒', name:'monkey',    answer:'tail',     border:'#f59e0b' },
      { emoji:'🐊', name:'crocodile', answer:'teeth',    border:'#38bdf8' },
      { emoji:'🦚', name:'peacock',   answer:'feathers', border:'#a855f7' },
      { emoji:'🐦', name:'bird',      answer:'wings',    border:'#22c55e' },
      { emoji:'🐚', name:'clam',      answer:'shell',    border:'#f97316' },
      { emoji:'🐺', name:'wolf',      answer:'fur',      border:'#f59e0b' },
    ]
  },
  /* round 4 */
  {
    animals: [
      { emoji:'🐴', name:'horse',     answer:'tail',     border:'#f59e0b' },
      { emoji:'🐡', name:'pufferfish',answer:'teeth',    border:'#38bdf8' },
      { emoji:'🦩', name:'flamingo',  answer:'feathers', border:'#a855f7' },
      { emoji:'🦗', name:'insect',    answer:'wings',    border:'#22c55e' },
      { emoji:'🐠', name:'fish',      answer:'shell',    border:'#f97316' },
      { emoji:'🦊', name:'rabbit',    answer:'fur',      border:'#f59e0b' },
    ]
  },
];