/**
 * TestRail Tool Registration for VS Code Language Model Tool API
 */

import * as vscode from 'vscode';
import { MCPClient } from '../mcpClient';
import { TestRailToolParams } from '../types';

/**
 * Register the TestRail MCP tool with VS Code
 */
export function registerTestRailTool(
  context: vscode.ExtensionContext,
  mcpClient: MCPClient,
  outputChannel: vscode.OutputChannel
): vscode.Disposable {
  
  const tool = vscode.lm.registerTool('testrail_mcp', new TestRailTool(mcpClient, outputChannel));

  return tool;
}

/**
 * TestRail Tool implementation
 */
class TestRailTool implements vscode.LanguageModelTool<Record<string, any>> {
  private mcpClient: MCPClient;
  private outputChannel: vscode.OutputChannel;

  constructor(mcpClient: MCPClient, outputChannel: vscode.OutputChannel) {
    this.mcpClient = mcpClient;
    this.outputChannel = outputChannel;
  }

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<Record<string, any>>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    try {
      const params = options.input as TestRailToolParams;
      this.outputChannel.appendLine(`[TestRailTool] Invoked with params: ${JSON.stringify(params)}`);

      // Validate required action parameter
      if (!params.action) {
        throw new Error('Missing required parameter: action');
      }

      // Map the action to the appropriate MCP tool and prepare arguments
      const { toolName, args } = mapActionToTool(params);
      
      this.outputChannel.appendLine(`[TestRailTool] Calling MCP tool: ${toolName} with args: ${JSON.stringify(args)}`);

      // Call the MCP server
      const result = await this.mcpClient.callTool(toolName, args);

      // Format the response
      const formattedResult = formatToolResult(result);
      
      this.outputChannel.appendLine(`[TestRailTool] Result: ${JSON.stringify(formattedResult)}`);

      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(formattedResult)
      ]);

    } catch (error) {
      const errorMessage = `TestRail MCP error: ${error instanceof Error ? error.message : String(error)}`;
      this.outputChannel.appendLine(`[TestRailTool] Error: ${errorMessage}`);
      
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(errorMessage)
      ]);
    }
  }
}

/**
 * Map action-based parameters to MCP tool names and arguments
 */
function mapActionToTool(params: TestRailToolParams): { toolName: string; args: Record<string, any> } {
  const { action, ...rest } = params;
  
  // Map common action names to MCP tool names
  const actionMap: Record<string, string> = {
    // Projects
    'list_projects': 'get_projects',
    'get_projects': 'get_projects',
    'get_project': 'get_project',
    'add_project': 'add_project',
    'create_project': 'add_project',
    'update_project': 'update_project',
    'delete_project': 'delete_project',
    
    // Cases
    'list_cases': 'get_cases',
    'get_cases': 'get_cases',
    'get_case': 'get_case',
    'get_test_case': 'get_case',
    'add_case': 'add_case',
    'create_case': 'add_case',
    'update_case': 'update_case',
    'delete_case': 'delete_case',
    
    // Sections
    'get_section': 'get_section',
    'get_sections': 'get_sections',
    'list_sections': 'get_sections',
    'add_section': 'add_section',
    'create_section': 'add_section',
    'update_section': 'update_section',
    'delete_section': 'delete_section',
    'move_section': 'move_section',
    
    // Runs
    'list_runs': 'get_runs',
    'get_runs': 'get_runs',
    'get_run': 'get_run',
    'get_test_run': 'get_run',
    'add_run': 'add_run',
    'create_run': 'add_run',
    'create_test_run': 'add_run',
    'update_run': 'update_run',
    'close_run': 'close_run',
    'delete_run': 'delete_run',
    
    // Results
    'get_results': 'get_results',
    'list_results': 'get_results',
    'add_result': 'add_result',
    'create_result': 'add_result',
    
    // Datasets
    'list_datasets': 'get_datasets',
    'get_datasets': 'get_datasets',
    'get_dataset': 'get_dataset',
    'add_dataset': 'add_dataset',
    'create_dataset': 'add_dataset',
    'update_dataset': 'update_dataset',
    'delete_dataset': 'delete_dataset'
  };

  const toolName = actionMap[action.toLowerCase()] || action;
  
  // Prepare arguments based on the tool
  const args = prepareToolArguments(toolName, rest);
  
  return { toolName, args };
}

/**
 * Prepare arguments for specific tools
 */
function prepareToolArguments(toolName: string, params: Record<string, any>): Record<string, any> {
  const args: Record<string, any> = {};
  
  // Map common parameter aliases
  if (params.test_case_id !== undefined) {
    args.case_id = params.test_case_id;
  }
  if (params.case_id !== undefined) {
    args.case_id = params.case_id;
  }
  if (params.test_run_id !== undefined) {
    args.run_id = params.test_run_id;
  }
  if (params.run_id !== undefined) {
    args.run_id = params.run_id;
  }
  
  // Copy remaining parameters
  for (const [key, value] of Object.entries(params)) {
    if (key !== 'test_case_id' && key !== 'test_run_id' && value !== undefined) {
      args[key] = value;
    }
  }
  
  return args;
}

/**
 * Format MCP tool result for display
 */
function formatToolResult(result: any): string {
  if (!result || !result.content) {
    return JSON.stringify(result, null, 2);
  }
  
  // Extract text content from MCP result
  const textContent = result.content
    .filter((item: any) => item.type === 'text')
    .map((item: any) => item.text)
    .join('\n\n');
  
  if (textContent) {
    try {
      // Try to parse and pretty-print JSON
      const parsed = JSON.parse(textContent);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // If not JSON, return as-is
      return textContent;
    }
  }
  
  return JSON.stringify(result, null, 2);
}
