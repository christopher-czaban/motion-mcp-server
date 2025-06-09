/**
 * Main export file for the Motion MCP Server tool infrastructure
 * Provides a unified interface for all tool-related functionality
 */

// Export base interfaces and types
export {
  ToolHandler,
  ToolDefinition,
  CallToolResult,
  ToolResponse,
  ApiResponseWrapper,
  ToolValidationError,
  ToolExecutionError,
  createErrorResponse,
  createSuccessResponse,
  handleValidationError,
  BaseTool
} from './base.js';

// Import for internal use
import { ToolHandler } from './base.js';

// Export tool registry functionality
export {
  ToolRegistry,
  initializeRegistry,
  getRegistry,
  registerTool
} from './registry.js';

// Export server infrastructure
export {
  ServerConfig,
  createServer,
  getServer,
  getToolRegistry,
  startServer,
  getBaseUrl,
  setBaseUrl,
  parameterizeEndpoint,
  callApi
} from './server.js';

// Import for internal use
import { createServer, getToolRegistry } from './server.js';

/**
 * Convenience function to initialize the complete tool infrastructure
 * This sets up the server and registry in one call
 */
export function initializeToolInfrastructure(config?: {
  name?: string;
  version?: string;
  baseUrl?: string;
}) {
  const server = createServer(config);
  const registry = getToolRegistry();

  return {
    server,
    registry,
    registerTool: (name: string, description: string, parameters: any, handler: ToolHandler) => {
      registry.registerTool(name, description, parameters, handler);
    }
  };
}

/**
 * Re-export commonly used external dependencies for convenience
 */
export { z } from 'zod';
export { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
export { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
