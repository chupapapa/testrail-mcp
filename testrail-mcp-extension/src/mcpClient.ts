/**
 * MCP Client for communicating with TestRail MCP Server
 */

import * as vscode from 'vscode';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { TestRailMCPConfig, ConnectionStatus, MCPTool, MCPToolResult } from './types';

export class MCPClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private config: TestRailMCPConfig;
  private outputChannel: vscode.OutputChannel;
  private status: ConnectionStatus = ConnectionStatus.Disconnected;
  private tools: MCPTool[] = [];
  private statusChangeEmitter = new vscode.EventEmitter<ConnectionStatus>();
  
  public readonly onStatusChange = this.statusChangeEmitter.event;

  constructor(config: TestRailMCPConfig, outputChannel: vscode.OutputChannel) {
    this.config = config;
    this.outputChannel = outputChannel;
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Get available tools from MCP server
   */
  getTools(): MCPTool[] {
    return this.tools;
  }

  /**
   * Connect to the MCP server
   */
  async connect(): Promise<void> {
    if (this.status === ConnectionStatus.Connected || this.status === ConnectionStatus.Connecting) {
      this.log('Already connected or connecting');
      return;
    }

    this.setStatus(ConnectionStatus.Connecting);
    this.log('Connecting to TestRail MCP server...');

    try {
      // Prepare environment variables for the MCP server
      const env = {
        ...process.env,
        TESTRAIL_URL: this.config.serverUrl,
        TESTRAIL_USERNAME: this.config.username,
        TESTRAIL_API_KEY: this.config.apiKey
      };

      this.log(`Spawning: ${this.config.mcpServerPath} ${this.config.mcpServerArgs.join(' ')}`);
      
      // Create MCP client and transport
      this.transport = new StdioClientTransport({
        command: this.config.mcpServerPath,
        args: this.config.mcpServerArgs,
        env
      });

      this.client = new Client({
        name: 'testrail-mcp-vscode-extension',
        version: '0.1.0'
      }, {
        capabilities: {}
      });

      // Connect the client
      await this.client.connect(this.transport);
      
      this.log('Connected to MCP server');

      // List available tools
      await this.listTools();

      this.setStatus(ConnectionStatus.Connected);
      this.log('Successfully connected to TestRail MCP server');

    } catch (error) {
      this.log(`Failed to connect: ${error instanceof Error ? error.message : String(error)}`);
      this.setStatus(ConnectionStatus.Error);
      await this.disconnect();
      throw error;
    }
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    this.log('Disconnecting from MCP server...');

    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
      }

      if (this.transport) {
        await this.transport.close();
        this.transport = null;
      }
    } catch (error) {
      this.log(`Error during disconnect: ${error instanceof Error ? error.message : String(error)}`);
    }

    this.setStatus(ConnectionStatus.Disconnected);
    this.log('Disconnected from MCP server');
  }

  /**
   * List available tools from the MCP server
   */
  private async listTools(): Promise<void> {
    if (!this.client) {
      throw new Error('Client not connected');
    }

    try {
      const response = await this.client.listTools();
      this.tools = response.tools as MCPTool[];
      this.log(`Found ${this.tools.length} tools: ${this.tools.map(t => t.name).join(', ')}`);
    } catch (error) {
      this.log(`Failed to list tools: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(toolName: string, args: Record<string, any>): Promise<MCPToolResult> {
    if (!this.client) {
      throw new Error('Client not connected');
    }

    if (this.status !== ConnectionStatus.Connected) {
      throw new Error('Not connected to MCP server');
    }

    try {
      this.log(`Calling tool: ${toolName} with args: ${JSON.stringify(args)}`);
      
      const response = await this.client.callTool({
        name: toolName,
        arguments: args
      });

      this.log(`Tool response: ${JSON.stringify(response)}`);
      
      return response as MCPToolResult;
    } catch (error) {
      this.log(`Tool call failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Update configuration and reconnect
   */
  async updateConfig(config: TestRailMCPConfig): Promise<void> {
    this.config = config;
    
    if (this.status === ConnectionStatus.Connected) {
      await this.disconnect();
      await this.connect();
    }
  }

  /**
   * Set connection status and notify listeners
   */
  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.statusChangeEmitter.fire(status);
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] [MCPClient] ${message}`);
  }
}
