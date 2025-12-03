# Playwright MCP Configuration Guide

## Overview
This project uses Playwright MCP to automatically test the frontend before deployment.

## Available MCP Servers

### 1. `playwright-test` (Headless Testing)
Used for automated testing before deployment.

**Features:**
- Runs in headless mode (no visible browser)
- Captures video recordings
- Saves execution traces
- Reports console errors and warnings
- 10s action timeout, 30s navigation timeout

**When to use:**
- Before committing code
- In CI/CD pipeline
- When Vibe Coding finishes work

### 2. `playwright-dev` (Development Testing)
Used for interactive debugging during development.

**Features:**
- Runs with visible browser
- Larger viewport (1920x1080)
- Saves traces for debugging
- Allows manual interaction

**When to use:**
- During development
- When debugging issues
- When you need to see what's happening

## Usage in Claude Desktop

### Automatic Testing Workflow

1. **Before running Vibe Coding**, tell Claude:
   ```
   "Use playwright-test MCP to verify the frontend after changes"
   ```

2. **Claude will automatically:**
   - Build the TypeScript project
   - Start the dev server
   - Navigate to the app in headless browser
   - Capture console errors/warnings
   - Save screenshots and video
   - Generate a test report

3. **Review results in:**
   - `playwright-reports/test-report.md` - Summary
   - `playwright-reports/test-output.log` - Detailed logs
   - `playwright-reports/trace.zip` - Full execution trace
   - `playwright-reports/video.webm` - Video recording

## Quick Test Commands

### Windows
```bash
test-frontend.bat
```

### Linux/Mac
```bash
./test-frontend.sh
```

## Manual Playwright MCP Usage

### Test homepage for console errors
```bash
npx @playwright/mcp@latest \
  --browser chrome \
  --headless \
  --save-trace \
  --output-dir ./playwright-reports \
  navigate http://localhost:3000
```

### Test specific page with screenshots
```bash
npx @playwright/mcp@latest \
  --browser chrome \
  --headless \
  --caps vision \
  --save-video 1280x720 \
  --output-dir ./playwright-reports \
  navigate http://localhost:3000/dashboard
```

### Test with custom viewport (mobile)
```bash
npx @playwright/mcp@latest \
  --browser chrome \
  --viewport-size 375x667 \
  --user-agent "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)" \
  --output-dir ./playwright-reports \
  navigate http://localhost:3000
```

## Integration with Vibe Coding

### Recommended Workflow

1. **Start**: Ask Vibe Coding to make changes
2. **During**: Vibe Coding modifies files
3. **Before completion**: Run `test-frontend.bat` or tell Claude to use Playwright MCP
4. **Verify**: Check `playwright-reports/test-report.md`
5. **If errors found**: Ask Vibe Coding to fix them
6. **Repeat**: Until all tests pass

### Example Claude Prompt

```
I'm working on [feature]. Before you finish:
1. Make the necessary code changes
2. Use playwright-test MCP to verify the frontend works
3. Check for console errors
4. If there are errors, fix them and test again
5. Only mark as complete when all tests pass
```

## Common Issues & Solutions

### Issue: "Could not connect to browser"
**Solution:** Make sure no other instance of Chrome is using the debugging port.

### Issue: "Timeout waiting for navigation"
**Solution:** Increase timeout: `--timeout-navigation 60000`

### Issue: "Cannot read console errors"
**Solution:** Use the `--init-script` flag with the test-console-errors.js script

### Issue: "Tests pass but app has errors"
**Solution:** The init script might not be running. Check playwright-reports/test-output.log

## Advanced Configuration

### Custom Test Scripts

Create custom initialization scripts in `playwright-reports/`:

**test-console-errors.js** - Captures all console errors
**test-network-requests.js** - Monitors failed network requests
**test-react-errors.js** - Catches React error boundaries

### Environment Variables

```bash
# Set in .env file
PLAYWRIGHT_BROWSER=chrome
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_TIMEOUT=30000
PLAYWRIGHT_VIDEO=true
```

## Report Structure

```
playwright-reports/
├── test-report.md          # Human-readable summary
├── test-output.log         # Full console output
├── test-console-errors.js  # Error capture script
├── trace.zip              # Playwright trace (open in trace.playwright.dev)
├── video.webm             # Screen recording
└── screenshots/           # Any captured screenshots
```

## Best Practices

1. ✅ **Always test before committing**
2. ✅ **Review the test report, not just pass/fail**
3. ✅ **Keep playwright-reports/ in .gitignore**
4. ✅ **Use headless mode for CI/CD**
5. ✅ **Use headed mode for debugging**
6. ✅ **Save traces and videos for bug reports**
7. ✅ **Run tests after every Vibe Coding session**

## Troubleshooting

### Enable verbose logging
```bash
npx @playwright/mcp@latest --browser chrome --headless navigate http://localhost:3000 2>&1 | tee detailed.log
```

### Test without MCP (direct Playwright)
```bash
npx playwright test
```

### Check Playwright installation
```bash
npx playwright --version
```

## Resources

- [Playwright MCP Documentation](https://github.com/playwright/playwright-mcp)
- [Playwright Trace Viewer](https://trace.playwright.dev)
- [Playwright Documentation](https://playwright.dev)

---

**Last Updated:** 2025-01-30
**Project:** FlowCraft N8N Automation
