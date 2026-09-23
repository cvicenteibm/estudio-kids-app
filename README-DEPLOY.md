# ⚔️ Estudio Kids — Guía de Deploy

## Requisitos
- Node.js 18+
- Cuenta en [Railway](https://railway.app) (recomendado) o [Render](https://render.com)

---

## 🚀 Deploy en Railway (recomendado)

### Paso 1 — Subir código a GitHub
```bash
cd estudio-kids-app
git init
git add .
git commit -m "Initial commit — Estudio Kids App"
# Crear repo en github.com y luego:
git remote add origin https://github.com/TU_USUARIO/estudio-kids-app.git
git push -u origin main
```

### Paso 2 — Crear proyecto en Railway
1. Ir a [railway.app](https://railway.app) → **New Project**
2. Seleccionar **Deploy from GitHub repo**
3. Elegir el repositorio `estudio-kids-app`
4. Railway detecta automáticamente el `package.json` y ejecuta `npm start`

### Paso 3 — Agregar volumen persistente para SQLite
1. En el panel del servicio → **+ Add Volume**
2. Mount Path: `/data`
3. Hacer click en **Deploy**

### Paso 4 — Configurar variables de entorno
En el panel del servicio → **Variables**, agregar:

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Una clave larga aleatoria (ver abajo) |
| `DATA_DIR` | `/data` |

**Generar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Paso 5 — Obtener la URL pública
Railway asigna automáticamente una URL tipo `https://estudio-kids-app-xxxx.railway.app`

---

## 🔄 Deploy en Render

### Paso 1 — Crear cuenta y nuevo Web Service
1. Ir a [render.com](https://render.com) → **New → Web Service**
2. Conectar el repositorio de GitHub
3. Configurar:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Starter ($7/mes, necesario para disco persistente)

### Paso 2 — Agregar disco persistente
1. En el servicio → **Disks → Add Disk**
2. Mount Path: `/data`
3. Size: 1 GB

### Paso 3 — Variables de entorno
Igual que Railway (ver tabla arriba).

---

## 💻 Desarrollo local

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus valores (JWT_SECRET al menos)

# Iniciar servidor
npm start
# → Abre automáticamente http://localhost:3000
```

---

## 📁 Estructura de variables de entorno

| Variable | Local | Producción |
|---|---|---|
| `PORT` | `3000` | Seteado automáticamente |
| `NODE_ENV` | vacío | `production` |
| `JWT_SECRET` | cualquier string | Clave larga y aleatoria |
| `DATA_DIR` | vacío (usa carpeta del proyecto) | `/data` (volumen persistente) |

---

## ⚠️ Importante sobre SQLite en producción

- La base de datos se guarda en `$DATA_DIR/database.sqlite`
- **Sin volumen persistente**, los datos se borran con cada deploy
- Siempre configurar `DATA_DIR` apuntando al volumen montado
- Para backups: descargar el archivo `.sqlite` periódicamente desde el panel de la plataforma
