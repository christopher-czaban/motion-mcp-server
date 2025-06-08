/**
 * API Client Module
 * Handles HTTP requests, parameter processing, and API communication
 */
import { checkAndRecordCall } from './rate-limiter.js';
import { getBaseUrl, getApiKey } from './config.js';
/**
 * Parameterize an endpoint with path and query parameters
 * @param endpoint Endpoint template with {param} placeholders
 * @param parameters Object containing path and query parameters
 * @returns Parameterized endpoint string
 */
export function parameterizeEndpoint(endpoint, parameters) {
    // Handle path parameters
    let path = endpoint.replace(/\{([^}]+)\}/g, (match, paramName) => {
        const value = parameters[paramName];
        if (value === undefined || value === null) {
            throw new Error(`Missing required parameter: ${paramName}`);
        }
        return encodeURIComponent(value);
    });
    // Handle query parameters
    const queryParams = Object.entries(parameters)
        .filter(([key]) => !endpoint.includes(`{${key}}`)) // Exclude path parameters
        .filter(([_, value]) => value !== undefined && value !== null) // Exclude null/undefined values
        .map(([key, value]) => {
        if (Array.isArray(value)) {
            return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
        .join('&');
    if (queryParams) {
        path += `?${queryParams}`;
    }
    return path;
}
/**
 * Make an API call with rate limiting, authentication, and error handling
 * @param endpoint API endpoint path
 * @param method HTTP method
 * @param body Request body (optional)
 * @param contentType Content type header (optional)
 * @returns Promise resolving to API response
 */
export async function callApi(endpoint, method, body, contentType) {
    const baseUrl = getBaseUrl();
    // Check rate limit only for calls to the Motion API (baseUrl)
    // Construct the full URL to check against baseUrl. 
    // The `endpoint` parameter to callApi is usually a path like '/projects', not a full URL.
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
    if (fullUrl.startsWith(baseUrl)) {
        const { allowed, waitTimeMs } = checkAndRecordCall();
        if (!allowed && waitTimeMs !== undefined) { // Ensure waitTimeMs is defined before using it
            const waitTimeSec = Math.ceil(waitTimeMs / 1000);
            console.warn(`Motion API rate limit reached. Please wait ${waitTimeSec} seconds before trying again.`);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            error: 'Rate Limit Exceeded',
                            details: `Motion API rate limit reached. Please wait ${waitTimeSec} seconds before trying again.`,
                            waitTimeSeconds: waitTimeSec
                        })
                    }
                ],
                isError: true
            };
        }
        else if (!allowed) {
            // Fallback if waitTimeMs is somehow undefined but call is not allowed
            console.warn(`Motion API rate limit reached. Please wait before trying again.`);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            error: 'Rate Limit Exceeded',
                            details: `Motion API rate limit reached. Please wait a few minutes before trying again.`
                        })
                    }
                ],
                isError: true
            };
        }
    }
    const headers = {};
    if (contentType) {
        headers['Content-Type'] = contentType;
    }
    // Retrieve API key from environment variable
    const apiKey = getApiKey();
    if (!apiKey) {
        // Return an error response if the API key is missing
        // This prevents leaking information about the missing key in thrown errors
        console.error("Error: MOTION_API_KEY environment variable not set.");
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        error: 'Configuration error',
                        details: 'MOTION_API_KEY environment variable not set. Please configure it in your MCP client.'
                    })
                }
            ],
            isError: true // Indicate that this is a tool execution error
        };
    }
    headers['X-API-Key'] = apiKey; // Add the API key header
    const response = await fetch(`${baseUrl}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    // Check for non-OK responses after fetch, but before trying to parse JSON
    if (!response.ok) {
        // Attempt to read error details, but handle cases where it might not be JSON
        let errorDetails = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorDetails = JSON.stringify(errorData);
        }
        catch (e) {
            // If response is not JSON, use the status text or default message
            errorDetails = response.statusText || errorDetails;
        }
        console.error("API call failed:", errorDetails);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ error: 'API Error', details: errorDetails })
                }
            ],
            isError: true // Indicate a tool execution error
        };
    }
    // Proceed to parse JSON only if the response was ok
    const data = await response.json();
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(data)
            }
        ]
        // No isError field means success
    };
}
