# Code and Expressions in n8n

Based on the content from the n8n documentation (https://docs.n8n.io/code/)

## Overview

n8n is a low-code tool. This means you can do a lot without code, then add code when needed. There are two main ways to use code in your workflows.

## Code in Your Workflows

### 1. Expressions
Use expressions to transform data in your nodes. You can use JavaScript in expressions, as well as n8n's built-in methods and variables and data transformation functions.

**Key Features:**
- JavaScript-based expressions
- Built-in methods and variables
- Data transformation functions
- Real-time data preview
- Inline code execution

**Use Cases:**
- Data transformation between nodes
- Conditional logic in node parameters
- Dynamic parameter values
- String manipulation and formatting
- Mathematical calculations

### 2. Code Node
Use the Code node to add JavaScript or Python to your workflow.

**Supported Languages:**
- **JavaScript** - Full ES6+ support
- **Python** - Python 3 with common libraries

**Features:**
- Multi-line code editing
- Syntax highlighting
- Error handling and debugging
- Access to workflow data
- Custom logic implementation

## Technical Nodes

n8n provides core nodes that simplify adding key functionality:

### Backend Development Nodes

#### HTTP Request Node
- Make API calls to external services
- Support for all HTTP methods (GET, POST, PUT, DELETE, etc.)
- Authentication options (Basic, Bearer, OAuth2)
- Custom headers and parameters
- Response data handling

#### Webhook Node
- Receive HTTP requests from external systems
- Create API endpoints
- Handle webhooks from services
- Custom response configuration
- Request validation and processing

#### Code Node
- Execute custom JavaScript or Python
- Access to all workflow data
- Custom business logic implementation
- Data transformation and processing
- External library integration

**Example Use Case:** Create an API endpoint that processes data and responds to webhooks.

### Flow Logic Nodes

#### IF Node
- Conditional branching
- Multiple condition types
- Boolean, numeric, and string comparisons
- Complex logical expressions

#### Switch Node
- Multi-way branching
- Route data based on multiple conditions
- Pattern matching
- Fallback routing

#### Merge Node
- Combine data from multiple branches
- Different merge strategies
- Data synchronization
- Workflow coordination

## Built-in Methods and Variables

### n8n Metadata
- `$workflow` - Workflow information
- `$node` - Current node details
- `$execution` - Execution context
- `$itemIndex` - Current item index

### Data Access
- `$input` - Input data from previous nodes
- `$json` - JSON data manipulation
- `$binary` - Binary data handling
- `$items()` - Access items from specific nodes

### Utility Functions
- Date and time functions
- String manipulation
- Array operations
- Object manipulation
- Mathematical functions

## Data Transformation Functions

### Arrays
- `filter()` - Filter array elements
- `map()` - Transform array elements
- `reduce()` - Reduce array to single value
- `sort()` - Sort array elements
- `find()` - Find specific elements

### Objects
- `keys()` - Get object keys
- `values()` - Get object values
- `merge()` - Merge objects
- `pick()` - Select specific properties
- `omit()` - Exclude properties

### Strings
- `split()` - Split strings
- `join()` - Join arrays to strings
- `replace()` - String replacement
- `match()` - Pattern matching
- `format()` - String formatting

### Dates
- `format()` - Date formatting
- `parse()` - Date parsing
- `add()` - Date arithmetic
- `diff()` - Date differences
- `timezone()` - Timezone conversion

## Developer Resources

### n8n API
The n8n API allows programmatic access to:
- Workflow management
- Execution control
- User management
- Credential management
- System configuration

**Available through:**
- REST API endpoints
- n8n API node within workflows
- External applications integration

### Self-hosting
Benefits of self-hosting:
- Complete data control
- Custom configuration
- On-premises deployment
- Enhanced security
- Cost optimization

**Deployment Options:**
- Docker containers
- npm installation
- Cloud platforms (AWS, GCP, Azure)
- Kubernetes clusters

### Custom Node Development
Build your own nodes:
- Custom integrations
- Specialized business logic
- Community contributions
- npm publication

**Development Process:**
1. Node structure setup
2. Configuration definition
3. Execution logic implementation
4. Testing and validation
5. Publishing and distribution

## Best Practices

### Code Organization
- Keep expressions simple and readable
- Use meaningful variable names
- Comment complex logic
- Break down large code blocks
- Handle errors gracefully

### Performance Optimization
- Minimize API calls in loops
- Cache frequently used data
- Use efficient data structures
- Optimize database queries
- Monitor execution times

### Security Considerations
- Validate input data
- Sanitize user inputs
- Use secure authentication
- Handle credentials safely
- Implement proper error handling

### Debugging Techniques
- Use console.log in Code nodes
- Leverage data preview features
- Test with sample data
- Use step-by-step execution
- Monitor execution logs

This comprehensive guide covers all aspects of using code in n8n, from simple expressions to complex custom nodes and API integrations.