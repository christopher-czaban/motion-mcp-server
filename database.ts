import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';

// Use import.meta.url and fileURLToPath for ES Modules to get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct paths relative to the current module's directory
const DATA_DIR = path.join(__dirname, '.data');
const DB_PATH = path.join(DATA_DIR, 'motion_api_ratelimit.sqlite');

console.error(`[Database] Data directory path: ${DATA_DIR}`);
console.error(`[Database] Database file path: ${DB_PATH}`);

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.error(`[Database] Created data directory: ${DATA_DIR}`);
  }
} catch (error) {
  console.error(`[Database] Error creating data directory ${DATA_DIR}:`, error);
  // Depending on requirements, might want to throw or exit here
}

let db;
try {
  // Initialize database connection
  db = new Database(DB_PATH, { /* verbose: console.error // uncomment for debugging */ });
  console.error(`[Database] Connection to ${DB_PATH} opened.`);

  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');
  console.error('[Database] WAL mode enabled.');

  // Create table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_call_timestamps (
      timestamp_ms INTEGER PRIMARY KEY
    )
  `);
  console.error(`[Database] Table 'api_call_timestamps' ensured.`);

} catch (error) {
  console.error(`[Database] Error initializing database at ${DB_PATH}:`, error);
  // Rethrow or handle as appropriate for the application
  throw error;
}

export default db; 