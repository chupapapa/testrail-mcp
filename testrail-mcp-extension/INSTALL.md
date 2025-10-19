# Installation Guide for TestRail MCP Tools

This guide will walk you through installing and configuring the TestRail MCP Tools extension for VS Code.

## Prerequisites

Before installing the extension, ensure you have the following:

1. **VS Code 1.95.0 or higher**
   - Check your version: Help > About
   - Download latest: https://code.visualstudio.com/download

2. **TestRail MCP Server**
   - Install via uvx (recommended):
     ```bash
     uvx testrail-mcp
     ```
   - Or install locally:
     ```bash
     git clone https://github.com/chupapapa/testrail-mcp.git
     cd testrail-mcp
     python -m venv .venv
     source .venv/bin/activate  # On Windows: .venv\Scripts\activate
     pip install -e .
     ```

3. **TestRail Account**
   - Access to a TestRail instance
   - API access enabled
   - API key generated (My Settings > API Keys)

4. **GitHub Copilot Subscription** (for Copilot Chat integration)

## Installation Steps

### Step 1: Install the Extension

#### Option A: From VSIX File (Recommended for now)

1. Download `testrail-mcp-extension-0.1.0.vsix` from the releases
2. Open VS Code
3. Go to Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
4. Click the "..." menu at the top right
5. Select "Install from VSIX..."
6. Navigate to and select the downloaded `.vsix` file
7. Click "Install"
8. Restart VS Code when prompted

#### Option B: Build from Source

```bash
cd testrail-mcp-extension
npm install
npm run compile
npm run package
```

Then install the generated `.vsix` file using Option A.

### Step 2: Configure TestRail Connection

After installation, you'll see the TestRail MCP status in the status bar (bottom right).

1. **Open Command Palette**
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   
2. **Run Configuration Command**
   - Type: `TestRail MCP: Configure Credentials`
   - Press Enter

3. **Enter TestRail Server URL**
   - Example: `https://your-company.testrail.io`
   - Must include `https://`
   - Press Enter

4. **Enter TestRail Username**
   - Use your TestRail email address
   - Example: `john.doe@company.com`
   - Press Enter

5. **Enter TestRail API Key**
   - To get your API key:
     - Log in to TestRail
     - Go to "My Settings" (top right, click your name)
     - Click "API Keys" tab
     - Click "Add Key" to generate a new key
     - Copy the key
   - Paste the key in VS Code
   - Press Enter

6. **Verify Connection**
   - The status bar should change to "✅ TestRail MCP"
   - If you see "❌ TestRail MCP", check the output:
     - View > Output
     - Select "TestRail MCP" from the dropdown
     - Look for error messages

### Step 3: Test the Connection

1. **Open Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. **Run**: `TestRail MCP: Test Connection`
3. **Expected Result**: "Connection test successful" message

If the test fails:
- Verify your credentials are correct
- Check that TestRail URL is accessible
- Ensure API access is enabled in TestRail
- Check the Output panel for detailed errors

### Step 4: Using with GitHub Copilot Chat

Once configured, you can use the `#testrail_mcp` tool in Copilot Chat:

1. Open Copilot Chat panel
2. Type a query using the `#testrail_mcp` tool:
   ```
   @workspace Using #testrail_mcp, list all projects
   ```

3. Press Enter and wait for the response

## Configuration Settings

You can customize the extension behavior in VS Code settings:

1. Open Settings (`Ctrl+,` / `Cmd+,`)
2. Search for "TestRail MCP"
3. Available settings:

### `testrailMcp.serverUrl`
- **Type**: String
- **Description**: TestRail server URL
- **Example**: `https://your-instance.testrail.io`
- **Note**: Set via "Configure Credentials" command

### `testrailMcp.mcpServerPath`
- **Type**: String
- **Default**: `uvx`
- **Description**: Path to MCP server executable
- **Examples**:
  - `uvx` (default, uses uvx testrail-mcp)
  - `/path/to/python` (for local installation)
  - `C:\Python311\python.exe` (Windows)

### `testrailMcp.mcpServerArgs`
- **Type**: Array of strings
- **Default**: `["testrail-mcp"]`
- **Description**: Arguments to pass to MCP server
- **Examples**:
  - `["testrail-mcp"]` (default, for uvx)
  - `["-m", "testrail_mcp"]` (for local Python installation)

### `testrailMcp.debug`
- **Type**: Boolean
- **Default**: `false`
- **Description**: Enable debug logging
- **When to enable**: Troubleshooting connection issues

## Advanced Configuration

### Using Local TestRail MCP Server

If you installed the MCP server locally instead of using uvx:

1. Open VS Code Settings (`Ctrl+,` / `Cmd+,`)
2. Search for "TestRail MCP"
3. Set `testrailMcp.mcpServerPath` to your Python executable:
   - Linux/Mac: `/path/to/.venv/bin/python`
   - Windows: `C:\path\to\.venv\Scripts\python.exe`
4. Set `testrailMcp.mcpServerArgs` to:
   ```json
   ["-m", "testrail_mcp"]
   ```
5. Run "TestRail MCP: Reconnect" command

### Custom Environment Variables

If you need to pass additional environment variables to the MCP server:

The extension automatically sets these environment variables:
- `TESTRAIL_URL`: From your configuration
- `TESTRAIL_USERNAME`: From secure storage
- `TESTRAIL_API_KEY`: From secure storage

Currently, custom environment variables are not supported. If you need this feature, please file an issue.

## Troubleshooting

### Extension not appearing in Copilot Chat

**Solution**:
1. Verify VS Code version is 1.95.0 or higher
2. Ensure GitHub Copilot extension is installed and active
3. Check that TestRail MCP extension is enabled (Extensions view)
4. Restart VS Code
5. Check connection status in status bar

### Connection fails with "Process error"

**Possible causes and solutions**:

1. **uvx not installed**
   - Install uv: `curl -LsSf https://astral.sh/uv/install.sh | sh`
   - Or use local installation (see Advanced Configuration)

2. **Python not found (local installation)**
   - Verify Python path in settings
   - Check Python version is 3.10 or higher

3. **TestRail MCP server not installed**
   - Install: `uvx testrail-mcp` or follow local installation steps

### Authentication errors

**Possible causes and solutions**:

1. **Invalid credentials**
   - Run "Configure Credentials" again
   - Verify email and API key in TestRail

2. **API access disabled**
   - Contact your TestRail administrator
   - Enable API access in TestRail settings

3. **Wrong server URL**
   - Ensure URL includes `https://`
   - Verify the URL is accessible in browser

### Tool not working in Copilot Chat

**Possible causes and solutions**:

1. **Not connected**
   - Check status bar shows "✅ TestRail MCP"
   - Run "TestRail MCP: Reconnect" if needed

2. **Wrong syntax**
   - Use format: `@workspace Using #testrail_mcp, <your request>`
   - Include the `#` before `testrail_mcp`

3. **Invalid parameters**
   - Check that you're using valid action names
   - Refer to README for supported actions

### Enable Debug Mode

To get detailed logs for troubleshooting:

1. Open Settings (`Ctrl+,` / `Cmd+,`)
2. Search for "testrailMcp.debug"
3. Enable the checkbox
4. Run "TestRail MCP: Reconnect"
5. Open Output panel (View > Output)
6. Select "TestRail MCP" from dropdown
7. Review detailed logs

## Updating the Extension

To update to a new version:

1. Download the new `.vsix` file
2. Uninstall the current version (optional):
   - Go to Extensions view
   - Find "TestRail MCP Tools"
   - Click the gear icon
   - Select "Uninstall"
3. Install the new `.vsix` file (see Step 1)
4. Restart VS Code

Your credentials and settings will be preserved.

## Uninstalling

To completely remove the extension:

1. **Uninstall the extension**:
   - Go to Extensions view (`Ctrl+Shift+X`)
   - Find "TestRail MCP Tools"
   - Click the gear icon
   - Select "Uninstall"

2. **Remove credentials** (optional):
   - Credentials are stored securely in VS Code
   - They will be automatically removed when you reconfigure
   - Or manually clear: Run "Developer: Clear Secret Storage" (not recommended)

3. **Remove settings** (optional):
   - Open Settings (`Ctrl+,`)
   - Search for "testrailMcp"
   - Click the gear icon next to each setting
   - Select "Reset Setting"

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [README.md](README.md) for usage examples
2. Review the Output panel for error messages
3. Enable debug mode for detailed logs
4. Search existing issues on GitHub
5. Create a new issue with:
   - VS Code version
   - Extension version
   - Error messages from Output panel
   - Steps to reproduce

## Next Steps

After successful installation:

1. Read the [README.md](README.md) for usage examples
2. Try example queries in Copilot Chat
3. Explore available actions and parameters
4. Integrate TestRail queries into your workflow

## Security Notes

- **Credentials Storage**: API keys are stored securely using VS Code's Secret Storage API
- **Environment Variables**: Credentials are only passed to the TestRail MCP server process
- **Network**: The extension only communicates with your configured TestRail server
- **Logging**: Debug mode may log sensitive information; disable after troubleshooting
