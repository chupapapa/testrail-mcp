/**
 * Configuration management for TestRail MCP Extension
 */

import * as vscode from 'vscode';
import { TestRailMCPConfig, ExtensionContextWithSecrets } from './types';

const SECRETS_KEY_USERNAME = 'testrailMcp.username';
const SECRETS_KEY_API_KEY = 'testrailMcp.apiKey';

export class ConfigManager {
  private context: ExtensionContextWithSecrets;
  private outputChannel: vscode.OutputChannel;

  constructor(context: ExtensionContextWithSecrets, outputChannel: vscode.OutputChannel) {
    this.context = context;
    this.outputChannel = outputChannel;
  }

  /**
   * Get the current configuration
   */
  async getConfig(): Promise<TestRailMCPConfig | null> {
    const config = vscode.workspace.getConfiguration('testrailMcp');
    
    const serverUrl = config.get<string>('serverUrl', '');
    const mcpServerPath = config.get<string>('mcpServerPath', 'uvx');
    const mcpServerArgs = config.get<string[]>('mcpServerArgs', ['testrail-mcp']);
    const debug = config.get<boolean>('debug', false);
    
    // Get credentials from secure storage
    const username = await this.context.secrets.get(SECRETS_KEY_USERNAME);
    const apiKey = await this.context.secrets.get(SECRETS_KEY_API_KEY);
    
    if (!serverUrl || !username || !apiKey) {
      return null;
    }
    
    return {
      serverUrl,
      username,
      apiKey,
      mcpServerPath,
      mcpServerArgs,
      debug
    };
  }

  /**
   * Set credentials securely
   */
  async setCredentials(username: string, apiKey: string): Promise<void> {
    await this.context.secrets.store(SECRETS_KEY_USERNAME, username);
    await this.context.secrets.store(SECRETS_KEY_API_KEY, apiKey);
    this.log('Credentials stored securely');
  }

  /**
   * Clear stored credentials
   */
  async clearCredentials(): Promise<void> {
    await this.context.secrets.delete(SECRETS_KEY_USERNAME);
    await this.context.secrets.delete(SECRETS_KEY_API_KEY);
    this.log('Credentials cleared');
  }

  /**
   * Check if configuration is valid
   */
  async isConfigured(): Promise<boolean> {
    const config = await this.getConfig();
    return config !== null;
  }

  /**
   * Prompt user to configure credentials
   */
  async promptForCredentials(): Promise<boolean> {
    const config = vscode.workspace.getConfiguration('testrailMcp');
    let serverUrl = config.get<string>('serverUrl', '');
    
    // Prompt for server URL if not set
    if (!serverUrl) {
      const inputUrl = await vscode.window.showInputBox({
        prompt: 'Enter TestRail server URL',
        placeHolder: 'https://your-instance.testrail.io',
        validateInput: (value) => {
          if (!value) {
            return 'Server URL is required';
          }
          try {
            new URL(value);
            return null;
          } catch {
            return 'Invalid URL format';
          }
        }
      });
      
      if (!inputUrl) {
        return false;
      }
      
      serverUrl = inputUrl;
      await config.update('serverUrl', serverUrl, vscode.ConfigurationTarget.Global);
    }
    
    // Prompt for username
    const username = await vscode.window.showInputBox({
      prompt: 'Enter TestRail username (email)',
      placeHolder: 'your-email@example.com',
      validateInput: (value) => {
        if (!value) {
          return 'Username is required';
        }
        return null;
      }
    });
    
    if (!username) {
      return false;
    }
    
    // Prompt for API key
    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter TestRail API key',
      placeHolder: 'Your API key from TestRail',
      password: true,
      validateInput: (value) => {
        if (!value) {
          return 'API key is required';
        }
        return null;
      }
    });
    
    if (!apiKey) {
      return false;
    }
    
    // Store credentials
    await this.setCredentials(username, apiKey);
    
    vscode.window.showInformationMessage('TestRail MCP credentials configured successfully');
    return true;
  }

  private log(message: string): void {
    this.outputChannel.appendLine(`[Config] ${message}`);
  }
}
