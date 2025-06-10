import rateLimiter from '../../rate_limiter.js';
// Rate Limiting Constants
export const MAX_CALLS = 12;
export const TIME_WINDOW_MS = 180000; // 3 minutes in milliseconds
export const LOG_PRUNE_AFTER_MS = 600000; // 10 minutes in milliseconds
/**
 * Initialize rate limiter by pruning old records on startup
 */
export function initializeRateLimiter() {
    try {
        rateLimiter.pruneOldRecords(Date.now());
        console.error('[RateLimiter] Successfully pruned old records on startup.');
    }
    catch (error) {
        console.error('[RateLimiter] Error pruning old records on startup:', error);
        // Depending on policy, might want to re-throw or handle differently
    }
}
/**
 * Check if an API call is allowed and record it if so
 * @returns Object with allowed status and optional wait time
 */
export function checkAndRecordCall() {
    return rateLimiter.checkAndRecordCall();
}
/**
 * Prune old rate limiting records
 * @param currentTime Current timestamp to use as reference
 */
export function pruneOldRecords(currentTime) {
    rateLimiter.pruneOldRecords(currentTime);
}
// Re-export the rate limiter instance for backward compatibility
export { rateLimiter };
export default rateLimiter;
