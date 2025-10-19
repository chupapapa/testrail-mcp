/**
 * Type definitions for TestRail MCP Extension
 */

import * as vscode from 'vscode';

/**
 * Configuration for TestRail MCP connection
 */
export interface TestRailMCPConfig {
  serverUrl: string;
  username: string;
  apiKey: string;
  mcpServerPath: string;
  mcpServerArgs: string[];
  debug: boolean;
}

/**
 * Status of the MCP connection
 */
export enum ConnectionStatus {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Error = 'error'
}

/**
 * Result from MCP tool invocation
 */
export interface MCPToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
}

/**
 * MCP Tool definition
 */
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * TestRail tool invocation parameters
 */
export interface TestRailToolParams {
  action: string;
  project_id?: number;
  test_case_id?: number;
  case_id?: number;
  test_run_id?: number;
  run_id?: number;
  test_id?: number;
  status_id?: number;
  comment?: string;
  suite_id?: number;
  section_id?: number;
  dataset_id?: number;
  name?: string;
  title?: string;
  description?: string;
  [key: string]: any;
}

/**
 * Extension context with secrets
 */
export interface ExtensionContextWithSecrets extends vscode.ExtensionContext {
  secrets: vscode.SecretStorage;
}
