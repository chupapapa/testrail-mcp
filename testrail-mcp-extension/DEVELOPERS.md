# Developer Guide for TestRail MCP Extension

This guide is for developers who want to understand, extend, or contribute to the TestRail MCP Tools extension.

## Project Structure

```
testrail-mcp-extension/
├── src/
│   ├── extension.ts          # Extension entry point & activation
│   ├── mcpClient.ts           # MCP server communication layer
│   ├── config.ts              # Configuration & credential management
│   ├── types.ts               # TypeScript type definitions
│   └── tools/
│       └── testrailTool.ts   # Tool registration & invocation
├── dist/                      # Compiled JavaScript output
├── .vscode/
│   ├── launch.json           # Debug configurations
│   └── tasks.json            # Build tasks
├── package.json              # Project metadata & dependencies
├── tsconfig.json             # TypeScript compiler options
└── .eslintrc.json            # ESLint rules
```

## Architecture Overview

### Component Flow

```
VS Code Extension Host
    ↓
extension.ts (activation)
    ↓
configManager.getConfig()
    ↓
MCPClient.connect()
    ↓
StdioClientTransport (spawns MCP server)
    ↓
registerTestRailTool()
    ↓
GitHub Copilot Chat (#testrail_mcp)
    ↓
TestRailTool.invoke()
    ↓
mcpClient.callTool()
    ↓
TestRail API
```

### Key Components

#### 1. extension.ts
**Purpose**: Extension lifecycle management

**Responsibilities**:
- Activate extension on startup
- Initialize configuration manager
- Create and manage MCP client
- Register commands and status bar
- Handle connection status updates

**Key Functions**:
- `activate()`: Entry point when extension loads
- `deactivate()`: Cleanup on unload
- `initializeConnection()`: Establish MCP connection
- `registerCommands()`: Register VS Code commands
- `updateStatusBar()`: Update connection status UI

#### 2. mcpClient.ts
**Purpose**: MCP server communication

**Responsibilities**:
- Spawn and manage MCP server process
- Handle stdio transport communication
- Maintain connection state
- List and call MCP tools
- Emit status change events

**Key Methods**:
- `connect()`: Establish connection to MCP server
- `disconnect()`: Close connection and cleanup
- `callTool(name, args)`: Invoke MCP tool
- `listTools()`: Discover available tools
- `getStatus()`: Get current connection state

**Status Flow**:
```
Disconnected → Connecting → Connected
                     ↓
                  Error
```

#### 3. config.ts
**Purpose**: Configuration and credential management

**Responsibilities**:
- Load workspace configuration
- Manage secure credential storage
- Validate configuration
- Prompt user for credentials

**Key Methods**:
- `getConfig()`: Retrieve complete configuration
- `setCredentials(user, key)`: Store credentials securely
- `clearCredentials()`: Remove stored credentials
- `promptForCredentials()`: Interactive credential setup

**Storage**:
- Server URL: VS Code settings (plaintext)
- Username/API Key: VS Code Secret Storage (encrypted)

#### 4. tools/testrailTool.ts
**Purpose**: Tool registration and invocation

**Responsibilities**:
- Implement LanguageModelTool interface
- Map action names to MCP tools
- Transform parameters
- Format results for display

**Key Functions**:
- `registerTestRailTool()`: Register with VS Code
- `TestRailTool.invoke()`: Handle tool invocation
- `mapActionToTool()`: Translate actions to MCP tools
- `prepareToolArguments()`: Transform parameters
- `formatToolResult()`: Format JSON responses

**Action Mapping**:
```typescript
{
  'list_projects': 'get_projects',
  'get_case': 'get_case',
  'create_run': 'add_run',
  // ... 40+ mappings
}
```

## Development Setup

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- VS Code 1.95.0 or higher
- TypeScript 5.3.0 or higher

### Setup Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/chupapapa/testrail-mcp.git
   cd testrail-mcp/testrail-mcp-extension
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Compile TypeScript**:
   ```bash
   npm run compile
   ```

4. **Watch for changes**:
   ```bash
   npm run watch
   ```

5. **Run linter**:
   ```bash
   npm run lint
   ```

## Debugging

### Launch in Extension Development Host

1. Open the extension folder in VS Code
2. Press F5 or Run → Start Debugging
3. A new VS Code window opens with the extension loaded
4. Set breakpoints in TypeScript source files
5. Test the extension in the Extension Development Host

### Debug Configuration

```json
{
  "name": "Run Extension",
  "type": "extensionHost",
  "request": "launch",
  "args": ["--extensionDevelopmentPath=${workspaceFolder}"],
  "outFiles": ["${workspaceFolder}/dist/**/*.js"]
}
```

### View Logs

1. Open Output panel (View → Output)
2. Select "TestRail MCP" from dropdown
3. Enable debug mode in settings for verbose logs

### Common Debug Points

- `extension.ts:activate()` - Extension startup
- `mcpClient.ts:connect()` - MCP connection
- `testrailTool.ts:invoke()` - Tool invocation
- `config.ts:getConfig()` - Configuration loading

## Adding New Features

### Adding a New Command

1. **Define in package.json**:
   ```json
   {
     "commands": [{
       "command": "testrailMcp.myNewCommand",
       "title": "TestRail MCP: My New Command"
     }]
   }
   ```

2. **Register in extension.ts**:
   ```typescript
   context.subscriptions.push(
     vscode.commands.registerCommand('testrailMcp.myNewCommand', async () => {
       // Implementation
     })
   );
   ```

### Adding Support for New MCP Tools

If the TestRail MCP server adds new tools:

1. **Update action mapping** in `testrailTool.ts`:
   ```typescript
   const actionMap: Record<string, string> = {
     // Existing mappings...
     'my_new_action': 'new_mcp_tool_name'
   };
   ```

2. **Add parameter transformation** if needed:
   ```typescript
   function prepareToolArguments(toolName: string, params: Record<string, any>) {
     if (toolName === 'new_mcp_tool_name') {
       // Transform parameters
     }
     // ... existing logic
   }
   ```

3. **Update documentation**:
   - Add to README.md
   - Add examples to EXAMPLES.md

### Adding Configuration Settings

1. **Define in package.json**:
   ```json
   {
     "configuration": {
       "properties": {
         "testrailMcp.myNewSetting": {
           "type": "string",
           "default": "value",
           "description": "Description of setting"
         }
       }
     }
   }
   ```

2. **Access in code**:
   ```typescript
   const config = vscode.workspace.getConfiguration('testrailMcp');
   const myValue = config.get<string>('myNewSetting');
   ```

## Testing

### Manual Testing Checklist

- [ ] Extension activates without errors
- [ ] Configuration command prompts correctly
- [ ] Credentials are stored securely
- [ ] Connection establishes successfully
- [ ] Status bar updates correctly
- [ ] Tool appears in Copilot Chat
- [ ] Tool invocations work correctly
- [ ] Reconnect command functions
- [ ] Test connection command works
- [ ] Error messages are user-friendly
- [ ] Debug logs are helpful

### Testing with Mock MCP Server

For testing without a real TestRail instance:

1. Create a mock MCP server script
2. Update `mcpServerPath` to point to mock
3. Test extension functionality

Example mock (pseudocode):
```python
# mock_mcp_server.py
def handle_tool_call(tool_name, args):
    return {"content": [{"type": "text", "text": "Mock response"}]}
```

### Integration Testing

Test with actual TestRail MCP server:

1. Set up TestRail instance or use test environment
2. Configure extension with test credentials
3. Verify each operation type:
   - List operations (projects, cases, runs)
   - Get operations (single entity details)
   - Create operations (add project, case, run)
   - Update operations (modify entities)
   - Delete operations (remove entities)

## Code Style

### TypeScript Guidelines

- Use strict mode (enabled in tsconfig.json)
- Prefer `const` over `let`
- Use async/await over promises
- Add JSDoc comments for public APIs
- Use meaningful variable names

### Example:
```typescript
/**
 * Retrieve configuration from VS Code settings
 * @returns Complete configuration or null if not configured
 */
async getConfig(): Promise<TestRailMCPConfig | null> {
  const config = vscode.workspace.getConfiguration('testrailMcp');
  // Implementation
}
```

### Error Handling

Always handle errors gracefully:

```typescript
try {
  await mcpClient.connect();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  vscode.window.showErrorMessage(`Connection failed: ${message}`);
  outputChannel.appendLine(`Error: ${message}`);
}
```

### Logging

Use the output channel for debugging:

```typescript
private log(message: string): void {
  const timestamp = new Date().toISOString();
  this.outputChannel.appendLine(`[${timestamp}] [Component] ${message}`);
}
```

## Building and Packaging

### Development Build

```bash
npm run compile
```

Output: `dist/` directory

### Production Build

```bash
npm run vscode:prepublish
```

This runs compile before packaging.

### Create VSIX Package

```bash
npm run package
```

Output: `testrail-mcp-extension-X.Y.Z.vsix`

### Package Contents

Check what's included:
```bash
unzip -l testrail-mcp-extension-0.1.0.vsix
```

Exclusions are defined in `.vscodeignore`.

## Publishing

### VS Code Marketplace

1. **Create publisher account**:
   - Visit: https://marketplace.visualstudio.com/manage
   - Create personal access token in Azure DevOps

2. **Login**:
   ```bash
   npx vsce login <publisher-name>
   ```

3. **Publish**:
   ```bash
   npx vsce publish
   ```

4. **Automated publishing** (GitHub Actions):
   ```yaml
   - name: Publish to Marketplace
     run: npx vsce publish -p ${{ secrets.VSCE_TOKEN }}
   ```

## Contributing

### Contribution Workflow

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run linter and compiler
5. Test manually
6. Submit pull request

### Pull Request Checklist

- [ ] Code compiles without errors
- [ ] Linter passes without warnings
- [ ] No new security vulnerabilities
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Manual testing completed
- [ ] Commit messages are clear

## Dependencies

### Production Dependencies

- `@modelcontextprotocol/sdk`: MCP client and transport
  - Version: ^1.0.4
  - Purpose: Communicate with MCP servers

### Development Dependencies

- `@types/node`: Node.js type definitions
- `@types/vscode`: VS Code API type definitions
- `typescript`: TypeScript compiler
- `eslint`: Code linting
- `@vscode/vsce`: Extension packaging tool

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update @modelcontextprotocol/sdk

# Update all packages (be careful!)
npm update
```

After updating, test thoroughly!

## Troubleshooting Development Issues

### TypeScript Compilation Errors

**Issue**: `Cannot find module '@modelcontextprotocol/sdk'`
**Solution**: 
```bash
npm install
rm -rf node_modules package-lock.json
npm install
```

### Extension Not Loading

**Issue**: Extension doesn't appear in Extension Development Host
**Solution**:
1. Check `package.json` activation events
2. Verify `main` points to correct file
3. Check console for errors (Help → Toggle Developer Tools)

### Tool Not Registering

**Issue**: `#testrail_mcp` doesn't appear in Copilot Chat
**Solution**:
1. Verify VS Code version >= 1.95.0
2. Check that tool is registered in activation
3. Ensure connection is established
4. Look for errors in console/output

### MCP Connection Fails

**Issue**: Cannot connect to MCP server
**Solution**:
1. Verify MCP server is installed
2. Check server path in settings
3. Enable debug mode
4. Check Output panel for errors
5. Test server manually: `uvx testrail-mcp`

## Resources

### Documentation

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Language Model API](https://code.visualstudio.com/api/extension-guides/language-model)
- [MCP Specification](https://github.com/modelcontextprotocol/specification)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

### Examples

- [VS Code Extension Samples](https://github.com/microsoft/vscode-extension-samples)
- [Language Model Tools Sample](https://github.com/microsoft/vscode-extension-samples/tree/main/lm-tools-sample)

### Community

- [VS Code Extension Development](https://code.visualstudio.com/api/get-started/your-first-extension)
- [GitHub Copilot for Extensions](https://code.visualstudio.com/docs/copilot/copilot-extensibility-overview)

## Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

## License

MIT License - See [LICENSE](LICENSE) for details.
