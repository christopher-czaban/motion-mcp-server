import db from './database.js';

// Constants defined in main.ts, but duplicated here for clarity during development
// In a production system, these might be imported or passed to the constructor.
const MAX_CALLS = 12;
const TIME_WINDOW_MS = 180000; // 3 minutes in milliseconds
const LOG_PRUNE_AFTER_MS = 600000; // 10 minutes in milliseconds

export class RateLimiter {
  /**
   * Checks if an API call is allowed and records the timestamp if it is.
   * Uses a transaction for atomicity.
   * @returns {{ allowed: boolean; waitTimeMs?: number }}
   */
  checkAndRecordCall(): { allowed: boolean; waitTimeMs?: number } {
    const now = Date.now();
    const windowStart = now - TIME_WINDOW_MS;

    // This function will be executed in a transaction
    const transaction = db.transaction(() => {
      const recentCallsStmt = db.prepare(
        'SELECT COUNT(*) as count FROM api_call_timestamps WHERE timestamp_ms > ?'
      );
      const recentCalls = recentCallsStmt.get(windowStart) as { count: number };

      if (recentCalls.count < MAX_CALLS) {
        const insertStmt = db.prepare('INSERT INTO api_call_timestamps (timestamp_ms) VALUES (?)');
        insertStmt.run(now);
        
        // Prune old records opportunistically within the same transaction
        this.pruneOldRecords(now); // Pass current time to pruneOldRecords
        
        return { allowed: true };
      } else {
        const oldestInWindowStmt = db.prepare(
          'SELECT timestamp_ms FROM api_call_timestamps WHERE timestamp_ms > ? ORDER BY timestamp_ms ASC LIMIT 1'
        );
        const oldestInWindow = oldestInWindowStmt.get(windowStart) as { timestamp_ms: number } | undefined;

        // If oldestInWindow is undefined (e.g., all 12+ calls happened *exactly* at windowStart, which is unlikely but possible)
        // or if somehow the query returns null, we should still block and suggest a generic wait time or the full window.
        // For simplicity, if oldestInWindow.timestamp_ms is not available, we can assume the wait is the full window.
        // However, given the count >= MAX_CALLS, oldestInWindow should generally exist.
        const waitTimeMs = oldestInWindow?.timestamp_ms 
          ? TIME_WINDOW_MS - (now - oldestInWindow.timestamp_ms)
          : TIME_WINDOW_MS; // Fallback wait time
          
        return { allowed: false, waitTimeMs: Math.max(0, waitTimeMs) }; // Ensure waitTime is not negative
      }
    });

    return transaction();
  }

  /**
   * Removes timestamps older than LOG_PRUNE_AFTER_MS.
   * @param currentTime The current time (Date.now()) to use as a reference for pruning.
   */
  pruneOldRecords(currentTime: number): void {
    const cutoff = currentTime - LOG_PRUNE_AFTER_MS;
    const deleteStmt = db.prepare('DELETE FROM api_call_timestamps WHERE timestamp_ms < ?');
    deleteStmt.run(cutoff);
  }
}

// Export a single instance of the RateLimiter
export default new RateLimiter(); 