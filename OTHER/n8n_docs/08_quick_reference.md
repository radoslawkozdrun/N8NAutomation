# n8n Quick Reference Guide

This is a condensed reference guide for the most commonly used n8n features and concepts.

## Core Concepts

### Workflows
- **Definition**: Sequence of connected nodes that automate tasks
- **Components**: Trigger nodes → Processing nodes → Action nodes
- **Execution**: Manual, scheduled, or event-driven
- **Data Flow**: JSON objects passed between nodes

### Nodes
- **Trigger Nodes**: Start workflows (Webhook, Cron, Manual)
- **Action Nodes**: Perform operations (HTTP Request, Database, Email)
- **Logic Nodes**: Control flow (IF, Switch, Merge)
- **Transform Nodes**: Modify data (Set, Code, Function)

### Data Structure
```json
[
  {
    "id": "unique_identifier",
    "data": {
      "field1": "value1",
      "field2": "value2"
    }
  }
]
```

## Essential Nodes

### Core Nodes
- **HTTP Request**: API calls and web requests
- **Webhook**: Receive HTTP requests
- **Code**: JavaScript/Python execution
- **IF**: Conditional branching
- **Set**: Data manipulation
- **Schedule Trigger**: Time-based triggers

### Popular Integration Nodes
- **Gmail**: Email operations
- **Slack**: Team communication
- **Google Sheets**: Spreadsheet operations
- **Airtable**: Database operations
- **Notion**: Knowledge management
- **Salesforce**: CRM operations

## Expressions & Code

### Basic Expressions
```javascript
// Access current item data
{{ $json.fieldName }}

// Access all items
{{ $items() }}

// Date functions
{{ $now }}
{{ $today }}
{{ DateTime.now().toISO() }}

// String operations
{{ $json.name.toUpperCase() }}
{{ $json.email.includes('@gmail.com') }}

// Mathematical operations
{{ $json.price * 1.2 }}
{{ Math.round($json.value) }}
```

### Code Node Examples
```javascript
// JavaScript in Code node
for (const item of $input.all()) {
  item.json.processed = true;
  item.json.timestamp = new Date().toISOString();
}

return $input.all();
```

```python
# Python in Code node
for item in _input.all():
    item['json']['processed'] = True
    item['json']['timestamp'] = datetime.now().isoformat()

return _input.all()
```

## Authentication

### Common Auth Types
- **API Key**: Simple key-based authentication
- **OAuth2**: Secure token-based authentication
- **Basic Auth**: Username/password authentication
- **Bearer Token**: Token in Authorization header

### Credential Management
1. Go to Settings → Credentials
2. Create new credential
3. Configure authentication details
4. Use in nodes that support the service

## Workflow Patterns

### API Integration Pattern
```
Trigger → HTTP Request → Process Data → Action
```

### Data Processing Pattern
```
Trigger → Get Data → Transform Data → Store/Send Data
```

### Conditional Logic Pattern
```
Trigger → Check Condition → IF → Branch A / Branch B
```

### Error Handling Pattern
```
Node → (On Error) → Error Handler → Notification/Logging
```

## Common Use Cases

### 1. Data Synchronization
- Sync data between CRM and database
- Update spreadsheets from forms
- Backup important data regularly

### 2. Notifications & Alerts
- Monitor APIs and send alerts
- Process form submissions
- Send scheduled reports

### 3. Content Management
- Auto-publish social media posts
- Process and organize files
- Generate reports from data

### 4. E-commerce Automation
- Process orders automatically
- Update inventory systems
- Send customer notifications

## Hosting Options

### n8n Cloud
- **URL**: app.n8n.cloud
- **Benefits**: No setup, automatic updates
- **Best For**: Small to medium teams

### Self-hosted (Docker)
```bash
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

### Self-hosted (npm)
```bash
npm install n8n -g
n8n start
```

## Environment Variables

### Basic Configuration
```bash
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://your-domain.com/
```

### Database Configuration
```bash
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=localhost
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=your_password
```

## Troubleshooting

### Common Issues
1. **Node not executing**: Check connections and data flow
2. **Authentication failing**: Verify credentials and permissions
3. **Data not transforming**: Check expressions and data structure
4. **Webhook not receiving**: Verify URL and HTTP method

### Debugging Tips
- Use Execute Workflow button for testing
- Check execution logs for errors
- Use Set nodes to inspect data
- Test expressions in the expression editor

## Best Practices

### Workflow Design
- Use descriptive node names
- Add sticky notes for documentation
- Group related workflows with tags
- Test with sample data first

### Security
- Use environment variables for sensitive data
- Regularly rotate API keys
- Implement proper error handling
- Monitor workflow executions

### Performance
- Minimize API calls in loops
- Use appropriate polling intervals
- Optimize database queries
- Monitor execution times

## Resources

### Documentation
- **Main Docs**: https://docs.n8n.io/
- **Community**: https://community.n8n.io/
- **GitHub**: https://github.com/n8n-io/n8n

### Learning
- Built-in workflow templates
- Community workflow library
- Video tutorials and courses
- Interactive learning path

This quick reference covers the most essential n8n concepts and patterns. For detailed information, refer to the complete documentation in the `official/` directory.