/**
 * Base interfaces, types, and utilities for the Motion MCP Server tool infrastructure
 */

import { z } from 'zod';

/**
 * Tool handler function type - defines the signature for tool implementation functions
 * This matches the MCP SDK's CallToolResult type
 */
export type ToolHandler = (params: any) => Promise<CallToolResult>;

/**
 * Tool definition interface - describes a tool's metadata and implementation
 */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: any; // Zod schema or plain object with Zod types
  handler: ToolHandler;
}

/**
 * MCP SDK compatible tool response format
 * This matches the CallToolResult interface from the MCP SDK
 */
export interface CallToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
  _meta?: Record<string, unknown>;
  [key: string]: unknown; // Allow additional properties for MCP SDK compatibility
}

/**
 * Alias for backward compatibility
 */
export type ToolResponse = CallToolResult;

/**
 * API response wrapper for handling Motion API calls
 * This matches the CallToolResult format for consistency
 */
export interface ApiResponseWrapper extends CallToolResult {}

/**
 * Tool parameter validation error
 */
export interface ToolValidationError {
  error: string;
  details: z.ZodError['errors'];
}

/**
 * Tool execution error
 */
export interface ToolExecutionError {
  error: string;
  details: string;
}

/**
 * Utility function to create a standardized error response
 */
export function createErrorResponse(error: string, details: string): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error, details })
      }
    ],
    isError: true
  };
}

/**
 * Utility function to create a standardized success response
 */
export function createSuccessResponse(data: any): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data)
      }
    ]
  };
}

/**
 * Utility function to handle Zod validation errors in a consistent way
 */
export function handleValidationError(error: z.ZodError): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          error: 'Validation error',
          details: error.errors
        })
      }
    ],
    isError: true
  };
}

/**
 * Base class for tool implementations (optional - for structured tool development)
 */
export abstract class BaseTool {
  abstract name: string;
  abstract description: string;
  abstract parameters: any;

  abstract execute(params: any): Promise<CallToolResult>;

  /**
   * Validates parameters using the tool's schema
   */
  protected validateParams(params: any): any {
    if (this.parameters && typeof this.parameters.parse === 'function') {
      return this.parameters.parse(params);
    }
    return params;
  }

  /**
   * Creates the tool definition for registration
   */
  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
      handler: this.execute.bind(this)
    };
  }
}
