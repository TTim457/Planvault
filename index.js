require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');


const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3001' }));


/* -------------------------------------------------- */

// 🚀 Serverstart
app.listen(port, () => {
  console.log(`✅ Server läuft unter http://localhost:${port}`);
});

/* -------------------------------------------------- */

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// 📦 PostgreSQL-Verbindung
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// 📁 Upload-Verzeichnis prüfen/erstellen
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 📸 Multer Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

/* -------------------------------------------------- */

// 🔐 Admin-Login
app.post('/admin/login', express.json(), async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'E-Mail und Passwort erforderlich' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Admin nicht gefunden' });
    }

    const admin = result.rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);

    if (!valid) {
      return res.status(401).json({ success: false, error: 'Falsches Passwort' });
    }

    res.json({ success: true, adminId: admin.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Login-Fehler' });
  }
});


/* -------------------------------------------------- */

// 🆕 Admin-Registrierung (Setup)
app.post('/admin/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'E-Mail und Passwort sind erforderlich' });
  }

  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      'INSERT INTO admins (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
      [email, hash, 'admin'] // Standardrolle 'admin'
    );

    res.json({ success: true, adminId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Fehler bei der Registrierung' });
  }
});

/* -------------------------------------------------- */

// 📤 Foto hochladen
app.post('/admin/upload', upload.single('photo'), async (req, res) => {
  const { galleryId, title } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No photo uploaded' });
  }

  const filename = req.file.filename;
  const fileUrl = `http://localhost:${port}/uploads/${filename}`; // Zugänglicher Pfad zur Datei

  try {
    const result = await pool.query(
      `INSERT INTO photos (gallery_id, filename, file_url, title)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [galleryId, filename, fileUrl, title]
    );

    res.status(201).json({
      success: true,
      photo: result.rows[0],
      message: '📸 Foto erfolgreich hochgeladen!'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Fehler beim Hochladen' });
  }
});

// 🗂️ Admin: Neue Galerie erstellen
app.post('/admin/galleries', async (req, res) => {
  const { user_id, title } = req.body;
  if (!user_id || !title) {
    return res.status(400).json({ success: false, error: 'User ID und Titel erforderlich' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO galleries (user_id, title, created_at)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [user_id, title]
    );
    res.status(201).json({ success: true, gallery: result.rows[0] });
  } catch (err) {
    console.error('Fehler bei POST /admin/galleries:', err);
    res.status(500).json({ success: false, error: 'Fehler beim Erstellen der Galerie' });
  }
});


/* -------------------------------------------------- */

// 📊 Admin Dashboard: Statistiken abrufen
app.get('/admin/stats', async (req, res) => {
  try {
    const users     = await pool.query('SELECT COUNT(*) FROM users');
    const photos    = await pool.query('SELECT COUNT(*) FROM photos');
    const downloads = await pool.query('SELECT COUNT(*) FROM downloads');
    const payments  = await pool.query('SELECT COUNT(*) FROM payments');
    const galleries = await pool.query('SELECT COUNT(*) FROM galleries');

    res.json({
      success: true,
      stats: {
        users:     parseInt(users.rows[0].count),
        photos:    parseInt(photos.rows[0].count),
        downloads: parseInt(downloads.rows[0].count),
        payments:  parseInt(payments.rows[0].count),
        galleries: parseInt(galleries.rows[0].count)
      }
    });
  } catch (err) {
    console.error('Fehler bei /admin/stats:', err);
    res.status(500).json({ success: false, error: 'Fehler beim Abrufen der Statistiken' });
  }
});

/* -------------------------------------------------- */

// 👥 Admin: Benutzerübersicht
app.get('/admin/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      users: result.rows
    });
  } catch (err) {
    console.error('Fehler bei /admin/users:', err);
    res.status(500).json({ success: false, error: 'Fehler beim Abrufen der Benutzer' });
  }
});

// 📸 Admin: Fotos Übersicht
app.get('/admin/photos', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, gallery_id, filename, file_url, title
       FROM photos
       ORDER BY id DESC`
    );

    res.json({
      success: true,
      photos: result.rows
    });
  } catch (err) {
    console.error('Fehler bei /admin/photos:', err);
    res.status(500).json({ success: false, error: 'Fehler beim Abrufen der Fotos' });
  }
});

// 📥 Admin: Downloads Übersicht
app.get('/admin/downloads', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         user_id,
         photo_id,
         downloaded_at,
         bezahlt,
         purchase_type
       FROM downloads
       ORDER BY downloaded_at DESC`
    );

    res.json({
      success: true,
      downloads: result.rows
    });
  } catch (err) {
    console.error('Fehler bei /admin/downloads:', err);
    res.status(500).json({ success: false, error: 'Fehler beim Abrufen der Downloads' });
  }
});

// 💰 Admin: Zahlungen Übersicht
app.get('/admin/payments', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         user_id,
         photo_id,
         photo_ids,
         amount,
         purchase_type,
         payment_provider,
         payment_status,
         paid_at
       FROM payments
       ORDER BY id ASC`
    );
    res.json({ success: true, payments: result.rows });
  } catch (error) {
    console.error('Fehler bei /admin/payments:', error);
    res.status(500).json({ success: false, error: 'Fehler beim Laden der Zahlungen' });
  }
});


// 🗂️ Admin: Galerien Übersicht
app.get('/admin/galleries', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, user_id, title, created_at FROM galleries ORDER BY id ASC'
    );
    res.json({ success: true, galleries: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Fehler beim Laden der Galerien' });
  }
});

/* -------------------------------------------------- */
// 👥 Admin: Benutzer bearbeiten & löschen
app.put('/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email } = req.body;
  try {
    await pool.query(
      `UPDATE users SET first_name=$1, last_name=$2, email=$3 WHERE id=$4`,
      [first_name, last_name, email, id]
    );
    res.json({ success: true, message: 'Benutzer aktualisiert' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Fehler beim Update' });
  }
});
app.delete('/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM users WHERE id=$1`, [id]);
    res.json({ success: true, message: 'Benutzer gelöscht' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Fehler beim Löschen' });
  }
});

/* -------------------------------------------------- */
// 📸 Admin: Foto bearbeiten & löschen
app.put('/admin/photos/:id', async (req, res) => {
  const { id } = req.params;
  const { gallery_id, title, filename, file_url } = req.body;
  try {
    await pool.query(
      `UPDATE photos SET gallery_id=$1, title=$2, filename=$3, file_url=$4 WHERE id=$5`,
      [gallery_id, title, filename, file_url, id]
    );
    res.json({ success: true, message: 'Foto aktualisiert' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Fehler beim Update' });
  }
});
app.delete('/admin/photos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM photos WHERE id=$1`, [id]);
    res.json({ success: true, message: 'Foto gelöscht' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Fehler beim Löschen' });
  }
});

/* -------------------------------------------------- */
// 📥 Admin: Download-Eintrag bearbeiten & löschen
app.put('/admin/downloads/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, photo_id, bezahlt } = req.body;
  try {
    await pool.query(
      `UPDATE downloads SET user_id=$1, photo_id=$2, bezahlt=$3 WHERE id=$4`,
      [user_id, photo_id, bezahlt, id]
    );
    res.json({ success: true, message: 'Download-Eintrag aktualisiert' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Fehler beim Update' });
  }
});
app.delete('/admin/downloads/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM downloads WHERE id=$1`, [id]);
    res.json({ success: true, message: 'Download-Eintrag gelöscht' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Fehler beim Löschen' });
  }
});

/* -------------------------------------------------- */
// 💰 Admin: Zahlung bearbeiten & löschen
app.put('/admin/payments/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, photo_id, amount, payment_provider, payment_status } = req.body;
  try {
    await pool.query(
      `UPDATE payments
         SET user_id=$1, photo_id=$2, amount=$3, payment_provider=$4, payment_status=$5
       WHERE id=$6`,
      [user_id, photo_id, amount, payment_provider, payment_status, id]
    );
    res.json({ success: true, message: 'Payment aktualisiert' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Fehler beim Update' });
  }
});
app.delete('/admin/payments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM payments WHERE id=$1`, [id]);
    res.json({ success: true, message: 'Payment gelöscht' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Fehler beim Löschen' });
  }
});

/* -------------------------------------------------- */
// 🗂️ Admin: Galerie bearbeiten & löschen
app.put('/admin/galleries/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, title } = req.body;
  try {
    await pool.query(
      `UPDATE galleries SET user_id=$1, title=$2 WHERE id=$3`,
      [user_id, title, id]
    );
    res.json({ success: true, message: 'Gallery aktualisiert' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Fehler beim Update' });
  }
});
app.delete('/admin/galleries/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM galleries WHERE id=$1`, [id]);
    res.json({ success: true, message: 'Gallery gelöscht' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Fehler beim Löschen' });
  }
});


/* -------------------------------------------------- */

// 📥 Erweiterte Download-Logik mit Bezahlprüfung (gefixt)

app.get('/download/:photoId', authMiddleware, async (req, res) => {
  const { photoId } = req.params;
  const userId = req.user.id;

  try {
    // 1️⃣ Datei gehört dem User?
    const photoRes = await pool.query(`
      SELECT p.filename
      FROM photos p
      JOIN galleries g ON p.gallery_id = g.id
      WHERE p.id = $1 AND g.user_id = $2
    `, [photoId, userId]);
    if (!photoRes.rows.length) {
      return res.status(403).json({ success: false, message: 'Kein Zugriff auf dieses Foto' });
    }
    const filename = photoRes.rows[0].filename;

    // 📂 Upload-Verzeichnis + Dateipfad berechnen
    const uploadDir = path.resolve(__dirname, 'uploads');
    const filePath = path.join(uploadDir, filename);

    // 2️⃣ Existenz & Sicherheit checken
    console.log('🔎 Erwarteter Upload-Ordner:', uploadDir);
    console.log('🔎 Gesuchter Datei-Pfad:', filePath);

    const relative = path.relative(uploadDir, filePath);
    if (relative.startsWith('..') || !fs.existsSync(filePath)) {
      console.error('❌ Datei existiert nicht oder liegt außerhalb des Upload-Ordners!');
      return res.status(404).json({ success: false, message: 'Datei nicht gefunden' });
    }

    // 3️⃣ Zähle Downloads & Payments
    const dlCountRes = await pool.query(
      `SELECT COUNT(*) AS cnt FROM downloads WHERE user_id=$1 AND photo_id=$2`,
      [userId, photoId]
    );
    const payCountRes = await pool.query(
      `SELECT COUNT(*) AS cnt FROM payments WHERE user_id=$1 AND photo_id=$2 AND payment_status='paid'`,
      [userId, photoId]
    );
    const usedDownloads = parseInt(dlCountRes.rows[0].cnt, 10);
    const paidCount    = parseInt(payCountRes.rows[0].cnt, 10);

    console.log(`📊 usedDownloads=${usedDownloads}, paidCount=${paidCount}`);

   // 4️⃣ Kostenloser erster Download?
if (usedDownloads === 0) {
  await pool.query(
    `INSERT INTO downloads
       (user_id, photo_id, bezahlt, downloaded_at, purchase_type)
     VALUES ($1, $2, false, NOW(), 'single')`,
    [userId, photoId]
  );
  return res.download(filename, filename, { root: uploadDir }, err => {
    if (err) console.error('Download-Error:', err);
  });
}

// 5️⃣ Bezahlte Downloads erlauben (pro Zahlung 1 Download)
if (usedDownloads < paidCount + 1) {
  await pool.query(
    `INSERT INTO downloads
       (user_id, photo_id, bezahlt, downloaded_at, purchase_type)
     VALUES ($1, $2, true, NOW(), 'single')`,
    [userId, photoId]
  );
  return res.download(filename, filename, { root: uploadDir }, err => {
    if (err) console.error('Bezahlter Download-Error:', err);
  });
}


    // 6️⃣ Kein Guthaben mehr
    return res.status(403).json({
      success: false,
      message: 'Du musst zuerst bezahlen, um erneut herunterzuladen.',
      kostenpflichtig: true,
      alreadyPaidButUsed: true
    });

  } catch (err) {
    console.error('Interner Download-Fehler:', err);
    return res.status(500).json({ success: false, message: 'Server-Fehler beim Download' });
  }
});


/* -------------------------------------------------- */

const archiver = require('archiver');

// ── Bulk-Download & Logbuch ──────────────────────────────────────────
app.post('/download/bulk', authMiddleware, express.json(), async (req, res) => {
  const { photoIds } = req.body;
  const userId       = req.user.id;

  if (!Array.isArray(photoIds) || photoIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Keine Fotos ausgewählt' });
  }

  try {
    // 1) Ownership-Check: nur Deine Galerie-Fotos
    const { rows: valid } = await pool.query(
      `SELECT p.id, p.filename
         FROM photos p
         JOIN galleries g ON p.gallery_id = g.id
        WHERE g.user_id = $1
          AND p.id = ANY($2::int[])`,
      [userId, photoIds]
    );
    if (valid.length === 0) {
      return res.status(403).json({ success: false, message: 'Keine Zugriffsrechte' });
    }

    // 2) Downloads protokollieren (je Foto ein Eintrag)
    await pool.query(
      `INSERT INTO downloads
         (user_id, photo_id, bezahlt, downloaded_at, purchase_type)
       SELECT
         $1,             -- user_id
         unnest($2::int[]), -- photo_id
         TRUE,           -- bezahlt (bulk-Download zählt als bezahlt)
         NOW(),          -- downloaded_at
         'bulk'          -- purchase_type
      `,
      [userId, valid.map(r => r.id)]
    );

    // 3) ZIP-Stream aufbauen
    res.attachment('bulk_download.zip');
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);
    valid.forEach(photo => {
      const filePath = path.join(uploadDir, photo.filename);
      archive.file(filePath, { name: photo.filename });
    });
    await archive.finalize();

  } catch (err) {
    console.error('Bulk-Download-Error:', err);
    res.status(500).json({ success: false, message: 'Bulk-Download fehlgeschlagen' });
  }
});




/* -------------------------------------------------- */

// ── Bulk-Kauf ───────────────────────────────────────────
app.post('/purchase/bulk', authMiddleware, express.json(), async (req, res) => {
  const { photoIds } = req.body;            // Array von Photo-IDs
  const userId       = req.user.id;
  const pricePer     = 1.99;

  if (!Array.isArray(photoIds) || photoIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Keine Fotos ausgewählt' });
  }

  // Gesamtbetrag
  const total = parseFloat((photoIds.length * pricePer).toFixed(2));

  try {
    // Einen einzigen Eintrag in payments
    const result = await pool.query(
      `INSERT INTO payments
         (user_id,      photo_ids,         amount,       payment_provider, purchase_type, payment_status, paid_at)
       VALUES
         ($1,           $2::int[],         $3,          'manual',         'bulk',        'paid',         NOW())
       RETURNING id`,
      [ userId, photoIds, total ]
    );

    res.json({ success: true, message: 'Bulk-Kauf erfolgreich', paymentId: result.rows[0].id });
  } catch (err) {
    console.error('Bulk Purchase Error:', err);
    res.status(500).json({ success: false, message: 'Bulk-Kauf fehlgeschlagen' });
  }
});

// ── Einzel-Kauf ─────────────────────────────────────────
app.post('/purchase/:photoId', authMiddleware, async (req, res) => {
  const { photoId } = req.params;
  const userId      = req.user.id;
  const amount      = 1.99;

  try {
    // 1) Ownership-Check
    const photoRes = await pool.query(`
      SELECT p.filename
      FROM photos p
      JOIN galleries g ON p.gallery_id = g.id
      WHERE p.id = $1 AND g.user_id = $2
    `, [ photoId, userId ]);

    if (!photoRes.rows.length) {
      return res.status(403).json({ success:false, message:'Kein Zugriff auf dieses Foto' });
    }

    // 2) Einen einzigen Eintrag in payments
    await pool.query(`
      INSERT INTO payments
        (user_id, photo_id, amount, payment_provider, purchase_type, payment_status, paid_at)
      VALUES
        ($1,      $2,       $3,     'manual',         'single',     'paid',         NOW())
    `, [ userId, photoId, amount ]);

    res.json({ success:true, message:'Einzel-Kauf erfolgreich' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, error:'Fehler beim Kauf' });
  }
});



/* -------------------------------------------------- */

// user Register


app.post('/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body || {};


  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Bitte alle Felder ausfüllen' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email',
      [first_name, last_name, email, hash]
    );

    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Fehler bei der Registrierung' });
  }
});


/* -------------------------------------------------- */

// user Login

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Benutzer anhand der E-Mail finden
    const userResult = await pool.query(
      'SELECT id, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Ungültige Anmeldedaten' });
    }

    const user = userResult.rows[0];

    // Passwort vergleichen
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Ungültige Anmeldedaten' });
    }

    // JWT generieren mit der ID aus der Datenbank
    const token = jwt.sign(
      { userId: user.id, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Login fehlgeschlagen' });
  }
});

/* -------------------------------------------------- */

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'Kein Token gesendet' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Hier wird die Struktur gesetzt, die die Route erwartet:
    req.user = { id: decoded.userId };

    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Ungültiger Token' });
  }
}

/* -------------------------------------------------- */

app.get('/me', authMiddleware, (req, res) => {
  const userId = req.user.id;

  pool.query('SELECT id, first_name, last_name, email FROM users WHERE id = $1', [userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Fehler beim Abrufen der Benutzerdaten' });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    res.json({ user: result.rows[0] });
  });
});

/* -------------------------------------------------- */

// 🔹 Dashboard-Daten: Gekaufte Pläne + letzter Download
app.get('/dashboard-data', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const purchases = await pool.query(`
      SELECT p.photo_id, ph.title, ph.filename, p.paid_at
      FROM payments p
      JOIN photos ph ON p.photo_id = ph.id
      WHERE p.user_id = $1 AND p.payment_status = 'paid'
      ORDER BY p.paid_at DESC
    `, [userId]);

    const lastDownload = await pool.query(`
      SELECT d.photo_id, ph.title, d.downloaded_at
      FROM downloads d
      JOIN photos ph ON d.photo_id = ph.id
      WHERE d.user_id = $1
      ORDER BY d.downloaded_at DESC
      LIMIT 1
    `, [userId]);

    res.json({
      purchases: purchases.rows,
      lastDownload: lastDownload.rows[0] || null
    });

  } catch (err) {
    console.error('Fehler beim Abrufen der Dashboard-Daten:', err);
    res.status(500).json({ success: false, message: 'Fehler beim Abrufen der Dashboard-Daten' });
  }
});

/* -------------------------------------------------- */

// 👥 Eigene Galerien abrufen
app.get('/my-galleries', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT id, title, created_at
       FROM galleries
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fehler bei /my-galleries:', err);
    res.status(500).json({ message: 'Fehler beim Abrufen der Galerien' });
  }
});

/* -------------------------------------------------- */

// 📸 Eigene Fotos abrufen (nur aus Galerien des Users)
app.get('/my-photos', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(`
      SELECT 
        photos.id,
        photos.gallery_id, 
        photos.title, 
        photos.file_url, 
        photos.uploaded_at, 
        photos.filename,
        COALESCE(
          (SELECT COUNT(*) FROM payments 
           WHERE user_id = $1 
             AND photo_id = photos.id 
             AND payment_status = 'paid'), 
          0
        ) > 0 AS paid
      FROM photos
      JOIN galleries ON photos.gallery_id = galleries.id
      WHERE galleries.user_id = $1
      ORDER BY photos.uploaded_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der eigenen Fotos:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Fotos' });
  }
});


/* -------------------------------------------------- */

// ★★ Settings Endpoints ★★

/**
 * GET /settings
 * Holt den aktuellen 2FA- und E-Mail-Notif-Status
 */
app.get('/settings', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT two_fa_enabled, email_notifications_enabled
       FROM users
       WHERE id = $1`,
      [userId]
    );
    const row = result.rows[0] || {};
    res.json({
      twoFA: Boolean(row.two_fa_enabled),
      emailNotifications: Boolean(row.email_notifications_enabled)
    });
  } catch (err) {
    console.error('Fehler bei GET /settings:', err);
    res.status(500).json({ success: false, error: 'Fehler beim Laden der Einstellungen' });
  }
});

/**
 * PUT /settings/profile
 * Speichert Vorname, Nachname und E-Mail
 */
app.put('/settings/profile', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { first_name, last_name, email } = req.body;
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ success: false, error: 'Alle Felder sind erforderlich' });
  }
  try {
    await pool.query(
      `UPDATE users
         SET first_name = $1,
             last_name  = $2,
             email      = $3
       WHERE id = $4`,
      [first_name, last_name, email, userId]
    );
    res.json({ success: true, message: 'Profil aktualisiert' });
  } catch (err) {
    console.error('Fehler bei PUT /settings/profile:', err);
    res.status(500).json({ success: false, error: 'Fehler beim Speichern des Profils' });
  }
});

/**
 * POST /settings/change-password
 * Altes Passwort prüfen und auf neues ändern
 * Body: { oldPw, newPw }
 */
app.post('/settings/change-password', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { oldPw, newPw } = req.body;
  if (!oldPw || !newPw) {
    return res.status(400).json({ success: false, error: 'Altes und neues Passwort erforderlich' });
  }
  try {
    const result = await pool.query(
      `SELECT password_hash FROM users WHERE id = $1`,
      [userId]
    );
    const hash = result.rows[0]?.password_hash;
    if (!hash || !(await bcrypt.compare(oldPw, hash))) {
      return res.status(401).json({ success: false, error: 'Altes Passwort falsch' });
    }
    const newHash = await bcrypt.hash(newPw, 10);
    await pool.query(
      `UPDATE users SET password_hash = $1 WHERE id = $2`,
      [newHash, userId]
    );
    res.json({ success: true, message: 'Passwort geändert' });
  } catch (err) {
    console.error('Fehler bei POST /settings/change-password:', err);
    res.status(500).json({ success: false, error: 'Fehler beim Ändern des Passworts' });
  }
});

/**
 * POST /settings/2fa
 * Schaltet 2-Faktor-Authentifizierung ein/aus
 * Body: { enabled: boolean }
 */
app.post('/settings/2fa', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { enabled } = req.body;
  try {
    await pool.query(
      `UPDATE users SET two_fa_enabled = $1 WHERE id = $2`,
      [enabled === true, userId]
    );
    res.json({ success: true, twoFA: enabled === true });
  } catch (err) {
    console.error('Fehler bei POST /settings/2fa:', err);
    res.status(500).json({ success: false, error: 'Fehler beim Setzen von 2FA' });
  }
});

/**
 * POST /settings/notifications
 * Schaltet E-Mail-Benachrichtigungen ein/aus
 * Body: { enabled: boolean }
 */
app.post('/settings/notifications', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { enabled } = req.body;
  try {
    await pool.query(
      `UPDATE users SET email_notifications_enabled = $1 WHERE id = $2`,
      [enabled === true, userId]
    );
    res.json({ success: true, emailNotifications: enabled === true });
  } catch (err) {
    console.error('Fehler bei POST /settings/notifications:', err);
    res.status(500).json({ success: false, error: 'Fehler beim Setzen der Benachrichtigungen' });
  }
});

// ── Settings-Status ────────────────────────────────────────────
// GET /settings/status
app.get('/settings/status', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await pool.query(
      `SELECT two_fa_enabled, email_notifications_enabled
       FROM users
       WHERE id = $1`,
      [userId]
    );
    const row = rows[0] || {};
    res.json({
      twoFA: Boolean(row.two_fa_enabled),
      notif: Boolean(row.email_notifications_enabled)
    });
  } catch (err) {
    console.error('Fehler bei GET /settings/status:', err);
    res.status(500).json({ success: false, error: 'Fehler beim Laden der Einstellungen' });
  }
});

// ── Profil updaten ─────────────────────────────────────────────
// PUT /me
app.put('/me', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { first_name, last_name, email } = req.body;
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ success: false, message: 'Alle Felder sind erforderlich' });
  }
  try {
    await pool.query(
      `UPDATE users
         SET first_name = $1,
             last_name  = $2,
             email      = $3
       WHERE id = $4`,
      [first_name, last_name, email, userId]
    );
    res.json({ success: true, message: 'Profil aktualisiert!' });
  } catch (err) {
    console.error('Fehler bei PUT /me:', err);
    res.status(500).json({ success: false, message: 'Fehler beim Speichern des Profils' });
  }
});

// ── Passwort ändern ────────────────────────────────────────────
// POST /settings/password
app.post('/settings/password', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { oldPw, newPw } = req.body;
  if (!oldPw || !newPw) {
    return res.status(400).json({ success: false, error: 'Altes und neues Passwort erforderlich' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT password_hash FROM users WHERE id = $1`,
      [userId]
    );
    const hash = rows[0]?.password_hash;
    if (!hash || !(await bcrypt.compare(oldPw, hash))) {
      return res.status(401).json({ success: false, error: 'Altes Passwort falsch' });
    }
    const newHash = await bcrypt.hash(newPw, 10);
    await pool.query(
      `UPDATE users SET password_hash = $1 WHERE id = $2`,
      [newHash, userId]
    );
    res.json({ success: true, message: 'Passwort geändert!' });
  } catch (err) {
    console.error('Fehler bei POST /settings/password:', err);
    res.status(500).json({ success: false, error: 'Fehler beim Ändern des Passworts' });
  }
});
