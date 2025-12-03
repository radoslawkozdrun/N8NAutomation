# n8n Documentation for Claude Desktop

This directory contains comprehensive documentation for n8n (n8n.io) - a fair-code workflow automation tool with AI capabilities.

## Structure

### `official/` - Complete n8n Official Documentation
Contains the complete, up-to-date n8n documentation cloned from the official repository:
- **Source**: https://github.com/n8n-io/n8n-docs
- **Live docs**: https://docs.n8n.io/
- **Last updated**: $(date)

### Key Documentation Sections

#### 1. Getting Started
- **Path**: `official/try-it-out/`
- **Content**: Quickstart guides, first workflow tutorial
- **Purpose**: New user onboarding

#### 2. Workflows
- **Path**: `official/workflows/`
- **Content**: Workflow creation, components, execution, sharing
- **Purpose**: Core workflow management

#### 3. Integrations
- **Path**: `official/integrations/`
- **Content**: 400+ built-in nodes, community nodes, custom integrations
- **Key sections**:
  - `builtin/app-nodes/` - Service integrations (Slack, Google, AWS, etc.)
  - `builtin/core-nodes/` - Core functionality nodes
  - `community-nodes/` - Third-party extensions

#### 4. Code & Expressions
- **Path**: `official/code/`
- **Content**: JavaScript/Python code, expressions, functions
- **Key sections**:
  - `code-node.md` - Custom code execution
  - `expressions.md` - Data transformation expressions
  - `builtin/` - Built-in functions and variables

#### 5. Advanced AI
- **Path**: `official/advanced-ai/`
- **Content**: AI integrations, LangChain, vector databases, RAG
- **Key sections**:
  - `examples/` - AI workflow examples
  - `langchain/` - LangChain integration
  - `evaluations/` - AI model evaluation

#### 6. Hosting & Self-hosting
- **Path**: `official/hosting/`
- **Content**: Installation, configuration, scaling, security
- **Key sections**:
  - `installation/` - Docker, npm, cloud setups
  - `configuration/` - Environment variables, settings
  - `scaling/` - Queue mode, performance optimization

#### 7. Data Management
- **Path**: `official/data/`
- **Content**: Data structure, mapping, transformation
- **Key sections**:
  - `data-mapping/` - Visual data mapping
  - `transforming-data.md` - Data manipulation techniques

#### 8. API Reference
- **Path**: `official/api/`
- **Content**: REST API documentation, authentication
- **Key sections**:
  - `api-reference.md` - Complete API reference
  - `authentication.md` - API authentication methods

## Usage with Claude Desktop

This documentation is optimized for use as a knowledge source with Claude Desktop. The complete structure allows for:

1. **Comprehensive Reference**: Full coverage of n8n capabilities
2. **Code Examples**: Real workflow JSON files and code snippets
3. **Integration Guides**: Detailed node documentation for 400+ services
4. **Best Practices**: Configuration and optimization guides

## Key Files for Quick Reference

### Essential Guides
- `official/index.md` - Main documentation index
- `official/learning-path.md` - Structured learning path
- `official/quickstart.md` - Quick start guide

### Core Concepts
- `official/workflows/index.md` - Workflow fundamentals
- `official/flow-logic/index.md` - Flow logic and control
- `official/data/index.md` - Data handling concepts

### Integration Reference
- `official/integrations/builtin/app-nodes/index.md` - All integrations index
- `official/integrations/builtin/node-types.md` - Node type reference

### Development
- `official/code/index.md` - Code and expressions overview
- `official/integrations/creating-nodes/overview.md` - Custom node development

## File Formats
- **Markdown (.md)**: Documentation content
- **JSON (.json)**: Workflow examples and templates  
- **YAML (.yml)**: Configuration examples
- **Images**: Screenshots and diagrams in `_images/` directories

## Maintenance
This documentation should be updated periodically from the official n8n repository to ensure accuracy and completeness.

## License
This documentation is subject to n8n's fair-code license and terms of use.