const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Cargar .env en desarrollo local (no hace nada si no existe el archivo)
try { require('dotenv').config(); } catch (_) {}

// Importar la base de datos SQLite
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// JWT_SECRET DEBE definirse en variables de entorno en producción
const JWT_SECRET = process.env.JWT_SECRET || 'estudio_kids_overworld_key_99_local';
if (IS_PROD && !process.env.JWT_SECRET) {
  console.warn('⚠️  ADVERTENCIA: JWT_SECRET no está definido como variable de entorno. Usando clave por defecto (inseguro en producción).');
}

// Configurar middlewares
app.use(cors());
app.use(express.json());

// Servir la carpeta 'public' que contiene nuestro frontend modularizado
app.use(express.static(path.join(__dirname, 'public')));


/* ══════════════════════════════════════════════════════════
   MIDDLEWARE DE AUTENTICACIÓN JWT
══════════════════════════════════════════════════════════ */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token de sesión requerido.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Sesión expirada o inválida.' });
    req.user = user;
    next();
  });
}


/* ══════════════════════════════════════════════════════════
   RUTAS DE LA API DE AUTENTICACIÓN Y PERFILES
══════════════════════════════════════════════════════════ */

// 1. Obtener todos los perfiles de usuarios locales (pantalla de bienvenida)
app.get('/api/users', (req, res) => {
  const sql = `
    SELECT u.id, u.username, u.avatar, u.coins, u.inventory, u.streak_days, u.last_login_date, p.stars, p.score, p.completed_sections, p.subject_stats, p.session_history
    FROM users u
    LEFT JOIN progress p ON u.id = p.user_id
    ORDER BY u.username ASC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener usuarios: ' + err.message });
    }
    const parsedRows = rows.map(r => ({
      ...r,
      inventory: r.inventory ? JSON.parse(r.inventory) : [],
      completed_sections: r.completed_sections ? JSON.parse(r.completed_sections) : {},
      subject_stats: r.subject_stats ? JSON.parse(r.subject_stats) : {},
      session_history: r.session_history ? JSON.parse(r.session_history) : []
    }));
    res.json(parsedRows);
  });
});

// 2. Registrar un nuevo usuario (héroe)
app.post('/api/register', (req, res) => {
  const { username, pin, avatar } = req.body;

  if (!username || !pin) {
    return res.status(400).json({ error: 'Se requiere nombre de usuario y PIN.' });
  }

  // Comprobar PIN numérico básico (ej. 4 dígitos)
  if (pin.length < 4) {
    return res.status(400).json({ error: 'El PIN debe tener al menos 4 dígitos.' });
  }

  // Hashear el PIN del usuario para guardarlo de manera profesional y segura
  const hashedPin = bcrypt.hashSync(pin, 10);
  const userAvatar = avatar || '🧒';

  const insertUserSql = `INSERT INTO users (username, pin, avatar) VALUES (?, ?, ?)`;
  
  db.run(insertUserSql, [username, hashedPin, userAvatar], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: '¡Ese nombre de Héroe ya está registrado! Elige otro.' });
      }
      return res.status(500).json({ error: 'Error al registrar usuario: ' + err.message });
    }

    const userId = this.lastID;

    // Inicializar el progreso de este héroe con 0 estrellas
    const todayStr = new Date().toISOString().slice(0,10);
    const initProgressSql = `INSERT INTO progress (user_id, stars, score, completed_sections, subject_stats, session_history) VALUES (?, 0, 0, '{}', '{}', '[]')`;
    
    db.run(initProgressSql, [userId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al inicializar progreso: ' + err.message });
      }

      db.run(`UPDATE users SET streak_days = 1, last_login_date = ? WHERE id = ?`, [todayStr, userId]);

      // Generar token JWT automático para iniciar sesión de una vez
      const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '30d' });

      res.status(201).json({
        message: '¡Héroe registrado con éxito!',
        token,
        user: {
          id: userId,
          username,
          avatar: userAvatar,
          coins: 0,
          inventory: [],
          streak_days: 1,
          last_login_date: todayStr,
          stars: 0,
          score: 0,
          completed_sections: {},
          subject_stats: {},
          session_history: []
        }
      });
    });
  });
});

// 3. Iniciar sesión de usuario con PIN
app.post('/api/login', (req, res) => {
  const { username, pin } = req.body;

  if (!username || !pin) {
    return res.status(400).json({ error: 'Se requiere nombre de usuario y PIN.' });
  }

  const sql = `
    SELECT u.id, u.username, u.pin, u.avatar, u.coins, u.inventory, u.streak_days, u.last_login_date, p.stars, p.score, p.completed_sections, p.subject_stats, p.session_history
    FROM users u
    LEFT JOIN progress p ON u.id = p.user_id
    WHERE u.username = ?
  `;

  db.get(sql, [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Error al iniciar sesión: ' + err.message });
    }

    if (!user) {
      return res.status(400).json({ error: '¡Este Héroe no existe! Registrate primero.' });
    }

    // Verificar el PIN encriptado usando bcryptjs
    const isPinValid = bcrypt.compareSync(pin, user.pin);
    if (!isPinValid) {
      return res.status(400).json({ error: '¡PIN incorrecto! Intentá de nuevo.' });
    }

    // Calcular racha de días consecutivos
    const today = new Date();
    const todayStr = today.toISOString().slice(0,10);
    let newStreak = user.streak_days || 0;
    
    if (user.last_login_date) {
      const lastDate = new Date(user.last_login_date);
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    db.run(`UPDATE users SET streak_days = ?, last_login_date = ? WHERE id = ?`, [newStreak, todayStr, user.id]);

    // Generar Token JWT firmado
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      message: '¡Bienvenido de vuelta, Héroe!',
      token,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        coins: user.coins || 0,
        inventory: user.inventory ? JSON.parse(user.inventory) : [],
        streak_days: newStreak,
        last_login_date: todayStr,
        stars: user.stars || 0,
        score: user.score || 0,
        completed_sections: user.completed_sections ? JSON.parse(user.completed_sections) : {},
        subject_stats: user.subject_stats ? JSON.parse(user.subject_stats) : {},
        session_history: user.session_history ? JSON.parse(user.session_history) : []
      }
    });
  });
});

// 4. Eliminar perfil de usuario
app.post('/api/users/delete', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Se requiere la ID del usuario.' });

  const sql = `DELETE FROM users WHERE id = ?`;
  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar usuario: ' + err.message });
    }
    res.json({ message: 'Perfil eliminado con éxito.' });
  });
});


/* ══════════════════════════════════════════════════════════
   RUTAS DE LA API DE PROGRESO Y RANKING (PROTEGIDAS)
══════════════════════════════════════════════════════════ */

// 5. Cargar el progreso de la sesión actual
app.get('/api/progress', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT p.stars, p.score, p.completed_sections, p.subject_stats, p.session_history, u.coins, u.avatar, u.inventory, u.streak_days
    FROM progress p
    JOIN users u ON u.id = p.user_id
    WHERE p.user_id = ?
  `;

  db.get(sql, [userId], (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error al cargar progreso: ' + err.message });
    }
    if (!data) {
      return res.status(404).json({ error: 'No se encontró progreso para este usuario.' });
    }

    res.json({
      stars: data.stars,
      score: data.score,
      coins: data.coins || 0,
      avatar: data.avatar,
      inventory: data.inventory ? JSON.parse(data.inventory) : [],
      streak_days: data.streak_days || 0,
      completed_sections: data.completed_sections ? JSON.parse(data.completed_sections) : {},
      subject_stats: data.subject_stats ? JSON.parse(data.subject_stats) : {},
      session_history: data.session_history ? JSON.parse(data.session_history) : []
    });
  });
});

// 6. Guardar/Actualizar el progreso obtenido al finalizar ejercicios o misiones
app.post('/api/progress', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { stars, score, coins, completed_sections, subject_stats, session_history, avatar, inventory } = req.body;

  const completedSectionsStr = JSON.stringify(completed_sections || {});
  const subjectStatsStr = JSON.stringify(subject_stats || {});
  const sessionHistoryStr = JSON.stringify(session_history || []);

  const updateProgressSql = `
    UPDATE progress
    SET stars = ?, score = ?, completed_sections = ?, subject_stats = ?, session_history = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `;

  db.run(updateProgressSql, [stars || 0, score || 0, completedSectionsStr, subjectStatsStr, sessionHistoryStr, userId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Error al guardar progreso: ' + err.message });
    }

    // Si también se actualizan monedas, avatar o inventario del usuario
    if (coins !== undefined || avatar !== undefined || inventory !== undefined) {
      let userUpdateFields = [];
      let params = [];
      if (coins !== undefined) { userUpdateFields.push('coins = ?'); params.push(coins); }
      if (avatar !== undefined) { userUpdateFields.push('avatar = ?'); params.push(avatar); }
      if (inventory !== undefined) { userUpdateFields.push('inventory = ?'); params.push(JSON.stringify(inventory)); }
      
      params.push(userId);
      const userUpdateSql = `UPDATE users SET ${userUpdateFields.join(', ')} WHERE id = ?`;
      db.run(userUpdateSql, params, (uErr) => {
        if (uErr) console.error('Error al actualizar usuario:', uErr);
        res.json({ message: '¡Partida e inventario guardados con éxito!' });
      });
    } else {
      res.json({ message: '¡Partida guardada con éxito en la nube local!' });
    }
  });
});

// 7. Endpoint para comprar en la tienda de avatares / skins
app.post('/api/shop/buy', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { itemId, itemPrice, itemEmoji, itemType } = req.body;

  db.get(`SELECT coins, inventory, avatar FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err || !user) return res.status(500).json({ error: 'Error al consultar usuario.' });

    const coins = user.coins || 0;
    const inventory = user.inventory ? JSON.parse(user.inventory) : [];

    if (inventory.includes(itemId)) {
      // Ya lo tiene, equiparlo
      db.run(`UPDATE users SET avatar = ? WHERE id = ?`, [itemEmoji, userId], () => {
        res.json({ success: true, message: '¡Avatar equipado con éxito!', avatar: itemEmoji, coins, inventory });
      });
      return;
    }

    if (coins < itemPrice) {
      return res.status(400).json({ error: '¡No tenés suficientes monedas voxel!' });
    }

    const newCoins = coins - itemPrice;
    inventory.push(itemId);

    db.run(`UPDATE users SET coins = ?, inventory = ?, avatar = ? WHERE id = ?`,
      [newCoins, JSON.stringify(inventory), itemEmoji, userId],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ error: 'Error al procesar compra.' });
        res.json({
          success: true,
          message: '¡Comprado y equipado con éxito!',
          coins: newCoins,
          inventory,
          avatar: itemEmoji
        });
      }
    );
  });
});

// 7. Tabla de clasificación (Leaderboard general de todos los chicos)
app.get('/api/leaderboard', (req, res) => {
  const sql = `
    SELECT u.username, u.avatar, p.stars, p.score
    FROM users u
    JOIN progress p ON u.id = p.user_id
    ORDER BY p.stars DESC, p.score DESC
    LIMIT 15
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener leaderboard: ' + err.message });
    }
    res.json(rows);
  });
});


// Health-check endpoint — debe ir ANTES del wildcard
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Ruta comodín para que cualquier petición de página cargue el index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciamos el servidor
app.listen(PORT, async () => {
  console.log(`================══════════════════════════════════`);
  console.log(`  ⚔️ ¡SERVIDOR DE ESTUDIO KIDS INICIADO CON ÉXITO!`);
  console.log(`  🌍 Escuchando en puerto: ${PORT}`);
  console.log(`  🌐 Entorno: ${IS_PROD ? 'PRODUCCIÓN' : 'local'}`);
  console.log(`================══════════════════════════════════`);

  // Abrir el navegador solo en entorno local
  if (!IS_PROD) {
    try {
      const { default: open } = await import('open');
      await open(`http://localhost:${PORT}`);
      console.log(`🚀 Navegador abierto en http://localhost:${PORT}`);
    } catch (_) {
      console.log(`💡 Abrí tu navegador en http://localhost:${PORT}`);
    }
  }
});
