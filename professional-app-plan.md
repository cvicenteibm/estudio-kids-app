# Plan de Modernización de la App "Estudio Kids"

Este plan detalla los pasos necesarios para transformar la aplicación actual en una plataforma profesional completa, estructurada en un modelo **Frontend-Backend**, con una interfaz pulida y un sistema de almacenamiento persistente local basado en **Node.js, Express y SQLite**.

---

## 📋 Resumen del Objetivo y Enfoque

1. **Frontend Profesional (UI/UX)**:
   - Separar el archivo monolítico `index.html` de ~7,000 líneas en archivos independientes y modulares: `index.html` (estructura), `styles.css` (estilos), `app.js` (lógica principal) y `exercises.js` (datos de ejercicios). Esto facilitará el mantenimiento y la legibilidad.
   - Mejorar la tipografía: Utilizar fuentes vectoriales de alta legibilidad (como `Nunito` o `Quicksand`) para preguntas, lecturas y explicaciones, reservando las fuentes pixeladas (`Press Start 2P`) únicamente para títulos y marcadores de puntuación.
   - Pulir texturas, bordes y animaciones CSS (efectos voxel limpios, sombras coherentes y transiciones suaves).

2. **Backend Liviano y Seguro (Node.js + Express)**:
   - Crear un servidor local Node.js con Express que sirva los archivos estáticos del frontend.
   - Implementar un sistema de autenticación sencillo (registro e inicio de sesión amigable para niños con nombre de usuario y PIN/contraseña básica).
   - Crear endpoints de API para guardar y recuperar el progreso del usuario (estrellas, misiones completadas y logros).

3. **Base de Datos Embebida (SQLite)**:
   - Utilizar SQLite, una base de datos relacional autónoma que guarda toda la información en un solo archivo local (`database.sqlite`). No requiere instalaciones externas y se autoinicia con la app.
   - Tablas principales: `users` (usuarios y credenciales hash) y `progress` (progreso acumulado, estrellas, misiones y fecha de actualización).

4. **Empaquetado y Distribución Simplificada**:
   - Crear un archivo `package.json` con todos los scripts necesarios.
   - Añadir un script de inicio automático que ejecute el servidor y abra el navegador en `http://localhost:3000` con un solo clic.
   - Comprimir la estructura final en `estudio-kids-app.zip`.

---

## 🛠️ Subtareas del Proyecto

### Subtarea 1: Estructuración y Modularización del Frontend
- **Intención**: Separar el código monolítico de `index.html` para hacerlo modular, limpio y profesional.
- **Resultados Esperados**: Un directorio `public/` que contenga:
  - `index.html` (estructura base, limpio, importando los recursos necesarios).
  - `css/styles.css` (todos los estilos CSS centralizados y organizados).
  - `js/exercises.js` (bases de datos de preguntas y generadores de ejercicios).
  - `js/app.js` (lógica de estados de pantallas, progreso local, sonidos y renderizado).
- **Lista de Tareas**:
  1. [ ] Crear la estructura de carpetas: `public/`, `public/css/`, `public/js/`, `public/assets/`.
  2. [ ] Extraer todo el bloque `<style>` de `index.html` hacia `public/css/styles.css`.
  3. [ ] Extraer las colecciones de datos gigantes (ejercicios, preguntas, textos, constantes de traducción) a `public/js/exercises.js`.
  4. [ ] Extraer las funciones de control de estado, interactividad y sonido de JavaScript a `public/js/app.js`.
  5. [ ] Dejar un `public/index.html` limpio de apenas unas cientos de líneas de estructura de vistas.
- **Estado**: `[x] completado`

---

### Subtarea 2: Pulido Estético, Tipográfico y UX
- **Intención**: Hacer que los textos sean legibles para niños de escuela primaria y que la interfaz luzca como un juego voxel comercial y pulido.
- **Resultados Esperados**:
  - Textos de preguntas, lecturas y problemas con fuentes redondeadas de alta legibilidad (`Nunito` o `Quicksand`).
  - Texturas voxel más nítidas con sombras consistentes, bordes suavizados y colores coordinados.
  - Diseño responsive optimizado para tabletas y computadoras.
- **Lista de Tareas**:
  1. [ ] Importar las fuentes de Google Fonts: `'Press Start 2P'` (para títulos) y `'Nunito'` (para textos de lectura, problemas y opciones).
  2. [ ] Reemplazar las tipografías en el CSS para elementos de texto largo (`.reading-box`, `.ex-intro`, `.opt-btn`, etc.).
  3. [ ] Ajustar el diseño de los botones de opción (`.opt-btn`) y tarjetas de misiones para mejorar el contraste, la legibilidad del texto y el feedback de pulsado.
  4. [ ] Normalizar los colores voxel en todo el CSS para garantizar una paleta armónica y profesional.
- **Estado**: `[x] completado`

---

### Subtarea 3: Creación del Servidor Backend (Node.js + Express)
- **Intención**: Proveer la infraestructura del servidor que aloje el backend de la app, exponga las APIs de progreso y sirva el frontend.
- **Resultados Esperados**: Un servidor funcional en Node.js que escuche peticiones HTTP y maneje sesiones de usuario.
- **Lista de Tareas**:
  1. [ ] Crear un archivo `package.json` en la raíz con Express, SQLite3 (o `better-sqlite3`), bcrypt (para contraseñas seguras), JWT (para autenticación) y dependencias de utilidad.
  2. [ ] Crear `server.js` como punto de entrada del backend.
  3. [ ] Configurar middleware para servir la carpeta `public/` de forma estática.
  4. [ ] Configurar middleware para parsear JSON y manejar cabeceras CORS de forma segura.
- **Estado**: `[x] completado`

---

### Subtarea 4: Base de Datos Local y Modelos (SQLite)
- **Intención**: Crear un almacenamiento robusto, local y de cero configuración para el registro de los chicos.
- **Resultados Esperados**: Un archivo auto-inicializado `database.sqlite` que almacene de forma segura usuarios y progresos.
- **Lista de Tareas**:
  1. [ ] Crear `database.js` para inicializar y conectar con SQLite.
  2. [ ] Definir el esquema de la tabla de usuarios: `id`, `username`, `password` (hash seguro con bcrypt), `created_at`.
  3. [ ] Definir el esquema de la tabla de progreso: `user_id` (clave foránea), `stars` (estrellas acumuladas), `score` (puntos), `completed_sections` (datos serializados en JSON con misiones realizadas), `updated_at`.
  4. [ ] Escribir funciones auxiliares de base de datos para registrar, autenticar, actualizar progreso y recuperar ranking/puntuaciones de manera limpia.
- **Estado**: `[x] completado`

---

### Subtarea 5: Endpoints de API y Autenticación (JWT / Sessions)
- **Intención**: Conectar el frontend con el backend de manera segura mediante endpoints HTTP de login, registro, guardado y carga de datos.
- **Resultados Esperados**: Rutas de API operativas y probadas para autenticación y guardado de partidas.
- **Lista de Tareas**:
  1. [ ] Implementar la ruta `/api/register` (crea usuario y hashea contraseña).
  2. [ ] Implementar la ruta `/api/login` (verifica contraseña y genera un Token JWT o cookie de sesión).
  3. [ ] Implementar la ruta protegida `/api/progress` (GET para recuperar progreso y POST para guardarlo).
  4. [ ] Implementar la ruta `/api/leaderboard` (GET para mostrar el ranking de chicos del aula/familia con más estrellas).
- **Estado**: `[x] completado`

---

### Subtarea 6: Integración del Frontend con la API
- **Intención**: Modificar el código de JavaScript del frontend para que las misiones guarden el progreso en el servidor en tiempo real en lugar de sólo en variables volátiles de memoria o localStorage.
- **Resultados Esperados**:
  - Pantallas de Login/Registro integradas en el flujo del menú principal del juego.
  - Sincronización automática de estrellas y logros con la cuenta del usuario al finalizar cada misión.
- **Lista de Tareas**:
  1. [ ] Diseñar visualmente un formulario de Login/Registro estilizado al estilo Minecraft dentro del menú inicial del juego.
  2. [ ] Escribir la lógica de fetch en `app.js` para realizar llamadas a `/api/login` y `/api/register`.
  3. [ ] Al iniciar sesión con éxito, cargar el progreso guardado y poblar las estrellas y estado de misiones del jugador.
  4. [ ] Modificar la función `finishSection` y `updateProgress` de la app para que envíen un POST a `/api/progress` guardando el nuevo estado de estrellas y misiones.
  5. [ ] Mostrar un componente de "Ranking de Héroes" (Leaderboard) en el menú principal para fomentar el aprendizaje competitivo sano.
- **Estado**: `[x] completado`

---

### Subtarea 7: Automatización, Distribución y Re-empaquetado ZIP
- **Intención**: Proveer una forma extremadamente sencilla de ejecutar la aplicación con un solo clic y empaquetar el entregable final.
- **Resultados Esperados**: Un paquete ZIP listo para usar que inicia la app automáticamente y abre el navegador del usuario.
- **Lista de Tareas**:
  1. [ ] Añadir dependencias como `open` (abre el navegador automáticamente al iniciar) en el `package.json`.
  2. [ ] Crear comandos de inicio en el `package.json` (<code class="code">"start": "node server.js"</code>).
  3. [ ] Asegurar que al levantar el servidor se lance automáticamente la pestaña en el navegador en `http://localhost:3000`.
  4. [ ] Crear un archivo comprimido `estudio-kids-app.zip` con la nueva estructura limpia, excluyendo archivos innecesarios (como `node_modules` para que el zip sea ultra liviano y rápido de descomprimir, proveyendo instrucciones para el primer arranque con `npm install && npm start`).
- **Estado**: `[x] completado`
