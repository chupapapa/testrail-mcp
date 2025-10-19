# Architecture Documentation

## Overview

The TestRail MCP Tools extension is a VS Code extension that bridges TestRail's test management capabilities with GitHub Copilot Chat through the Model Context Protocol (MCP). This document describes the architectural design, component interactions, and key design decisions.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VS Code Extension Host                       │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    Extension (extension.ts)                 │   │
│  │                                                             │   │
│  │  • Lifecycle Management (activate/deactivate)              │   │
│  │  • Command Registration                                     │   │
│  │  • Status Bar Management                                    │   │
│  │  • Output Channel                                           │   │
│  └──────────────┬──────────────────────────────┬──────────────┘   │
│                 │                               │                   │
│    ┌────────────▼──────────────┐   ┌───────────▼────────────────┐  │
│    │   ConfigManager           │   │     MCPClient              │  │
│    │   (config.ts)             │   │     (mcpClient.ts)         │  │
│    │                           │   │                            │  │
│    │  • Settings Management    │   │  • Connection Lifecycle    │  │
│    │  • Credential Storage     │   │  • MCP Communication       │  │
│    │  • Validation             │   │  • Tool Discovery          │  │
│    └────────────┬──────────────┘   └───────────┬────────────────┘  │
│                 │                               │                   │
│                 │                               │                   │
│    ┌────────────▼───────────────────────────────▼────────────────┐  │
│    │              VS Code Secret Storage API                     │  │
│    └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│    ┌─────────────────────────────────────────────────────────────┐  │
│    │         TestRail Tool (tools/testrailTool.ts)               │  │
│    │                                                             │  │
│    │  • LanguageModelTool Implementation                        │  │
│    │  • Action to MCP Tool Mapping                              │  │
│    │  • Parameter Transformation                                │  │
│    │  • Result Formatting                                       │  │
│    └────────────┬────────────────────────────────────────────────┘  │
│                 │                                                    │
└─────────────────┼────────────────────────────────────────────────────┘
                  │
                  │ Language Model Tool API
                  │
┌─────────────────▼────────────────────────────────────────────────────┐
│                    GitHub Copilot Chat                               │
│                                                                      │
│  User: @workspace Using #testrail_mcp, list all projects           │
└─────────────────┬────────────────────────────────────────────────────┘
                  │
                  │ Tool Invocation
                  │
┌─────────────────▼────────────────────────────────────────────────────┐
│                  MCP Client (mcpClient.ts)                           │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              StdioClientTransport                              │ │
│  │                                                                │ │
│  │  • Spawns MCP Server Process                                  │ │
│  │  • Manages stdio Communication                                │ │
│  │  • Handles Process Lifecycle                                  │ │
│  └────────────┬───────────────────────────────────────────────────┘ │
└───────────────┼──────────────────────────────────────────────────────┘
                │
                │ stdio (stdin/stdout)
                │ Environment: TESTRAIL_URL, TESTRAIL_USERNAME, TESTRAIL_API_KEY
                │
┌───────────────▼──────────────────────────────────────────────────────┐
│              TestRail MCP Server (Python/FastMCP)                    │
│                                                                      │
│  • Tool Implementations (get_projects, get_case, add_run, etc.)    │
│  • TestRail API Client                                             │
│  • MCP Protocol Handler                                            │
└───────────────┬──────────────────────────────────────────────────────┘
                │
                │ HTTPS/REST API
                │
┌───────────────▼──────────────────────────────────────────────────────┐
│                        TestRail Server                               │
│                                                                      │
│  • Projects, Cases, Sections, Runs, Results, Datasets              │
└──────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Extension Entry Point (`extension.ts`)

**Purpose**: Manages the extension lifecycle and coordinates all components.

**Responsibilities**:
- Extension activation and deactivation
- Component initialization
- Command registration
- UI element management (status bar, output channel)
- Connection state orchestration

**Key Functions**:
```typescript
activate(context: ExtensionContext)
  ↓
  • Create OutputChannel
  • Create StatusBarItem
  • Initialize ConfigManager
  • Register Commands
  • Initialize Connection (if configured)
  • Register TestRail Tool

deactivate()
  ↓
  • Disconnect MCP Client
  • Cleanup resources
```

**State Management**:
- Global module variables for singleton instances
- Subscription-based cleanup via VS Code disposables
- Event-driven status updates

### 2. Configuration Manager (`config.ts`)

**Purpose**: Manages extension configuration and secure credential storage.

**Architecture**:
```
┌──────────────────────────────────────────┐
│         ConfigManager                    │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  VS Code Workspace Configuration   │ │
│  │  • serverUrl (plaintext)           │ │
│  │  • mcpServerPath                   │ │
│  │  • mcpServerArgs                   │ │
│  │  • debug                           │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  VS Code Secret Storage (encrypted)│ │
│  │  • username                        │ │
│  │  • apiKey                          │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

**Security Model**:
- Sensitive credentials stored in VS Code Secret Storage (encrypted at rest)
- Server URL and non-sensitive settings in workspace configuration
- Credentials only exposed to MCP server process via environment variables
- No plaintext credential storage or logging

**Methods**:
- `getConfig()`: Retrieves complete configuration
- `setCredentials()`: Stores credentials securely
- `clearCredentials()`: Removes stored credentials
- `promptForCredentials()`: Interactive setup wizard
- `isConfigured()`: Validates configuration completeness

### 3. MCP Client (`mcpClient.ts`)

**Purpose**: Handles communication with the TestRail MCP server.

**Architecture**:
```
MCPClient
  │
  ├── Connection Management
  │   • connect()
  │   • disconnect()
  │   • reconnect logic
  │
  ├── Transport Layer (StdioClientTransport)
  │   • Process spawning
  │   • stdio stream management
  │   • Environment injection
  │
  ├── MCP Protocol
  │   • Client initialization
  │   • Tool discovery (listTools)
  │   • Tool invocation (callTool)
  │
  └── State Management
      • ConnectionStatus enum
      • Event emission (onStatusChange)
      • Error handling
```

**Connection Lifecycle**:
```
Disconnected
    │
    │ connect()
    ↓
Connecting
    │
    ├─→ Success → Connected
    │
    └─→ Failure → Error
                    │
                    └─→ reconnect() → Connecting
```

**Communication Flow**:
1. Spawn MCP server process with environment variables
2. Establish stdio transport (stdin/stdout)
3. Initialize MCP client with capabilities
4. Connect transport to client
5. Discover available tools
6. Ready for tool invocations

**Error Handling**:
- Process errors captured and logged
- Connection failures trigger status updates
- Automatic cleanup on errors
- User-friendly error messages

### 4. TestRail Tool (`tools/testrailTool.ts`)

**Purpose**: Implements VS Code's LanguageModelTool interface to expose TestRail functionality to Copilot Chat.

**Architecture**:
```
TestRailTool (implements LanguageModelTool)
  │
  ├── Tool Registration
  │   • vscode.lm.registerTool('testrail_mcp', tool)
  │   • Returns Disposable for cleanup
  │
  ├── Invocation Handler
  │   • invoke(options, token): Promise<LanguageModelToolResult>
  │   • Receives input from Copilot Chat
  │   • Returns formatted results
  │
  ├── Action Mapping
  │   • mapActionToTool(params)
  │   • Maps user-friendly actions to MCP tool names
  │   • 40+ action mappings
  │
  ├── Parameter Transformation
  │   • prepareToolArguments(toolName, params)
  │   • Handles parameter aliases
  │   • Validates required fields
  │
  └── Result Formatting
      • formatToolResult(result)
      • JSON pretty-printing
      • Error message formatting
```

**Action Mapping Examples**:
```typescript
{
  'list_projects' → 'get_projects',
  'get_case' → 'get_case',
  'create_run' → 'add_run',
  'test_case_id' → 'case_id' (parameter alias)
}
```

**Invocation Flow**:
```
Copilot Chat: "@workspace Using #testrail_mcp, list all projects"
    ↓
TestRailTool.invoke()
    ↓
Extract parameters: { action: "list_projects" }
    ↓
mapActionToTool() → { toolName: "get_projects", args: {} }
    ↓
mcpClient.callTool("get_projects", {})
    ↓
MCP Server → TestRail API
    ↓
Format response as JSON
    ↓
Return LanguageModelToolResult to Copilot
```

### 5. Type System (`types.ts`)

**Purpose**: Provides TypeScript type definitions for type safety and IDE support.

**Key Types**:

```typescript
TestRailMCPConfig
  ├── serverUrl: string
  ├── username: string
  ├── apiKey: string
  ├── mcpServerPath: string
  ├── mcpServerArgs: string[]
  └── debug: boolean

ConnectionStatus (enum)
  ├── Disconnected
  ├── Connecting
  ├── Connected
  └── Error

TestRailToolParams
  ├── action: string (required)
  ├── project_id?: number
  ├── case_id?: number
  ├── run_id?: number
  ├── status_id?: number
  └── [key: string]: any (extensible)

MCPToolResult
  └── content: Array<{type, text?, data?, mimeType?}>
```

## Data Flow

### User Query Flow

```
1. User types in Copilot Chat:
   "@workspace Using #testrail_mcp, get test case 123"

2. GitHub Copilot recognizes #testrail_mcp tool

3. Copilot invokes TestRailTool.invoke() with:
   { action: "get_case", case_id: 123 }

4. TestRailTool maps action to MCP tool:
   "get_case" → "get_case"

5. TestRailTool calls MCPClient.callTool():
   mcpClient.callTool("get_case", { case_id: 123 })

6. MCPClient sends request via stdio to MCP server

7. MCP Server calls TestRail API:
   GET https://instance.testrail.io/api/v2/get_case/123

8. TestRail returns test case data

9. MCP Server formats as MCP response

10. MCPClient receives response

11. TestRailTool formats as JSON string

12. Copilot displays result to user
```

### Configuration Flow

```
1. User runs: "TestRail MCP: Configure Credentials"

2. ConfigManager.promptForCredentials()
   ├── Prompt for server URL → store in workspace settings
   ├── Prompt for username → store in Secret Storage
   └── Prompt for API key → store in Secret Storage

3. User runs: "TestRail MCP: Reconnect"

4. ConfigManager.getConfig()
   ├── Read workspace settings (serverUrl, mcpServerPath, etc.)
   └── Read Secret Storage (username, apiKey)

5. MCPClient.connect()
   ├── Prepare environment variables
   ├── Spawn MCP server process
   └── Establish stdio transport

6. Status bar updates: "✅ TestRail MCP"
```

## Communication Protocols

### VS Code ↔ Extension

- **Event-driven**: VS Code events trigger extension actions
- **Command-based**: User commands invoke registered handlers
- **Disposable pattern**: Resources cleaned up via subscriptions

### Extension ↔ MCP Server

- **Protocol**: Model Context Protocol (JSON-RPC over stdio)
- **Transport**: StdioClientTransport
- **Messages**:
  - `initialize`: Client capabilities
  - `tools/list`: Discover available tools
  - `tools/call`: Invoke a specific tool
  - `close`: Shutdown server

**Example Tool Call**:
```json
Request:
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_projects",
    "arguments": {}
  }
}

Response:
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "[{\"id\": 1, \"name\": \"Project 1\"}, ...]"
      }
    ]
  }
}
```

### MCP Server ↔ TestRail

- **Protocol**: HTTPS/REST
- **Authentication**: Basic Auth (username:apiKey)
- **Format**: JSON

## Design Patterns

### 1. Singleton Pattern

- Extension components (mcpClient, configManager) are module-level singletons
- Ensures single connection and configuration instance

### 2. Factory Pattern

- ConfigManager creates TestRailMCPConfig from multiple sources
- Tool registration creates appropriate tool instances

### 3. Strategy Pattern

- Action mapping allows flexible tool name resolution
- Parameter transformation adapts to different tool requirements

### 4. Observer Pattern

- MCPClient emits status change events
- Extension listens and updates UI accordingly

### 5. Facade Pattern

- TestRailTool provides simplified interface to MCP complexity
- MCPClient abstracts transport and protocol details

## Security Architecture

### Threat Model

**Protected Assets**:
- TestRail API credentials (username, API key)
- TestRail data in transit

**Threats Mitigated**:
1. **Credential exposure**: Secret Storage API encryption
2. **Network interception**: HTTPS to TestRail
3. **Process injection**: Isolated MCP server process
4. **Log leakage**: Credentials excluded from logs

**Security Boundaries**:
```
User Space (VS Code Extension)
    │ Encrypted credential storage
    ├─────────────────────────────────
    │ Environment variables (process spawn)
System Process (MCP Server)
    │ HTTPS
    ├─────────────────────────────────
Network (TestRail API)
```

### Credential Flow

```
1. User enters credentials via UI

2. Stored in VS Code Secret Storage
   • Platform-specific encryption (Keychain/Credential Manager/Secret Service)
   • Not accessible to other extensions

3. Retrieved when spawning MCP server

4. Injected as environment variables
   • TESTRAIL_URL
   • TESTRAIL_USERNAME
   • TESTRAIL_API_KEY

5. MCP server reads from environment

6. Used for TestRail API authentication

7. Never logged or displayed
```

## Error Handling Strategy

### Layered Error Handling

```
Layer 1: TestRail API
  ↓ (HTTP errors, auth failures)
Layer 2: MCP Server
  ↓ (Tool execution errors)
Layer 3: MCP Client
  ↓ (Connection errors, protocol errors)
Layer 4: TestRail Tool
  ↓ (Invocation errors, parameter errors)
Layer 5: Extension
  ↓ (Configuration errors, activation errors)
Layer 6: User Interface
  • Error messages
  • Status bar indicators
  • Output channel logs
```

### Error Recovery

**Connection Errors**:
- Automatic status update to Error state
- User can manually reconnect
- Helpful error messages with troubleshooting steps

**Tool Invocation Errors**:
- Graceful failure with error message
- No extension crash
- Detailed logs in output channel

**Configuration Errors**:
- Validation before connection attempts
- Clear prompts for missing configuration
- Guided setup process

## Performance Considerations

### Connection Management

- **Lazy initialization**: Connect only when configured
- **Persistent connection**: Reuse MCP server process
- **Async operations**: Non-blocking UI updates

### Tool Invocations

- **Direct pass-through**: Minimal processing overhead
- **Efficient JSON parsing**: Native JavaScript JSON methods
- **Streaming**: Stdio transport enables efficient data transfer

### Memory Management

- **Disposable pattern**: Proper cleanup on deactivation
- **Event listener cleanup**: Unsubscribe on disconnect
- **Process termination**: Clean MCP server shutdown

## Extensibility

### Adding New Actions

1. Add to `actionMap` in testrailTool.ts
2. Optional: Add parameter transformation logic
3. No other changes required (MCP server defines tools)

### Supporting New MCP Servers

The architecture is MCP-server-agnostic:
1. Update configuration for server path/args
2. Tool registration discovers available tools
3. Action mapping can be customized per server

### Custom Transport

Current: StdioClientTransport
Future possibilities:
- SSE (Server-Sent Events)
- WebSocket
- HTTP

Requires: Implement new transport in mcpClient.ts

## Testing Strategy

### Component Testing

- **ConfigManager**: Mock Secret Storage API
- **MCPClient**: Mock transport and process
- **TestRailTool**: Mock MCP client
- **Extension**: Mock VS Code APIs

### Integration Testing

- **End-to-end**: Real MCP server with mock TestRail
- **Connection flow**: Verify complete lifecycle
- **Tool invocations**: Test all action mappings

### Manual Testing

- Extension activation in VS Code
- Credential configuration flow
- Tool usage in Copilot Chat
- Error scenarios and recovery

## Dependencies

### Runtime Dependencies

```
@modelcontextprotocol/sdk (^1.0.4)
  ├── Client: MCP protocol client
  └── StdioClientTransport: stdio communication

VS Code API (^1.95.0)
  ├── Extension API
  ├── Language Model API
  └── Secret Storage API
```

### Development Dependencies

```
TypeScript (^5.3.0)
  • Type checking and compilation

ESLint (^8.x)
  • Code quality and style

@vscode/vsce (^2.22.0)
  • Extension packaging
```

## Deployment Architecture

### Package Structure

```
testrail-mcp-extension-0.1.0.vsix
├── extension.vsixmanifest (metadata)
├── package.json (manifest)
├── dist/ (compiled JavaScript)
│   ├── extension.js
│   ├── mcpClient.js
│   ├── config.js
│   ├── types.js
│   └── tools/testrailTool.js
├── LICENSE
└── README.md
```

### Installation Flow

```
1. User downloads VSIX file

2. VS Code installs extension
   ├── Extract to extensions directory
   ├── Validate manifest
   └── Register activation events

3. Extension activates on startup (onStartupFinished)

4. User configures credentials

5. Extension ready for use
```

## Future Architecture Considerations

### Scalability

- **Multiple MCP Servers**: Support connecting to multiple servers simultaneously
- **Connection Pooling**: Reuse connections for performance
- **Caching**: Cache TestRail data for offline access

### Monitoring

- **Telemetry**: Usage statistics and error reporting (opt-in)
- **Performance Metrics**: Track invocation times
- **Health Checks**: Periodic connection validation

### Multi-tenancy

- **Workspace-specific configs**: Different TestRail instances per workspace
- **Profile management**: Multiple credential sets
- **Team sharing**: Shared configuration templates

## Conclusion

The TestRail MCP Tools extension demonstrates a clean, layered architecture that:
- Separates concerns effectively
- Maintains security best practices
- Provides extensibility for future enhancements
- Follows VS Code extension guidelines
- Leverages MCP protocol standards

The architecture enables seamless integration between TestRail and GitHub Copilot Chat while maintaining security, performance, and user experience.
