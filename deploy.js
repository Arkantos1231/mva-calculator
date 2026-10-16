/**
 * FTP Auto-Deploy Script
 *
 * Modos:
 *   node deploy.js        → watch mode (sube al guardar)
 *   node deploy.js --all  → sube TODO el plugin de una vez
 *
 * Setup:
 *   1. npm install
 *   2. Copia .env.example a .env y pon tus credenciales FTP
 *   3. Elige el modo
 */

const ftp    = require('basic-ftp');
const chokidar = require('chokidar');
const path   = require('path');
const fs     = require('fs');

// Lee las credenciales de .env (no se sube a git ni al servidor)
function loadEnv(file) {
  if (!fs.existsSync(file)) {
    console.error('✗ Falta el archivo .env. Copia .env.example a .env y pon tus credenciales.');
    process.exit(1);
  }
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv(path.join(__dirname, '.env'));
for (const k of ['FTP_HOST', 'FTP_USER', 'FTP_PASSWORD', 'FTP_REMOTE_PATH']) {
  if (!process.env[k]) { console.error(`✗ Falta ${k} en .env`); process.exit(1); }
}

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const CONFIG = {
  // FTP credentials
  host:     process.env.FTP_HOST,
  user:     process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  secure:   process.env.FTP_SECURE === 'true', // true = FTPS (cifrado)

  // Ruta remota en el servidor donde vive el plugin
  remotePath: process.env.FTP_REMOTE_PATH,

  // Archivos/carpetas a ignorar
  ignore: ['.env', 'node_modules', '.claude', 'ghl_debug.log', 'deploy.js', 'package.json', 'package-lock.json', '.git'],
};
// ─────────────────────────────────────────────────────────────────────────────

const LOCAL_ROOT = __dirname;

// Convierte ruta local a ruta remota
function toRemotePath(localFile) {
  const rel = path.relative(LOCAL_ROOT, localFile).replace(/\\/g, '/');
  return CONFIG.remotePath + '/' + rel;
}

// Sube un archivo via FTP
async function uploadFile(localFile) {
  const remoteFull = toRemotePath(localFile);
  const remoteDir  = remoteFull.substring(0, remoteFull.lastIndexOf('/'));

  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host:     CONFIG.host,
      user:     CONFIG.user,
      password: CONFIG.password,
      secure:   CONFIG.secure,
    });

    await client.ensureDir(remoteDir);
    await client.uploadFrom(localFile, remoteFull);

    const rel = path.relative(LOCAL_ROOT, localFile);
    console.log(`[${timestamp()}] ✓ Subido: ${rel}`);
  } catch (err) {
    console.error(`[${timestamp()}] ✗ Error subiendo ${localFile}:`, err.message);
  } finally {
    client.close();
  }
}

// Elimina un archivo del servidor
async function deleteFile(localFile) {
  const remoteFull = toRemotePath(localFile);
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host:     CONFIG.host,
      user:     CONFIG.user,
      password: CONFIG.password,
      secure:   CONFIG.secure,
    });

    await client.remove(remoteFull);
    const rel = path.relative(LOCAL_ROOT, localFile);
    console.log(`[${timestamp()}] 🗑  Eliminado: ${rel}`);
  } catch (err) {
    // Ignorar errores de archivo no encontrado
    if (!err.message.includes('550')) {
      console.error(`[${timestamp()}] ✗ Error eliminando:`, err.message);
    }
  } finally {
    client.close();
  }
}

function timestamp() {
  return new Date().toLocaleTimeString('es-CO');
}

function shouldIgnore(filePath) {
  return CONFIG.ignore.some(pattern => filePath.includes(pattern));
}

// ─── UPLOAD ALL ──────────────────────────────────────────────────────────────
async function uploadAll() {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host:     CONFIG.host,
      user:     CONFIG.user,
      password: CONFIG.password,
      secure:   CONFIG.secure,
    });

    console.log(`[${timestamp()}] Conectado. Subiendo plugin completo...\n`);

    // Sube toda la carpeta local al remotePath, respetando la lista de ignore
    await client.uploadFromDir(LOCAL_ROOT, CONFIG.remotePath, (localPath) => {
      return !shouldIgnore(localPath);
    });

    console.log(`\n[${timestamp()}] ✓ Plugin subido completamente.`);
  } catch (err) {
    console.error(`[${timestamp()}] ✗ Error:`, err.message);
  } finally {
    client.close();
  }
}

// ─── WATCHER ─────────────────────────────────────────────────────────────────
function startWatcher() {
  console.log('👀 Watching for changes... (Ctrl+C to stop)\n');

  const watcher = chokidar.watch(LOCAL_ROOT, {
    ignored:        (p) => shouldIgnore(p),
    persistent:     true,
    ignoreInitial:  true,
    awaitWriteFinish: { stabilityThreshold: 400, pollInterval: 100 },
  });

  watcher
    .on('change', (file) => uploadFile(file))
    .on('add',    (file) => uploadFile(file))
    .on('unlink', (file) => deleteFile(file));
}

// ─── ENTRY POINT ─────────────────────────────────────────────────────────────
if (process.argv.includes('--all')) {
  uploadAll();
} else {
  startWatcher();
}
