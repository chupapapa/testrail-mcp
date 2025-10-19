# Example VS Code Settings for TestRail MCP Tools

This file shows example configurations for the TestRail MCP Tools extension.

## Basic Configuration (Using uvx)

Add to your VS Code `settings.json`:

```json
{
  "testrailMcp.serverUrl": "https://your-instance.testrail.io",
  "testrailMcp.mcpServerPath": "uvx",
  "testrailMcp.mcpServerArgs": ["testrail-mcp"],
  "testrailMcp.debug": false
}
```

**Note**: Credentials (username and API key) are configured through the "Configure Credentials" command and stored securely.

## Local Installation Configuration

If you installed TestRail MCP server locally:

### Linux/macOS

```json
{
  "testrailMcp.serverUrl": "https://your-instance.testrail.io",
  "testrailMcp.mcpServerPath": "/home/user/testrail-mcp/.venv/bin/python",
  "testrailMcp.mcpServerArgs": ["-m", "testrail_mcp"],
  "testrailMcp.debug": false
}
```

### Windows

```json
{
  "testrailMcp.serverUrl": "https://your-instance.testrail.io",
  "testrailMcp.mcpServerPath": "C:\\Users\\user\\testrail-mcp\\.venv\\Scripts\\python.exe",
  "testrailMcp.mcpServerArgs": ["-m", "testrail_mcp"],
  "testrailMcp.debug": false
}
```

## Debug Mode Configuration

Enable detailed logging for troubleshooting:

```json
{
  "testrailMcp.serverUrl": "https://your-instance.testrail.io",
  "testrailMcp.mcpServerPath": "uvx",
  "testrailMcp.mcpServerArgs": ["testrail-mcp"],
  "testrailMcp.debug": true
}
```

When debug mode is enabled:
- Detailed connection logs appear in the Output panel
- MCP server stderr is captured
- Tool invocation details are logged
- Useful for diagnosing connection and authentication issues

## Workspace vs User Settings

### User Settings (Global)
Location: `~/.config/Code/User/settings.json` (Linux/macOS) or `%APPDATA%\Code\User\settings.json` (Windows)

Use for personal TestRail instance that applies across all projects:
```json
{
  "testrailMcp.serverUrl": "https://my-company.testrail.io",
  "testrailMcp.mcpServerPath": "uvx",
  "testrailMcp.mcpServerArgs": ["testrail-mcp"]
}
```

### Workspace Settings (Project-specific)
Location: `.vscode/settings.json` in your workspace root

Use when different projects use different TestRail instances:
```json
{
  "testrailMcp.serverUrl": "https://client-project.testrail.io",
  "testrailMcp.mcpServerPath": "uvx",
  "testrailMcp.mcpServerArgs": ["testrail-mcp"]
}
```

**Note**: Workspace settings override user settings for that workspace.

## Multi-Root Workspace

For multi-root workspaces, you can configure per-folder:

```json
{
  "folders": [
    {
      "path": "project1",
      "settings": {
        "testrailMcp.serverUrl": "https://project1.testrail.io"
      }
    },
    {
      "path": "project2",
      "settings": {
        "testrailMcp.serverUrl": "https://project2.testrail.io"
      }
    }
  ]
}
```

## Alternative Server Paths

### Using poetry

```json
{
  "testrailMcp.mcpServerPath": "poetry",
  "testrailMcp.mcpServerArgs": ["run", "python", "-m", "testrail_mcp"]
}
```

### Using pipx

```json
{
  "testrailMcp.mcpServerPath": "pipx",
  "testrailMcp.mcpServerArgs": ["run", "testrail-mcp"]
}
```

### Direct Python executable

```json
{
  "testrailMcp.mcpServerPath": "python3",
  "testrailMcp.mcpServerArgs": ["-m", "testrail_mcp"]
}
```

### Custom script

```json
{
  "testrailMcp.mcpServerPath": "/path/to/custom-wrapper.sh",
  "testrailMcp.mcpServerArgs": []
}
```

## Complete Example with All Options

```json
{
  // TestRail server URL (required, set via Configure Credentials command)
  "testrailMcp.serverUrl": "https://your-instance.testrail.io",
  
  // Path to MCP server executable (default: uvx)
  "testrailMcp.mcpServerPath": "uvx",
  
  // Arguments for MCP server (default: ["testrail-mcp"])
  "testrailMcp.mcpServerArgs": ["testrail-mcp"],
  
  // Enable debug logging (default: false)
  "testrailMcp.debug": false
}
```

## Tips

1. **Always use absolute paths** for `mcpServerPath` when using local installations
2. **Test after configuration** using "TestRail MCP: Test Connection" command
3. **Enable debug mode** when troubleshooting connection issues
4. **Restart VS Code** after changing server path or args
5. **Use workspace settings** when working with multiple TestRail instances
6. **Check Output panel** ("TestRail MCP") for detailed logs

## Common Issues

### Server not found
- Verify `mcpServerPath` is correct and executable
- Check PATH environment variable includes uvx/python location
- Use absolute paths instead of relative paths

### Connection timeout
- Verify TestRail URL is accessible
- Check network/firewall settings
- Enable debug mode to see detailed error messages

### Authentication failed
- Run "Configure Credentials" command again
- Verify API key is correct and not expired
- Check TestRail user has necessary permissions
