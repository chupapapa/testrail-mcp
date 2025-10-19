# Example Usage with GitHub Copilot Chat

This guide provides practical examples of using the TestRail MCP Tools extension with GitHub Copilot Chat.

## Prerequisites

- TestRail MCP Tools extension installed and configured
- GitHub Copilot subscription active
- Connection status showing "✅ TestRail MCP" in status bar

## Basic Usage Pattern

All queries follow this pattern:
```
@workspace Using #testrail_mcp, <your natural language request>
```

The `#testrail_mcp` tool translates your request into the appropriate TestRail API calls.

## Project Management Examples

### List All Projects

```
@workspace Using #testrail_mcp, list all projects
```

**What it does**: Retrieves all TestRail projects you have access to.

### Get Project Details

```
@workspace Using #testrail_mcp, get details of project 5
```

**Alternative forms**:
```
@workspace Using #testrail_mcp, show me information about project ID 5
@workspace Using #testrail_mcp, get project with ID 5
```

### Create a New Project

```
@workspace Using #testrail_mcp, create a new project named "Mobile App Testing" with single suite mode
```

**What it does**: Creates a new project with the specified name and configuration.

## Test Case Examples

### List Test Cases

```
@workspace Using #testrail_mcp, list all test cases in project 5
```

**With suite filter**:
```
@workspace Using #testrail_mcp, list test cases for project 5 in suite 2
```

### Get Test Case Details

```
@workspace Using #testrail_mcp, get test case 123
```

**Alternative forms**:
```
@workspace Using #testrail_mcp, show me test case with ID 123
@workspace Using #testrail_mcp, get details of test case TC-123
```

### Create Test Case

```
@workspace Using #testrail_mcp, create a test case in section 10 with title "User login with valid credentials"
```

**With more details**:
```
@workspace Using #testrail_mcp, create a test case in section 10 titled "User login validation" with priority 3 and estimate "2m"
```

### Update Test Case

```
@workspace Using #testrail_mcp, update test case 123 with title "Updated: User login with valid credentials"
```

## Test Run Examples

### List Test Runs

```
@workspace Using #testrail_mcp, list all test runs for project 5
```

**What it does**: Retrieves all test runs for the specified project.

### Get Test Run Details

```
@workspace Using #testrail_mcp, get test run 456
```

**Alternative forms**:
```
@workspace Using #testrail_mcp, show me details of run 456
@workspace Using #testrail_mcp, get information about test run ID 456
```

### Create Test Run

```
@workspace Using #testrail_mcp, create a test run for project 5, suite 2, named "Sprint 23 Regression Tests"
```

**With description**:
```
@workspace Using #testrail_mcp, create a test run named "Login Feature Tests" for project 5 and suite 2 with description "Testing all login-related functionality"
```

**With specific test cases**:
```
@workspace Using #testrail_mcp, create a test run named "Critical Tests" for project 5, suite 2, including only test cases 101, 102, 103
```

### Close Test Run

```
@workspace Using #testrail_mcp, close test run 456
```

**What it does**: Marks the test run as completed and locks it from further changes.

## Test Results Examples

### Get Test Results

```
@workspace Using #testrail_mcp, get results for test 789
```

**What it does**: Retrieves all historical results for a specific test.

### Add Test Result (Passed)

```
@workspace Using #testrail_mcp, add a passed result for test 789 with comment "All validations passed successfully"
```

**What it does**: Records a passed test result with status_id=1.

### Add Test Result (Failed)

```
@workspace Using #testrail_mcp, add a failed result for test 789 with comment "Login button not clickable on mobile"
```

**What it does**: Records a failed test result with status_id=5.

### Add Result with Details

```
@workspace Using #testrail_mcp, add a passed result for test 789 with comment "Test completed successfully", version "v2.1.0", and elapsed time "3m 45s"
```

## Section Management Examples

### List Sections

```
@workspace Using #testrail_mcp, list all sections in project 5
```

**With suite filter**:
```
@workspace Using #testrail_mcp, list sections for project 5 in suite 2
```

### Get Section Details

```
@workspace Using #testrail_mcp, get section 25
```

### Create Section

```
@workspace Using #testrail_mcp, create a section in project 5 named "Login Tests" with description "All login-related test cases"
```

### Move Section

```
@workspace Using #testrail_mcp, move section 25 after section 24
```

## Dataset Examples

### List Datasets

```
@workspace Using #testrail_mcp, list all datasets for project 5
```

### Get Dataset Details

```
@workspace Using #testrail_mcp, get dataset 15
```

### Create Dataset

```
@workspace Using #testrail_mcp, create a dataset in project 5 named "User Accounts" with description "Test user account data"
```

## Advanced Examples

### Combining with Code Analysis

```
@workspace Using #testrail_mcp, list all test cases in project 5, then show me which ones are related to authentication in our codebase
```

**What Copilot does**:
1. Retrieves test cases from TestRail
2. Analyzes your codebase
3. Maps test cases to relevant code files

### Generating Test Reports

```
@workspace Using #testrail_mcp, get all results for test run 456, then create a summary of pass/fail rates
```

**What Copilot does**:
1. Retrieves test results
2. Calculates statistics
3. Generates a formatted summary

### Creating Test Plans

```
@workspace Using #testrail_mcp, list all test cases in project 5 for the "User Management" section, then help me create a test run for the critical ones
```

**What Copilot does**:
1. Lists test cases in the section
2. Helps identify critical tests
3. Assists in creating a test run

### Updating Multiple Tests

```
@workspace Using #testrail_mcp, get test cases 101, 102, 103 and help me update their priorities to high
```

**Note**: This would require multiple update calls - Copilot can help generate the commands.

## Parameter Reference

### Common Parameters

- `project_id`: Integer ID of the project
- `suite_id`: Integer ID of the test suite
- `section_id`: Integer ID of the section
- `case_id` or `test_case_id`: Integer ID of the test case
- `run_id` or `test_run_id`: Integer ID of the test run
- `test_id`: Integer ID of the test
- `status_id`: Integer status (1=Passed, 2=Blocked, 3=Untested, 4=Retest, 5=Failed)
- `comment`: String comment/description
- `name` or `title`: String name/title
- `description`: String description

### Status IDs

Common TestRail status IDs:
- `1` - Passed
- `2` - Blocked
- `3` - Untested (Default)
- `4` - Retest
- `5` - Failed

**Note**: Your TestRail instance may have custom statuses. Check your TestRail configuration.

## Tips for Better Results

1. **Be Specific**: Include entity IDs when possible
   - Good: "get test case 123"
   - Less specific: "get the login test case"

2. **Use Natural Language**: The tool understands natural phrasing
   - "create a test run"
   - "add a new test case"
   - "list all projects"

3. **Combine Operations**: Let Copilot help with multi-step workflows
   - "list test cases then filter by priority"
   - "get test results and create a summary"

4. **Ask for Help**: Copilot can guide you
   - "how do I create a test run?"
   - "what parameters does add_result need?"
   - "show me examples of using the testrail tool"

5. **Check Results**: Review the output in the chat
   - TestRail responses are formatted as JSON
   - Look for error messages if something fails

## Troubleshooting

### Tool Not Responding

**Check**:
1. Extension is connected (status bar shows "✅ TestRail MCP")
2. You're using the correct format: `@workspace Using #testrail_mcp, ...`
3. Include the `#` before `testrail_mcp`

### Invalid Parameters

**Solution**:
- Check parameter names match the API
- Verify IDs are correct and exist in TestRail
- Review error messages in Copilot Chat response

### Authentication Errors

**Solution**:
1. Run "TestRail MCP: Test Connection"
2. If it fails, reconfigure credentials
3. Check Output panel for details

### No Results Returned

**Possible Causes**:
- Entity doesn't exist (wrong ID)
- No permissions to access the entity
- Empty result set (e.g., no test cases in project)

**Solution**:
- Verify IDs in TestRail web interface
- Check your TestRail permissions
- Try a simpler query first (e.g., list projects)

## Next Steps

- Explore all available actions in the [README](README.md)
- Check the [Installation Guide](INSTALL.md) for configuration options
- Review [Settings Examples](SETTINGS_EXAMPLES.md) for advanced setup
- Report issues or request features on GitHub
