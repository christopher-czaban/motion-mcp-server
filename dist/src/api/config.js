/**
 * API Configuration Module
 * Handles environment variables and API configuration
 */
// Base URL configuration - mutable to allow dynamic updates
let baseUrl = 'https://api.usemotion.com/v1'; // Base URL from Swagger spec or default
/**
 * Get the current base URL for API requests
 * @returns Current base URL
 */
export function getBaseUrl() {
    return baseUrl;
}
/**
 * Set a new base URL for API requests
 * @param url New base URL to set
 * @returns Object with success status and new URL
 */
export function setBaseUrl(url) {
    baseUrl = url;
    return { success: true, newBaseUrl: baseUrl };
}
/**
 * Get the Motion API key from environment variables
 * @returns API key or null if not set
 */
export function getApiKey() {
    return process.env.MOTION_API_KEY || null;
}
/**
 * Validate that required environment variables are set
 * @returns Object with validation status and error details if any
 */
export function validateEnvironment() {
    const apiKey = getApiKey();
    if (!apiKey) {
        return {
            valid: false,
            error: 'MOTION_API_KEY environment variable not set. Please configure it in your MCP client.'
        };
    }
    return { valid: true };
}
/**
 * Get complete API configuration
 * @returns Current API configuration
 */
export function getApiConfig() {
    return {
        baseUrl: getBaseUrl(),
        apiKey: getApiKey()
    };
}
