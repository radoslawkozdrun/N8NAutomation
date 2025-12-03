# n8n Complete Guide for Claude Desktop

This is a comprehensive n8n reference guide optimized for use in Claude Desktop Projects section.

## What is n8n?

n8n is a fair-code workflow automation platform that connects APIs and services without coding. It features:
- 400+ built-in integrations
- Visual workflow builder
- JavaScript/Python code support
- AI integration capabilities
- Self-hosting options
- Enterprise features

## Core Concepts

### Workflows
A workflow is a sequence of connected nodes that automate tasks:
- **Trigger Nodes**: Start workflows (Webhook, Cron, Manual)
- **Action Nodes**: Perform operations (HTTP Request, Database queries)
- **Logic Nodes**: Control flow (IF, Switch, Merge)
- **Transform Nodes**: Modify data (Set, Code, Function)

### Data Structure
n8n passes JSON objects between nodes:
```json
[
  {
    "id": "item_id",
    "json": {
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2025-01-15T10:30:00Z"
    },
    "binary": {}
  }
]
```

## Essential Nodes Reference

### Core Nodes
- **HTTP Request**: Make API calls, supports all HTTP methods, authentication
- **Webhook**: Receive HTTP requests, create API endpoints  
- **Code**: Execute JavaScript/Python code
- **IF**: Conditional branching based on data
- **Switch**: Multi-condition routing
- **Set**: Transform and manipulate data
- **Merge**: Combine data from multiple branches
- **Schedule Trigger**: Time-based workflow execution
- **Manual Trigger**: Start workflows manually

### Popular Integration Nodes
- **Gmail**: Email operations (send, receive, search)
- **Slack**: Team communication (messages, channels, files)
- **Google Sheets**: Spreadsheet operations (read, write, format)
- **Airtable**: Database operations (records, tables, views)
- **Notion**: Knowledge management (pages, databases, blocks)
- **Salesforce**: CRM operations (leads, contacts, opportunities)
- **GitHub**: Repository management (issues, PRs, commits)
- **Trello**: Project management (boards, cards, lists)
- **Discord**: Community management (messages, roles, channels)
- **Stripe**: Payment processing (customers, subscriptions, payments)

### AI Integration Nodes
- **OpenAI**: GPT models, DALL-E, Whisper, embeddings
- **Anthropic**: Claude models for text processing
- **Google AI**: Gemini models, multimodal capabilities
- **Mistral AI**: European AI models
- **Hugging Face**: Open-source AI models
- **LangChain Agent**: AI agents with tools
- **Vector Store**: Embeddings and similarity search

## Code and Expressions

### Basic Expressions
Access data using n8n's expression syntax:
```javascript
// Current item data
{{ $json.fieldName }}
{{ $json.user.name }}

// All items from previous node
{{ $items() }}
{{ $items("HTTP Request") }}

// Built-in variables
{{ $now }}              // Current timestamp
{{ $today }}            // Today's date
{{ $workflow.id }}      // Workflow ID
{{ $node.name }}        // Current node name
{{ $execution.id }}     // Execution ID

// String operations
{{ $json.name.toUpperCase() }}
{{ $json.email.toLowerCase() }}
{{ $json.text.replace("old", "new") }}
{{ $json.data.split(",") }}

// Date operations
{{ DateTime.now().toISO() }}
{{ DateTime.fromISO($json.date).plus({days: 7}).toFormat("yyyy-MM-dd") }}

// Mathematical operations
{{ Math.round($json.price * 1.2) }}
{{ Math.max($json.values) }}

// Conditional expressions
{{ $json.status === "active" ? "enabled" : "disabled" }}
{{ $json.score > 80 && $json.verified ? "qualified" : "not qualified" }}
```

### Code Node Examples
JavaScript in Code node:
```javascript
// Process all items
const processedItems = [];

for (const item of $input.all()) {
  const processed = {
    id: item.json.id,
    name: item.json.name.toUpperCase(),
    email: item.json.email.toLowerCase(),
    created: new Date().toISOString(),
    processed: true
  };
  
  processedItems.push({ json: processed });
}

return processedItems;

// API call example
const response = await fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + $env.API_TOKEN
  },
  body: JSON.stringify($input.first().json)
});

const data = await response.json();
return [{ json: data }];

// Error handling
try {
  const result = await someAsyncOperation();
  return [{ json: { success: true, data: result } }];
} catch (error) {
  return [{ json: { success: false, error: error.message } }];
}
```

Python in Code node:
```python
# Process items
processed_items = []

for item in _input.all():
    processed = {
        'id': item['json']['id'],
        'name': item['json']['name'].upper(),
        'email': item['json']['email'].lower(),
        'created': datetime.now().isoformat(),
        'processed': True
    }
    processed_items.append({'json': processed})

return processed_items

# Using external libraries
import requests
import pandas as pd

# API request
response = requests.post('https://api.example.com/data', 
                        json=_input.first()['json'])
data = response.json()

# Data processing with pandas
df = pd.DataFrame([item['json'] for item in _input.all()])
df['processed'] = True
result = df.to_dict('records')

return [{'json': item} for item in result]
```

## Authentication and Credentials

### Common Authentication Types
- **API Key**: Simple key-based authentication
- **OAuth2**: Secure token-based (Google, Microsoft, Salesforce)
- **Basic Auth**: Username/password combination
- **Bearer Token**: Token in Authorization header
- **Custom Auth**: Headers, query parameters

### Setting Up Credentials
1. Go to Settings → Credentials
2. Click "Add Credential"
3. Select service type
4. Configure authentication details
5. Test connection
6. Use in compatible nodes

## Common Workflow Patterns

### 1. API Integration Pattern
```
Manual Trigger → HTTP Request → Set (process data) → HTTP Request (send result)
```

### 2. Data Synchronization
```
Schedule Trigger → Get Data (Source) → Transform Data → Update Data (Target)
```

### 3. Webhook Processing
```
Webhook → Validate Data → IF (check conditions) → Process/Store Data → Response
```

### 4. Error Handling
```
Any Node → (On Error) → Set (format error) → Send Email/Slack → Stop Execution
```

### 5. Multi-step Processing
```
Trigger → Get Records → Split In Batches → Process Each → Merge → Final Action
```

### 6. AI-Powered Workflow
```
Trigger → HTTP Request (get data) → OpenAI (analyze) → Set (format) → Action
```

## AI Integration Guide

### OpenAI Integration
```javascript
// In OpenAI node configuration:
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant that analyzes customer feedback."
    },
    {
      "role": "user", 
      "content": "{{ $json.feedback_text }}"
    }
  ],
  "max_tokens": 500,
  "temperature": 0.7
}
```

### Vector Store and RAG
```javascript
// Document processing workflow:
// 1. Load documents → 2. Split text → 3. Generate embeddings → 4. Store in vector DB

// Query workflow:
// 1. User question → 2. Generate query embedding → 3. Similarity search → 4. LLM with context
```

### AI Agent with Tools
```javascript
// LangChain Agent configuration:
{
  "agent": "conversational-react-description",
  "tools": [
    "web-browser",
    "calculator", 
    "weather-api"
  ],
  "memory": "buffer",
  "maxIterations": 5
}
```

## Hosting and Installation

### Quick Start Options

#### n8n Cloud (Recommended)
- URL: app.n8n.cloud
- No setup required
- Automatic updates and scaling

#### Docker (Self-hosted)
```bash
# Simple run
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n

# With data persistence
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# With environment variables
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=password \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

#### npm Installation
```bash
npm install n8n -g
n8n start
# Access at http://localhost:5678
```

### Production Configuration
```bash
# Environment variables for production:
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://your-domain.com/
N8N_ENCRYPTION_KEY=your-secure-encryption-key

# Database (PostgreSQL recommended)
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=localhost
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=your-password

# Security
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin  
N8N_BASIC_AUTH_PASSWORD=secure-password
```

## Best Practices

### Workflow Design
- Use descriptive node names
- Add sticky notes for documentation
- Group related workflows with tags
- Keep workflows focused on single tasks
- Use error handling on critical nodes

### Performance Optimization
- Minimize API calls in loops
- Use batch processing for large datasets
- Set appropriate polling intervals
- Cache frequently accessed data
- Monitor execution times

### Security
- Store sensitive data in credentials
- Use environment variables for configuration
- Implement proper error handling
- Regularly rotate API keys
- Enable authentication for self-hosted instances

### Debugging
- Use Execute Workflow button for testing
- Check execution logs for errors
- Add Set nodes to inspect data flow
- Test expressions in expression editor
- Use manual triggers for development

## Common Use Cases

### 1. CRM Automation
```
Webhook (new lead) → Validate Data → Create Contact in CRM → Send Welcome Email → Update Database
```

### 2. Social Media Automation
```
Schedule Trigger → Get Content from CMS → Format for Platform → Post to Social Media → Track Engagement
```

### 3. Data Processing Pipeline
```
File Trigger → Read CSV → Validate Data → Transform → Load to Database → Send Report
```

### 4. Customer Support Automation
```
Email Trigger → Extract Content → AI Analysis → Route to Team → Send Auto-Response → Create Ticket
```

### 5. E-commerce Order Processing
```
Webhook (new order) → Validate Payment → Update Inventory → Send Confirmation → Create Shipping Label
```

### 6. AI Content Generation
```
Schedule Trigger → Get Topics → AI Content Generation → Review Queue → Publish to CMS → Social Share
```

## Troubleshooting Guide

### Common Issues
1. **Node not executing**: Check connections, verify previous node has data
2. **Authentication errors**: Verify credentials, check API permissions
3. **Expression errors**: Test expressions in editor, check data structure
4. **Webhook timeouts**: Verify URL, check HTTP method and headers
5. **Rate limiting**: Add delays, implement retry logic

### Error Handling Strategies
- Add error outputs to critical nodes
- Use Set nodes to format error messages
- Implement notification systems for failures
- Log errors for debugging
- Create fallback workflows

### Performance Issues
- Check for infinite loops
- Monitor execution times
- Optimize database queries
- Reduce unnecessary data processing
- Use appropriate node configurations

## Environment Variables Reference

### Basic Configuration
```bash
N8N_HOST=0.0.0.0                    # Server host
N8N_PORT=5678                       # Server port
N8N_PROTOCOL=https                  # Protocol (http/https)
N8N_BASIC_AUTH_ACTIVE=true          # Enable basic auth
N8N_BASIC_AUTH_USER=admin           # Auth username
N8N_BASIC_AUTH_PASSWORD=password    # Auth password
WEBHOOK_URL=https://domain.com/     # Webhook base URL
```

### Database Configuration
```bash
DB_TYPE=postgresdb                  # Database type
DB_POSTGRESDB_HOST=localhost        # Database host
DB_POSTGRESDB_PORT=5432            # Database port
DB_POSTGRESDB_DATABASE=n8n         # Database name
DB_POSTGRESDB_USER=n8n             # Database user
DB_POSTGRESDB_PASSWORD=password     # Database password
```

### Security Settings
```bash
N8N_ENCRYPTION_KEY=key              # Encryption key for credentials
N8N_USER_FOLDER=/home/node          # User data folder
N8N_CORS_ORIGIN=*                   # CORS origin
```

This guide covers the essential n8n knowledge needed for workflow automation, AI integration, and platform management. Use it as a reference when working with n8n workflows in your projects.