/**
 * Tool registration system for the Motion MCP Server
 * Handles tool registration, validation, and management
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ToolDefinition, ToolHandler, createErrorResponse } from './base.js';

/**
 * Tool registry class that manages tool registration and provides utilities
 */
export class ToolRegistry {
  private server: McpServer;
  private registeredTools: Map<string, ToolDefinition> = new Map();

  constructor(server: McpServer) {
    this.server = server;
  }

  /**
   * Register a tool with the MCP server
   * Preserves the exact behavior from the original registerTool function
   */
  registerTool(name: string, description: string, parameters: any, handler: ToolHandler): void {
    try {
      // Directly use the parameters as passed.
      // The MCP SDK is expected to handle plain objects with Zod types,
      // or z.object() instances if tools are defined that way.
      console.error(`[MCP Server registry.ts] Registering tool: ${name} with parameters:`, JSON.stringify(parameters, null, 2));
      
      // Store the tool definition for potential future use
      const toolDefinition: ToolDefinition = {
        name,
        description,
        parameters,
        handler
      };
      this.registeredTools.set(name, toolDefinition);

      // Register with the MCP server
      this.server.tool(name, description, parameters, handler);
    } catch (error) {
      console.error(`Failed to register tool ${name}:`, error);
      throw error;
    }
  }

  /**
   * Register a tool using a ToolDefinition object
   */
  registerToolDefinition(toolDef: ToolDefinition): void {
    this.registerTool(toolDef.name, toolDef.description, toolDef.parameters, toolDef.handler);
  }

  /**
   * Get a registered tool definition by name
   */
  getToolDefinition(name: string): ToolDefinition | undefined {
    return this.registeredTools.get(name);
  }

  /**
   * Get all registered tool names
   */
  getRegisteredToolNames(): string[] {
    return Array.from(this.registeredTools.keys());
  }

  /**
   * Check if a tool is registered
   */
  isToolRegistered(name: string): boolean {
    return this.registeredTools.has(name);
  }

  /**
   * Get the count of registered tools
   */
  getToolCount(): number {
    return this.registeredTools.size;
  }

  /**
   * Clear all registered tools (useful for testing)
   */
  clearTools(): void {
    this.registeredTools.clear();
  }
}

/**
 * Global registry instance - will be initialized when server is created
 */
let globalRegistry: ToolRegistry | null = null;

/**
 * Initialize the global tool registry with a server instance
 */
export function initializeRegistry(server: McpServer): ToolRegistry {
  globalRegistry = new ToolRegistry(server);
  return globalRegistry;
}

/**
 * Get the global tool registry instance
 */
export function getRegistry(): ToolRegistry {
  if (!globalRegistry) {
    throw new Error('Tool registry not initialized. Call initializeRegistry() first.');
  }
  return globalRegistry;
}

/**
 * Convenience function that maintains the original registerTool API
 * This preserves backward compatibility with existing tool registration code
 */
export function registerTool(name: string, description: string, parameters: any, handler: ToolHandler): void {
  const registry = getRegistry();
  registry.registerTool(name, description, parameters, handler);
}
