#!/usr/bin/env node

/**
 * Frontend Testing Script for Vibe Coding Integration
 * 
 * This script:
 * 1. Builds the TypeScript/React project
 * 2. Starts the dev server
 * 3. Uses Playwright MCP to test for console errors
 * 4. Generates a comprehensive report
 * 
 * Usage: npm run test:frontend
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const CONFIG = {
  devServerUrl: 'http://localhost:3000',
  devServerPort: 3000,
  maxWaitTime: 60000, // 60 seconds
  reportsDir: path.join(process.cwd(), 'playwright-reports'),
  colors: {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
  }
};

// Utility functions
const log = {
  info: (msg) => console.log(`${CONFIG.colors.cyan}ℹ${CONFIG.colors.reset} ${msg}`),
  success: (msg) => console.log(`${CONFIG.colors.green}✓${CONFIG.colors.reset} ${msg}`),
  error: (msg) => console.log(`${CONFIG.colors.red}✗${CONFIG.colors.reset} ${msg}`),
  warn: (msg) => console.log(`${CONFIG.colors.yellow}⚠${CONFIG.colors.reset} ${msg}`),
  step: (step, msg) => console.log(`${CONFIG.colors.blue}[${step}]${CONFIG.colors.reset} ${msg}`)
};

// Ensure reports directory exists
function ensureReportsDir() {
  if (!fs.existsSync(CONFIG.reportsDir)) {
    fs.mkdirSync(CONFIG.reportsDir, { recursive: true });
    log.info('Created playwright-reports directory');
  }
}

// Check if server is running
function checkServer(url, timeout = CONFIG.maxWaitTime) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200 || res.statusCode === 304) {
          resolve(true);
        } else {
          retry();
        }
      }).on('error', retry);
    };
    
    const retry = () => {
      if (Date.now() - startTime > timeout) {
        reject(new Error('Server timeout'));
      } else {
        setTimeout(check, 1000);
      }
    };
    
    check();
  });
}

// Run command and return promise
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: options.silent ? 'pipe' : 'inherit',
      shell: true,
      ...options
    });
    
    let stdout = '';
    let stderr = '';
    
    if (options.silent) {
      proc.stdout?.on('data', (data) => stdout += data.toString());
      proc.stderr?.on('data', (data) => stderr += data.toString());
    }
    
    proc.on('close', (code) => {
      if (code === 0 || options.ignoreErrors) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Command failed with code ${code}\n${stderr}`));
      }
    });
    
    proc.on('error', reject);
    
    if (options.returnProcess) {
      resolve(proc);
    }
  });
}

// Create test initialization script
function createTestScript() {
  const scriptPath = path.join(CONFIG.reportsDir, 'test-console-errors.js');
  const scriptContent = `
// Console error and warning capture script
const errors = [];
const warnings = [];
const logs = [];

// Store original console methods
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

// Override console.error
console.error = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  errors.push({
    message,
    timestamp: new Date().toISOString(),
    stack: new Error().stack
  });
  originalError.apply(console, args);
};

// Override console.warn
console.warn = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  warnings.push({
    message,
    timestamp: new Date().toISOString()
  });
  originalWarn.apply(console, args);
};

// Capture unhandled errors
window.addEventListener('error', (event) => {
  errors.push({
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    timestamp: new Date().toISOString()
  });
});

// Capture unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  errors.push({
    message: 'Unhandled Promise Rejection: ' + event.reason,
    timestamp: new Date().toISOString()
  });
});

// Wait for page to fully load and then report
setTimeout(() => {
  const results = {
    errors,
    warnings,
    url: window.location.href,
    title: document.title,
    readyState: document.readyState,
    performance: {
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
    },
    timestamp: new Date().toISOString()
  };
  
  console.log('TEST_RESULTS_START');
  console.log(JSON.stringify(results, null, 2));
  console.log('TEST_RESULTS_END');
}, 5000);
`;
  
  fs.writeFileSync(scriptPath, scriptContent);
  return scriptPath;
}

// Parse test results from output
function parseTestResults(output) {
  try {
    const startMarker = 'TEST_RESULTS_START';
    const endMarker = 'TEST_RESULTS_END';
    
    const startIndex = output.indexOf(startMarker);
    const endIndex = output.indexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
      return null;
    }
    
    const jsonStr = output.substring(startIndex + startMarker.length, endIndex).trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    log.error(`Failed to parse test results: ${error.message}`);
    return null;
  }
}

// Generate HTML report
function generateHtmlReport(results) {
  const htmlPath = path.join(CONFIG.reportsDir, 'test-report.html');
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frontend Test Report - ${results.timestamp}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
        }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { opacity: 0.9; }
        .content { padding: 30px; }
        .section {
            margin-bottom: 30px;
            border-left: 4px solid #667eea;
            padding-left: 20px;
        }
        .section h2 {
            color: #333;
            margin-bottom: 15px;
            font-size: 20px;
        }
        .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
        }
        .status.success { background: #d4edda; color: #155724; }
        .status.error { background: #f8d7da; color: #721c24; }
        .status.warning { background: #fff3cd; color: #856404; }
        .step {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .step-title {
            font-weight: bold;
            color: #495057;
            margin-bottom: 8px;
        }
        .error-item, .warning-item {
            background: #fff;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 12px;
            margin-bottom: 10px;
        }
        .error-item { border-left: 4px solid #dc3545; }
        .warning-item { border-left: 4px solid #ffc107; }
        .timestamp { color: #6c757d; font-size: 12px; }
        .metric {
            display: inline-block;
            margin-right: 20px;
            padding: 10px 15px;
            background: #e9ecef;
            border-radius: 4px;
        }
        .metric-label { font-size: 12px; color: #6c757d; }
        .metric-value { font-size: 18px; font-weight: bold; color: #495057; }
        pre {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
            font-size: 12px;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎭 Frontend Test Report</h1>
            <p>FlowCraft N8N Automation Platform</p>
            <p class="timestamp">Generated: ${new Date(results.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>📊 Overview</h2>
                <div>
                    ${results.steps.map(step => `
                        <div class="step">
                            <div class="step-title">${step.name}</div>
                            <span class="status ${step.status}">${step.status.toUpperCase()}</span>
                            ${step.message ? `<p style="margin-top: 8px;">${step.message}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            ${results.testResults ? `
                <div class="section">
                    <h2>🌐 Browser Test Results</h2>
                    <div class="metric">
                        <div class="metric-label">Console Errors</div>
                        <div class="metric-value" style="color: ${results.testResults.errors.length > 0 ? '#dc3545' : '#28a745'}">
                            ${results.testResults.errors.length}
                        </div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Console Warnings</div>
                        <div class="metric-value" style="color: ${results.testResults.warnings.length > 0 ? '#ffc107' : '#28a745'}">
                            ${results.testResults.warnings.length}
                        </div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Load Time</div>
                        <div class="metric-value">${results.testResults.performance?.loadTime || 'N/A'}ms</div>
                    </div>
                    
                    ${results.testResults.errors.length > 0 ? `
                        <h3 style="margin-top: 20px; color: #dc3545;">❌ Console Errors</h3>
                        ${results.testResults.errors.map(error => `
                            <div class="error-item">
                                <strong>${error.message}</strong>
                                ${error.filename ? `<p style="font-size: 12px; color: #6c757d;">at ${error.filename}:${error.lineno}:${error.colno}</p>` : ''}
                                ${error.stack ? `<pre>${error.stack}</pre>` : ''}
                            </div>
                        `).join('')}
                    ` : ''}
                    
                    ${results.testResults.warnings.length > 0 ? `
                        <h3 style="margin-top: 20px; color: #ffc107;">⚠️ Console Warnings</h3>
                        ${results.testResults.warnings.map(warning => `
                            <div class="warning-item">
                                ${warning.message}
                            </div>
                        `).join('')}
                    ` : ''}
                </div>
            ` : ''}
            
            <div class="section">
                <h2>📝 Summary</h2>
                <p>
                    <strong>Total Steps:</strong> ${results.steps.length}<br>
                    <strong>Passed:</strong> ${results.steps.filter(s => s.status === 'success').length}<br>
                    <strong>Failed:</strong> ${results.steps.filter(s => s.status === 'error').length}<br>
                    <strong>Warnings:</strong> ${results.steps.filter(s => s.status === 'warning').length}
                </p>
                ${results.testResults ? `
                    <p style="margin-top: 15px;">
                        <strong>Page Title:</strong> ${results.testResults.title}<br>
                        <strong>URL:</strong> ${results.testResults.url}<br>
                        <strong>Ready State:</strong> ${results.testResults.readyState}
                    </p>
                ` : ''}
            </div>
        </div>
        
        <div class="footer">
            <p>Generated by FlowCraft Automated Testing Pipeline</p>
            <p style="margin-top: 5px;">Powered by Playwright MCP</p>
        </div>
    </div>
</body>
</html>
`;
  
  fs.writeFileSync(htmlPath, html);
  log.success(`HTML report generated: ${htmlPath}`);
}

// Main testing flow
async function runTests() {
  console.log('\n' + '='.repeat(50));
  console.log('  Frontend Pre-Deployment Testing');
  console.log('='.repeat(50) + '\n');
  
  ensureReportsDir();
  
  let devServerProcess = null;
  const results = {
    timestamp: new Date().toISOString(),
    steps: [],
    testResults: null
  };
  
  try {
    // Step 1: TypeScript Build
    log.step('1/5', 'Checking TypeScript compilation...');
    try {
      await runCommand('npm', ['run', 'build'], { silent: true });
      log.success('TypeScript compilation successful');
      results.steps.push({ name: 'TypeScript Compilation', status: 'success' });
    } catch (error) {
      log.error('TypeScript compilation failed');
      results.steps.push({ 
        name: 'TypeScript Compilation', 
        status: 'error',
        message: error.message 
      });
      throw error;
    }
    
    // Step 2: Start Dev Server
    log.step('2/5', 'Starting development server...');
    devServerProcess = spawn('npm', ['run', 'dev'], {
      shell: true,
      stdio: 'pipe'
    });
    
    log.info('Waiting for server to be ready...');
    try {
      await checkServer(CONFIG.devServerUrl);
      log.success('Development server is running');
      results.steps.push({ name: 'Development Server', status: 'success' });
    } catch (error) {
      log.error('Failed to start development server');
      results.steps.push({ 
        name: 'Development Server', 
        status: 'error',
        message: 'Server timeout' 
      });
      throw error;
    }
    
    // Step 3: Create Test Script
    log.step('3/5', 'Preparing browser tests...');
    const scriptPath = createTestScript();
    log.success('Test script created');
    
    // Step 4: Run Playwright Tests
    log.step('4/5', 'Running Playwright browser tests...');
    try {
      const { stdout, stderr } = await runCommand('npx', [
        '@playwright/mcp@latest',
        '--browser', 'chrome',
        '--headless',
        '--timeout-navigation', '30000',
        '--init-script', scriptPath,
        '--save-trace',
        '--save-video', '1280x720',
        '--output-dir', CONFIG.reportsDir
      ], { silent: true, ignoreErrors: true });
      
      const output = stdout + stderr;
      
      // Save full output
      fs.writeFileSync(
        path.join(CONFIG.reportsDir, 'test-output.log'),
        output
      );
      
      // Parse results
      const testResults = parseTestResults(output);
      
      if (testResults) {
        results.testResults = testResults;
        
        const errorCount = testResults.errors.length;
        const warningCount = testResults.warnings.length;
        
        if (errorCount === 0 && warningCount === 0) {
          log.success('No console errors or warnings detected');
          results.steps.push({ name: 'Browser Tests', status: 'success' });
        } else if (errorCount > 0) {
          log.error(`Found ${errorCount} console error(s)`);
          results.steps.push({ 
            name: 'Browser Tests', 
            status: 'error',
            message: `${errorCount} console errors, ${warningCount} warnings` 
          });
        } else {
          log.warn(`Found ${warningCount} console warning(s)`);
          results.steps.push({ 
            name: 'Browser Tests', 
            status: 'warning',
            message: `${warningCount} console warnings` 
          });
        }
        
        // Display errors
        if (errorCount > 0) {
          console.log('\n' + CONFIG.colors.red + '❌ Console Errors:' + CONFIG.colors.reset);
          testResults.errors.forEach((error, index) => {
            console.log(`\n${index + 1}. ${error.message}`);
            if (error.filename) {
              console.log(`   at ${error.filename}:${error.lineno}:${error.colno}`);
            }
          });
        }
        
        // Display warnings
        if (warningCount > 0) {
          console.log('\n' + CONFIG.colors.yellow + '⚠️  Console Warnings:' + CONFIG.colors.reset);
          testResults.warnings.forEach((warning, index) => {
            console.log(`\n${index + 1}. ${warning.message}`);
          });
        }
      } else {
        log.warn('Could not parse test results');
        results.steps.push({ 
          name: 'Browser Tests', 
          status: 'warning',
          message: 'Could not parse results' 
        });
      }
      
    } catch (error) {
      log.error('Playwright tests failed');
      results.steps.push({ 
        name: 'Browser Tests', 
        status: 'error',
        message: error.message 
      });
    }
    
    // Step 5: Generate Report
    log.step('5/5', 'Generating test report...');
    generateHtmlReport(results);
    
    // Save JSON results
    fs.writeFileSync(
      path.join(CONFIG.reportsDir, 'test-results.json'),
      JSON.stringify(results, null, 2)
    );
    
    log.success('Test report generated');
    results.steps.push({ name: 'Report Generation', status: 'success' });
    
  } catch (error) {
    log.error(`Testing failed: ${error.message}`);
  } finally {
    // Cleanup
    if (devServerProcess) {
      log.info('Stopping development server...');
      devServerProcess.kill();
      
      // On Windows, also kill child processes
      if (process.platform === 'win32') {
        try {
          exec(`taskkill /pid ${devServerProcess.pid} /T /F`, () => {});
        } catch (e) {
          // Ignore errors
        }
      }
    }
  }
  
  // Final summary
  console.log('\n' + '='.repeat(50));
  console.log('  Test Summary');
  console.log('='.repeat(50));
  
  const passed = results.steps.filter(s => s.status === 'success').length;
  const failed = results.steps.filter(s => s.status === 'error').length;
  const warnings = results.steps.filter(s => s.status === 'warning').length;
  
  console.log(`\nPassed:   ${CONFIG.colors.green}${passed}${CONFIG.colors.reset}`);
  console.log(`Failed:   ${CONFIG.colors.red}${failed}${CONFIG.colors.reset}`);
  console.log(`Warnings: ${CONFIG.colors.yellow}${warnings}${CONFIG.colors.reset}`);
  
  console.log(`\n📊 View detailed report:`);
  console.log(`   ${path.join(CONFIG.reportsDir, 'test-report.html')}`);
  console.log(`\n📝 View logs:`);
  console.log(`   ${path.join(CONFIG.reportsDir, 'test-output.log')}`);
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
