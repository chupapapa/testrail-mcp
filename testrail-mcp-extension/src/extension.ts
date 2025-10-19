/**
 * VS Code Extension Entry Point for TestRail MCP Integration
 */

import * as vscode from 'vscode';
import { ConfigManager } from './config';
import { MCPClient } from './mcpClient';
import { registerTestRailTool } from './tools/testrailTool';
import { ConnectionStatus, ExtensionContextWithSecrets } from './types';

let mcpClient: MCPClient | null = null;
let configManager: ConfigManager | null = null;
let outputChannel: vscode.OutputChannel | null = null;
let statusBarItem: vscode.StatusBarItem | null = null;

/**
 * Extension activation
 */
export async function activate(context: vscode.ExtensionContext) {
  console.log('TestRail MCP Extension is activating...');

  // Create output channel for debugging
  outputChannel = vscode.window.createOutputChannel('TestRail MCP');
  context.subscriptions.push(outputChannel);
  outputChannel.appendLine('TestRail MCP Extension activated');

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'testrailMcp.reconnect';
  context.subscriptions.push(statusBarItem);
  updateStatusBar(ConnectionStatus.Disconnected);
  statusBarItem.show();

  // Initialize config manager
  configManager = new ConfigManager(context as ExtensionContextWithSecrets, outputChannel);

  // Register commands
  registerCommands(context);

  // Try to auto-connect if configured
  try {
    await initializeConnection(context);
  } catch (error) {
    outputChannel.appendLine(`Failed to initialize connection: ${error instanceof Error ? error.message : String(error)}`);
    vscode.window.showWarningMessage(
      'TestRail MCP: Failed to connect. Use "TestRail MCP: Configure Credentials" to set up.',
      'Configure'
    ).then(selection => {
      if (selection === 'Configure') {
        vscode.commands.executeCommand('testrailMcp.configureCredentials');
      }
    });
  }

  outputChannel.appendLine('TestRail MCP Extension activation complete');
}

/**
 * Extension deactivation
 */
export async function deactivate() {
  if (mcpClient) {
    await mcpClient.disconnect();
  }
  if (outputChannel) {
    outputChannel.appendLine('TestRail MCP Extension deactivated');
  }
}

/**
 * Initialize MCP connection
 */
async function initializeConnection(context: vscode.ExtensionContext): Promise<void> {
  if (!configManager || !outputChannel) {
    throw new Error('Extension not properly initialized');
  }

  const config = await configManager.getConfig();
  if (!config) {
    outputChannel.appendLine('No configuration found, skipping auto-connect');
    return;
  }

  outputChannel.appendLine('Configuration found, attempting to connect...');

  // Create MCP client
  mcpClient = new MCPClient(config, outputChannel);

  // Listen to status changes
  mcpClient.onStatusChange((status) => {
    updateStatusBar(status);
    
    if (status === ConnectionStatus.Connected) {
      outputChannel?.appendLine('Successfully connected to TestRail MCP server');
      vscode.window.showInformationMessage('TestRail MCP: Connected successfully');
    } else if (status === ConnectionStatus.Error) {
      outputChannel?.appendLine('Connection error');
      vscode.window.showErrorMessage('TestRail MCP: Connection error. Check output for details.');
    }
  });

  // Connect to MCP server
  await mcpClient.connect();

  // Register the tool with VS Code
  const toolDisposable = registerTestRailTool(context, mcpClient, outputChannel);
  context.subscriptions.push(toolDisposable);
  
  outputChannel.appendLine('TestRail MCP tool registered with VS Code');
}

/**
 * Register extension commands
 */
function registerCommands(context: vscode.ExtensionContext): void {
  // Configure Credentials command
  context.subscriptions.push(
    vscode.commands.registerCommand('testrailMcp.configureCredentials', async () => {
      if (!configManager || !outputChannel) {
        return;
      }

      outputChannel.appendLine('Configure Credentials command invoked');
      const success = await configManager.promptForCredentials();
      
      if (success) {
        // Try to reconnect with new credentials
        await vscode.commands.executeCommand('testrailMcp.reconnect');
      }
    })
  );

  // Test Connection command
  context.subscriptions.push(
    vscode.commands.registerCommand('testrailMcp.testConnection', async () => {
      if (!outputChannel) {
        return;
      }

      outputChannel.appendLine('Test Connection command invoked');
      
      if (!mcpClient || mcpClient.getStatus() !== ConnectionStatus.Connected) {
        vscode.window.showWarningMessage('TestRail MCP: Not connected. Use "Reconnect" to connect.');
        return;
      }

      try {
        // Try to list projects as a connection test
        const result = await mcpClient.callTool('get_projects', {});
        outputChannel.appendLine(`Connection test result: ${JSON.stringify(result)}`);
        vscode.window.showInformationMessage('TestRail MCP: Connection test successful');
      } catch (error) {
        outputChannel.appendLine(`Connection test failed: ${error instanceof Error ? error.message : String(error)}`);
        vscode.window.showErrorMessage(`TestRail MCP: Connection test failed - ${error instanceof Error ? error.message : String(error)}`);
      }
    })
  );

  // Reconnect command
  context.subscriptions.push(
    vscode.commands.registerCommand('testrailMcp.reconnect', async () => {
      if (!configManager || !outputChannel) {
        return;
      }

      outputChannel.appendLine('Reconnect command invoked');
      
      // Disconnect if already connected
      if (mcpClient) {
        await mcpClient.disconnect();
      }

      // Try to reconnect
      try {
        await initializeConnection(context);
      } catch (error) {
        outputChannel.appendLine(`Reconnect failed: ${error instanceof Error ? error.message : String(error)}`);
        vscode.window.showErrorMessage(
          'TestRail MCP: Failed to connect. Please check your configuration.',
          'Configure'
        ).then(selection => {
          if (selection === 'Configure') {
            vscode.commands.executeCommand('testrailMcp.configureCredentials');
          }
        });
      }
    })
  );
}

/**
 * Update status bar based on connection status
 */
function updateStatusBar(status: ConnectionStatus): void {
  if (!statusBarItem) {
    return;
  }

  switch (status) {
    case ConnectionStatus.Connected:
      statusBarItem.text = '$(check) TestRail MCP';
      statusBarItem.tooltip = 'TestRail MCP: Connected';
      statusBarItem.backgroundColor = undefined;
      break;
    case ConnectionStatus.Connecting:
      statusBarItem.text = '$(sync~spin) TestRail MCP';
      statusBarItem.tooltip = 'TestRail MCP: Connecting...';
      statusBarItem.backgroundColor = undefined;
      break;
    case ConnectionStatus.Error:
      statusBarItem.text = '$(error) TestRail MCP';
      statusBarItem.tooltip = 'TestRail MCP: Connection Error (click to reconnect)';
      statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
      break;
    case ConnectionStatus.Disconnected:
    default:
      statusBarItem.text = '$(debug-disconnect) TestRail MCP';
      statusBarItem.tooltip = 'TestRail MCP: Disconnected (click to connect)';
      statusBarItem.backgroundColor = undefined;
      break;
  }
}
