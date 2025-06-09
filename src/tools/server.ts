/**
 * MCP Server infrastructure and utilities for the Motion MCP Server
 * Handles server creation, configuration, and API utilities
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ToolRegistry, initializeRegistry } from './registry.js';
import { ApiResponseWrapper } from './base.js';
import rateLimiter from '../../rate_limiter.js';

/**
 * Server configuration interface
 */
export interface ServerConfig {
  name: string;
  version: string;
  baseUrl?: string;
}

/**
 * Default server configuration
 */
const DEFAULT_CONFIG: ServerConfig = {
  name: 'Motion AI Assistant',
  version: '1.0.0',
  baseUrl: 'https://api.usemotion.com/v1'
};

/**
 * Global server state
 */
let serverInstance: McpServer | null = null;
let toolRegistry: ToolRegistry | null = null;
let baseUrl = 'https://api.usemotion.com/v1';

/**
 * Create and configure the MCP server instance
 */
export function createServer(config: Partial<ServerConfig> = {}): McpServer {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  if (finalConfig.baseUrl) {
    baseUrl = finalConfig.baseUrl;
  }

  serverInstance = new McpServer({
    name: finalConfig.name,
    version: finalConfig.version
  });

  // Initialize the tool registry with the server
  toolRegistry = initializeRegistry(serverInstance);

  return serverInstance;
}

/**
 * Get the current server instance
 */
export function getServer(): McpServer {
  if (!serverInstance) {
    throw new Error('Server not initialized. Call createServer() first.');
  }
  return serverInstance;
}

/**
 * Get the tool registry instance
 */
export function getToolRegistry(): ToolRegistry {
  if (!toolRegistry) {
    throw new Error('Tool registry not initialized. Call createServer() first.');
  }
  return toolRegistry;
}

/**
 * Start the server with stdio transport
 */
export async function startServer(): Promise<void> {
  const server = getServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

/**
 * Get the current base URL
 */
export function getBaseUrl(): string {
  return baseUrl;
}

/**
 * Set the base URL for API calls
 */
export function setBaseUrl(newBaseUrl: string): void {
  baseUrl = newBaseUrl;
}

/**
 * Utility function to parameterize API endpoints
 * Extracted from main.ts parameterizeEndpoint function
 */
export function parameterizeEndpoint(endpoint: string, parameters: Record<string, any>): string {
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
 * Make API calls to the Motion API with rate limiting and error handling
 * Extracted from main.ts callApi function
 */
export async function callApi(endpoint: string, method: string, body?: any, contentType?: string): Promise<ApiResponseWrapper> {
  // Check rate limit only for calls to the Motion API (baseUrl)
  // Construct the full URL to check against baseUrl.
  // The `endpoint` parameter to callApi is usually a path like '/projects', not a full URL.
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  if (fullUrl.startsWith(baseUrl)) {
    const { allowed, waitTimeMs } = rateLimiter.checkAndRecordCall();
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
    } else if (!allowed) {
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

  const headers: Record<string, string> = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  // Retrieve API key from environment variable
  const apiKey = process.env.MOTION_API_KEY;
  if (!apiKey) {
    // Return an error response if the API key is missing
    // This prevents leaking information about the missing key in thrown errors
    console.error("Error: MOTION_API_KEY environment variable not set.");
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: 'Configuration error', details: 'MOTION_API_KEY environment variable not set. Please configure it in your MCP client.' })
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
    } catch (e) {
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
