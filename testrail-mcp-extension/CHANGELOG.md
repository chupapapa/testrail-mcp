# Changelog

All notable changes to the TestRail MCP Tools extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-19

### Added
- Initial release of TestRail MCP Tools extension
- MCP client integration with TestRail MCP server
- Support for stdio transport mode
- Tool registration with VS Code Language Model Tool API (`#testrail_mcp`)
- Secure credential storage using VS Code Secret Storage API
- Configuration management for TestRail connection
- Status bar item showing connection status
- Commands:
  - `TestRail MCP: Configure Credentials` - Set up TestRail credentials
  - `TestRail MCP: Test Connection` - Test connection to TestRail
  - `TestRail MCP: Reconnect` - Reconnect to TestRail MCP server
- Output channel for debugging
- Comprehensive action mapping for all TestRail MCP operations:
  - Project management (list, get, add, update, delete)
  - Test case management (list, get, add, update, delete)
  - Section management (get, list, add, update, delete, move)
  - Test run management (list, get, add, update, close, delete)
  - Test result management (get, add)
  - Dataset management (list, get, add, update, delete)
- Connection lifecycle management with automatic reconnection
- User-friendly error messages and validation
- Full documentation with README, INSTALL guide, and examples

### Features
- Works with GitHub Copilot Chat for natural language TestRail queries
- Supports both uvx and local TestRail MCP server installations
- Debug mode for detailed logging
- Automatic connection on startup when configured
- Visual connection status indicators

### Security
- Secure credential storage using VS Code Secret Storage
- Credentials only passed to MCP server process via environment variables
- No plaintext credential storage

[0.1.0]: https://github.com/chupapapa/testrail-mcp/releases/tag/v0.1.0
