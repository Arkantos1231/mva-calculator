/**
 * FTP Auto-Deploy Script
 *
 * Modos:
 *   node deploy.js        → watch mode (sube al guardar)
 *   node deploy.js --all  → sube TODO el plugin de una vez
 *
 * Setup:
 *   1. npm install
 *   2. Configura tus credenciales FTP abajo
 *   3. Elige el modo
 */

const ftp    = require('basic-ftp');
const chokidar = require('chokidar');
const path   = require('path');
const fs     = require('fs');

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const CONFIG = {
  // FTP credentials
  host:     'ftp.pinderplotkin.com',       // ← tu host FTP
  user:     'julian@pinderplotkin.com',      // ← tu usuario FTP
  password: '***REMOVED***',     // ← tu contraseña FTP
  secure:   false,                 // true si usas FTPS

  // Ruta remota en el servidor donde vive el plugin
  //remotePath: '/staging12.pinderplotkin.com/public_html/wp-content/plugins/mva-calculator',  
  remotePath: '/pinderplotkin.com/public_html/wp-content/plugins/mva-calculator',

  // Archivos/carpetas a ignorar
  ignore: ['node_modules', '.claude', 'ghl_debug.log', 'deploy.js', 'package.json', 'package-lock.json', '.git'],
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
