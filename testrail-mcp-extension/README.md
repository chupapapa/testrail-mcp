# TestRail MCP Tools for VS Code

A VS Code extension that integrates TestRail test management system with GitHub Copilot Chat through the Model Context Protocol (MCP).

## Features

- **Seamless Integration**: Access TestRail directly from GitHub Copilot Chat using the `#testrail_mcp` tool
- **Comprehensive Test Management**: Query test cases, test runs, test results, and project information
- **Secure Credential Storage**: Store TestRail credentials securely using VS Code's secret storage
- **Real-time Connection Status**: Monitor your TestRail MCP connection status from the status bar
- **Full TestRail API Coverage**: Supports all TestRail MCP server operations

## Requirements

- VS Code version 1.95.0 or higher
- TestRail MCP server installed (via `uvx testrail-mcp` or local installation)
- TestRail account with API access enabled
- GitHub Copilot subscription (for Copilot Chat integration)

## Installation

### Install TestRail MCP Server

The extension requires the TestRail MCP server to be installed. Install it using uvx:

```bash
uvx testrail-mcp
```

Or install it locally:

```bash
git clone https://github.com/yourusername/testrail-mcp.git
cd testrail-mcp
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -e .
```

### Install the Extension

1. Download the `.vsix` file from the releases page
2. Open VS Code
3. Go to Extensions view (Ctrl+Shift+X)
4. Click the "..." menu at the top
5. Select "Install from VSIX..."
6. Choose the downloaded `.vsix` file

## Configuration

### Step 1: Configure TestRail Connection

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Run `TestRail MCP: Configure Credentials`
3. Enter your TestRail server URL (e.g., `https://your-instance.testrail.io`)
4. Enter your TestRail username (email address)
5. Enter your TestRail API key

**Note**: To generate an API key in TestRail:
- Log in to TestRail
- Go to "My Settings" > "API Keys"
- Create a new API key

### Step 2: Configure MCP Server Path (Optional)

If you installed the MCP server locally (not using uvx), update the settings:

1. Open Settings (Ctrl+,)
2. Search for "TestRail MCP"
3. Update the following settings:
   - `testrailMcp.mcpServerPath`: Path to your Python executable or script
   - `testrailMcp.mcpServerArgs`: Arguments to start the server (e.g., `["-m", "testrail_mcp"]`)

### Settings Reference

- `testrailMcp.serverUrl`: TestRail server URL
- `testrailMcp.mcpServerPath`: Path to MCP server executable (default: `uvx`)
- `testrailMcp.mcpServerArgs`: Arguments for MCP server (default: `["testrail-mcp"]`)
- `testrailMcp.debug`: Enable debug logging (default: `false`)

## Usage

### Using with GitHub Copilot Chat

Once configured, you can use the `#testrail_mcp` tool in GitHub Copilot Chat:

#### List all projects
```
@workspace Using #testrail_mcp, list all projects
```

#### Get test case details
```
@workspace Using #testrail_mcp, get details of test case ID 123
```

#### Create a test run
```
@workspace Using #testrail_mcp, create a test run for project 5, suite 2, named "Sprint 10 Tests"
```

#### Add test result
```
@workspace Using #testrail_mcp, add a passed result for test ID 456 with comment "All tests passed"
```

### Available Actions

The `#testrail_mcp` tool supports the following actions:

#### Projects
- `list_projects` / `get_projects` - List all projects
- `get_project` - Get project details (requires `project_id`)
- `add_project` / `create_project` - Create a new project
- `update_project` - Update project details
- `delete_project` - Delete a project

#### Test Cases
- `list_cases` / `get_cases` - List test cases (requires `project_id`, optional `suite_id`)
- `get_case` / `get_test_case` - Get test case details (requires `case_id`)
- `add_case` / `create_case` - Create a test case
- `update_case` - Update a test case
- `delete_case` - Delete a test case

#### Sections
- `get_section` - Get section details
- `get_sections` / `list_sections` - List sections for a project
- `add_section` / `create_section` - Create a section
- `update_section` - Update a section
- `delete_section` - Delete a section
- `move_section` - Move a section

#### Test Runs
- `list_runs` / `get_runs` - List test runs (requires `project_id`)
- `get_run` / `get_test_run` - Get test run details (requires `run_id`)
- `add_run` / `create_run` / `create_test_run` - Create a test run
- `update_run` - Update a test run
- `close_run` - Close a test run
- `delete_run` - Delete a test run

#### Test Results
- `get_results` / `list_results` - Get test results (requires `test_id`)
- `add_result` / `create_result` - Add a test result (requires `test_id`, `status_id`)

#### Datasets
- `list_datasets` / `get_datasets` - List datasets (requires `project_id`)
- `get_dataset` - Get dataset details (requires `dataset_id`)
- `add_dataset` / `create_dataset` - Create a dataset
- `update_dataset` - Update a dataset
- `delete_dataset` - Delete a dataset

### Example Parameters

Here are some example parameter combinations:

```typescript
// List all projects
{ action: "list_projects" }

// Get a specific project
{ action: "get_project", project_id: 1 }

// Get test cases for a project
{ action: "get_cases", project_id: 5 }

// Get a specific test case
{ action: "get_case", case_id: 123 }

// Create a test run
{
  action: "create_test_run",
  project_id: 5,
  suite_id: 2,
  name: "Sprint 10 Regression Tests",
  description: "Testing login and registration features",
  include_all: true
}

// Add a test result (1=Passed, 5=Failed)
{
  action: "add_result",
  test_id: 456,
  status_id: 1,
  comment: "Test passed successfully",
  elapsed: "2m 30s"
}
```

## Commands

The extension provides the following commands:

- **TestRail MCP: Configure Credentials** - Set up or update TestRail credentials
- **TestRail MCP: Test Connection** - Test the connection to TestRail
- **TestRail MCP: Reconnect** - Reconnect to the TestRail MCP server

Access commands via Command Palette (Ctrl+Shift+P / Cmd+Shift+P).

## Status Bar

The extension shows its connection status in the status bar:

- ✅ **TestRail MCP** - Connected successfully
- 🔄 **TestRail MCP** - Connecting...
- ❌ **TestRail MCP** - Connection error
- 🔌 **TestRail MCP** - Disconnected

Click the status bar item to reconnect.

## Troubleshooting

### Extension not connecting

1. Check that the TestRail MCP server is installed:
   ```bash
   uvx testrail-mcp --help
   ```

2. Verify your credentials:
   - Run `TestRail MCP: Configure Credentials` command
   - Make sure your API key is correct

3. Check the output:
   - Open Output panel (View > Output)
   - Select "TestRail MCP" from the dropdown
   - Review the logs for errors

4. Enable debug mode:
   - Open Settings
   - Set `testrailMcp.debug` to `true`
   - Restart the extension
   - Check output for detailed logs

### Tool not appearing in Copilot Chat

1. Ensure you have GitHub Copilot subscription
2. Restart VS Code after installing the extension
3. Check that the extension is activated (look for status bar item)
4. Verify connection status shows as "Connected"

### Authentication errors

1. Verify your TestRail URL is correct (should include https://)
2. Check that your username is the email address you use for TestRail
3. Ensure your API key is valid (generate a new one in TestRail if needed)
4. Verify your TestRail account has API access enabled

## Development

### Building from Source

```bash
cd testrail-mcp-extension
npm install
npm run compile
```

### Packaging

```bash
npm run package
```

This will create a `.vsix` file that can be installed in VS Code.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT

## Related Projects

- [TestRail MCP Server](https://github.com/chupapapa/testrail-mcp) - The underlying MCP server
- [Model Context Protocol](https://github.com/modelcontextprotocol) - MCP specification and SDKs
