# n8n Workflow Examples and Use Cases for Claude Desktop

This guide contains practical workflow examples, templates, and common use case implementations for n8n.

## Basic Workflow Templates

### 1. API Data Processing Workflow
**Purpose**: Fetch data from API, process it, and store results

**Workflow Structure:**
```
Schedule Trigger → HTTP Request (API) → Code (process data) → HTTP Request (store) → Set (format response)
```

**Code Node Example:**
```javascript
// Process API response
const processedItems = [];

for (const item of $input.all()) {
  const data = item.json;
  
  const processed = {
    id: data.id,
    name: data.name?.trim().toUpperCase(),
    email: data.email?.toLowerCase(),
    status: data.active ? 'active' : 'inactive',
    created_date: new Date(data.created_at).toISOString().split('T')[0],
    processed_at: new Date().toISOString(),
    // Calculate derived fields
    days_since_creation: Math.floor((Date.now() - new Date(data.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    is_recent: (Date.now() - new Date(data.created_at).getTime()) < (7 * 24 * 60 * 60 * 1000)
  };
  
  // Only include if valid email
  if (processed.email && processed.email.includes('@')) {
    processedItems.push({ json: processed });
  }
}

return processedItems;
```

### 2. Webhook to Database Workflow
**Purpose**: Receive webhook data and store in database

**Workflow Structure:**
```
Webhook → IF (validate data) → Set (format) → Database Insert → Respond to Webhook
```

**Validation Logic:**
```javascript
// In IF node condition
{{ $json.email !== undefined && $json.name !== undefined && $json.email.includes('@') }}
```

**Database Insert Configuration:**
```json
{
  "operation": "insert",
  "table": "customers",
  "columns": "name, email, phone, created_at",
  "values": "{{ $json.name }}, {{ $json.email }}, {{ $json.phone }}, NOW()"
}
```

### 3. Email Processing Workflow
**Purpose**: Process incoming emails and route based on content

**Workflow Structure:**
```
Email Trigger → Extract Content → AI Classification → Switch (route by category) → Different Actions
```

**AI Classification:**
```javascript
// OpenAI node configuration
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "system",
      "content": "Classify this email into categories: support, sales, billing, general. Respond with only the category name."
    },
    {
      "role": "user",
      "content": "Subject: {{ $json.subject }}\nBody: {{ $json.body }}"
    }
  ],
  "max_tokens": 10
}
```

## E-commerce Automation Examples

### 4. Order Processing Workflow
**Purpose**: Process new orders automatically

**Workflow Structure:**
```
Webhook (new order) → Validate Payment → Update Inventory → Send Confirmation → Create Shipping Label → Update CRM
```

**Inventory Update Code:**
```javascript
// Update inventory for each order item
const orderItems = $json.line_items;
const inventoryUpdates = [];

for (const item of orderItems) {
  const update = {
    product_id: item.product_id,
    variant_id: item.variant_id,
    quantity_sold: item.quantity,
    timestamp: new Date().toISOString()
  };
  
  inventoryUpdates.push({ json: update });
}

return inventoryUpdates;
```

### 5. Customer Segmentation Workflow
**Purpose**: Automatically segment customers based on behavior

**Workflow Structure:**
```
Schedule Trigger → Get Customer Data → Calculate Metrics → AI Segmentation → Update Customer Tags → Send Targeted Campaigns
```

**Customer Metrics Calculation:**
```javascript
// Calculate RFM (Recency, Frequency, Monetary) scores
const customers = $input.all();
const segmentedCustomers = [];

for (const customer of customers) {
  const data = customer.json;
  
  // Calculate recency (days since last purchase)
  const lastPurchase = new Date(data.last_purchase_date);
  const recency = Math.floor((Date.now() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate frequency and monetary
  const frequency = data.total_orders || 0;
  const monetary = data.total_spent || 0;
  
  // Score calculation (1-5 scale)
  const recencyScore = recency <= 30 ? 5 : recency <= 90 ? 3 : 1;
  const frequencyScore = frequency >= 10 ? 5 : frequency >= 5 ? 3 : 1;
  const monetaryScore = monetary >= 1000 ? 5 : monetary >= 500 ? 3 : 1;
  
  // Determine segment
  let segment = 'at_risk';
  if (recencyScore >= 4 && frequencyScore >= 4) segment = 'champions';
  else if (recencyScore >= 3 && frequencyScore >= 3) segment = 'loyal_customers';
  else if (recencyScore >= 4) segment = 'new_customers';
  else if (frequencyScore >= 3) segment = 'potential_loyalists';
  
  segmentedCustomers.push({
    json: {
      ...data,
      recency_score: recencyScore,
      frequency_score: frequencyScore,
      monetary_score: monetaryScore,
      segment: segment,
      updated_at: new Date().toISOString()
    }
  });
}

return segmentedCustomers;
```

## AI-Powered Workflows

### 6. Intelligent Content Moderation
**Purpose**: Automatically moderate user-generated content

**Workflow Structure:**
```
Webhook (new content) → AI Content Analysis → IF (needs moderation) → Human Review Queue / Auto-Approve
```

**Content Analysis:**
```javascript
// OpenAI moderation + custom analysis
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "Analyze this content for: 1) Toxicity (0-10), 2) Spam likelihood (0-10), 3) Category (appropriate/questionable/inappropriate), 4) Key topics. Respond in JSON format."
    },
    {
      "role": "user",
      "content": "{{ $json.user_content }}"
    }
  ],
  "temperature": 0.1
}
```

### 7. Smart Customer Support Routing
**Purpose**: Route support tickets based on AI analysis

**Workflow Structure:**
```
Email/Webhook → AI Ticket Analysis → Priority & Category Assignment → Route to Team → Auto-Response
```

**Ticket Analysis:**
```javascript
// Comprehensive ticket analysis
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": `Analyze this support ticket and return JSON with:
      {
        "priority": "high/medium/low",
        "category": "technical/billing/general/bug_report/feature_request",
        "sentiment": "positive/neutral/negative",
        "complexity": "simple/moderate/complex",
        "estimated_resolution_time": "minutes",
        "required_team": "tier1/tier2/specialist/billing",
        "auto_response_suggested": true/false,
        "key_issues": ["list", "of", "main", "issues"]
      }`
    },
    {
      "role": "user",
      "content": "Subject: {{ $json.subject }}\nContent: {{ $json.content }}\nCustomer Tier: {{ $json.customer_tier }}"
    }
  ]
}
```

### 8. Dynamic Pricing Optimization
**Purpose**: Adjust prices based on market conditions and AI analysis

**Workflow Structure:**
```
Schedule Trigger → Gather Market Data → Competitor Analysis → AI Pricing Decision → Update Prices → Monitor Results
```

**Pricing Algorithm:**
```javascript
// AI-powered pricing decision
const pricingAnalysis = async (productData, marketData, competitorData) => {
  const prompt = `
  Analyze this product and market data to suggest optimal pricing:
  
  Product: ${JSON.stringify(productData)}
  Market Data: ${JSON.stringify(marketData)}
  Competitor Data: ${JSON.stringify(competitorData)}
  
  Consider:
  1. Current demand trends
  2. Competitor pricing
  3. Inventory levels
  4. Historical sales performance
  5. Profit margins
  
  Recommend price adjustment and reasoning.
  `;
  
  const aiResponse = await callOpenAI(prompt);
  return JSON.parse(aiResponse);
};
```

## Data Integration Workflows

### 9. Multi-Source Data Synchronization
**Purpose**: Sync data between CRM, ERP, and other systems

**Workflow Structure:**
```
Schedule Trigger → Get CRM Data → Get ERP Data → Compare & Identify Changes → Update Systems → Log Changes
```

**Data Comparison Logic:**
```javascript
// Compare and sync data between systems
const crmData = $items("CRM Data")[0].json;
const erpData = $items("ERP Data")[0].json;

const changes = [];
const updates = [];

// Find differences
crmData.customers.forEach(crmCustomer => {
  const erpCustomer = erpData.customers.find(c => c.id === crmCustomer.id);
  
  if (!erpCustomer) {
    // New customer in CRM
    changes.push({
      type: 'new_customer',
      system: 'CRM',
      data: crmCustomer
    });
    updates.push({
      action: 'create',
      system: 'ERP',
      data: crmCustomer
    });
  } else {
    // Check for updates
    const fieldsToCompare = ['name', 'email', 'phone', 'address'];
    fieldsToCompare.forEach(field => {
      if (crmCustomer[field] !== erpCustomer[field]) {
        changes.push({
          type: 'field_change',
          customer_id: crmCustomer.id,
          field: field,
          old_value: erpCustomer[field],
          new_value: crmCustomer[field],
          source: 'CRM'
        });
      }
    });
  }
});

return { changes, updates };
```

### 10. Real-time Analytics Dashboard
**Purpose**: Aggregate data from multiple sources for real-time dashboard

**Workflow Structure:**
```
Schedule Trigger (every 5 min) → Parallel Data Collection → Data Aggregation → Push to Dashboard → Alert on Anomalies
```

**Data Aggregation:**
```javascript
// Aggregate metrics from multiple sources
const salesData = $items("Sales API")[0].json;
const webAnalytics = $items("Google Analytics")[0].json;  
const customerData = $items("CRM Data")[0].json;

const dashboard = {
  timestamp: new Date().toISOString(),
  metrics: {
    // Sales metrics
    revenue_today: salesData.revenue_today,
    orders_today: salesData.orders_today,
    avg_order_value: salesData.revenue_today / salesData.orders_today,
    
    // Web metrics
    visitors_today: webAnalytics.visitors,
    conversion_rate: (salesData.orders_today / webAnalytics.visitors * 100).toFixed(2),
    bounce_rate: webAnalytics.bounce_rate,
    
    // Customer metrics
    new_customers_today: customerData.new_customers_count,
    total_active_customers: customerData.active_customers_count,
    churn_rate: customerData.churn_rate,
    
    // Calculated KPIs
    customer_acquisition_cost: salesData.marketing_spend / customerData.new_customers_count,
    lifetime_value: customerData.avg_lifetime_value,
    monthly_recurring_revenue: salesData.subscription_revenue
  },
  alerts: []
};

// Generate alerts for anomalies
if (dashboard.metrics.conversion_rate < 2.0) {
  dashboard.alerts.push({
    type: 'warning',
    message: 'Conversion rate below threshold',
    value: dashboard.metrics.conversion_rate,
    threshold: 2.0
  });
}

return [{ json: dashboard }];
```

## Automation Patterns

### 11. Lead Nurturing Sequence
**Purpose**: Automatically nurture leads through email sequence

**Workflow Structure:**
```
New Lead Trigger → Lead Scoring → Segment Assignment → Email Sequence Start → Track Engagement → Adjust Sequence
```

**Lead Scoring Algorithm:**
```javascript
// Calculate lead score based on multiple factors
const calculateLeadScore = (leadData) => {
  let score = 0;
  
  // Demographic scoring
  if (leadData.job_title?.includes('Manager') || leadData.job_title?.includes('Director')) score += 20;
  if (leadData.company_size > 100) score += 15;
  if (leadData.industry === 'Technology') score += 10;
  
  // Behavioral scoring
  if (leadData.email_opened_count > 5) score += 25;
  if (leadData.link_clicks > 3) score += 20;
  if (leadData.demo_requested) score += 50;
  if (leadData.pricing_page_visited) score += 30;
  
  // Engagement scoring
  if (leadData.social_media_engagement) score += 10;
  if (leadData.webinar_attended) score += 25;
  if (leadData.whitepaper_downloaded) score += 15;
  
  return Math.min(score, 100); // Cap at 100
};

const leads = $input.all();
const scoredLeads = leads.map(lead => {
  const score = calculateLeadScore(lead.json);
  let segment = 'cold';
  
  if (score >= 70) segment = 'hot';
  else if (score >= 40) segment = 'warm';
  
  return {
    json: {
      ...lead.json,
      lead_score: score,
      segment: segment,
      next_action: score >= 70 ? 'sales_contact' : 'nurture_sequence'
    }
  };
});

return scoredLeads;
```

### 12. Social Media Automation
**Purpose**: Cross-post content to multiple social platforms

**Workflow Structure:**
```
Schedule Trigger → Get Content from CMS → Format for Each Platform → Post to Social Media → Track Engagement
```

**Content Formatting:**
```javascript
// Format content for different platforms
const formatForPlatforms = (content) => {
  const baseContent = content.json;
  
  return [
    {
      json: {
        platform: 'twitter',
        content: baseContent.title.substring(0, 240) + '... ' + baseContent.url,
        hashtags: baseContent.hashtags?.slice(0, 3),
        media: baseContent.featured_image
      }
    },
    {
      json: {
        platform: 'linkedin', 
        content: `${baseContent.title}\n\n${baseContent.summary}\n\n${baseContent.url}`,
        hashtags: baseContent.hashtags,
        media: baseContent.featured_image
      }
    },
    {
      json: {
        platform: 'facebook',
        content: `${baseContent.title}\n\n${baseContent.description}`,
        url: baseContent.url,
        media: baseContent.featured_image
      }
    }
  ];
};
```

## Error Handling Patterns

### Error Handling Workflow Template
```javascript
// Comprehensive error handling in Code node
try {
  // Main workflow logic
  const result = await performMainTask($input.all());
  
  return [{
    json: {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    }
  }];
  
} catch (error) {
  // Log error details
  console.error('Workflow error:', error);
  
  // Send alert to monitoring system
  await sendAlert({
    workflow: $workflow.name,
    node: $node.name,
    error: error.message,
    input_data: $input.all(),
    timestamp: new Date().toISOString()
  });
  
  // Return error response
  return [{
    json: {
      success: false,
      error: error.message,
      error_code: error.code || 'UNKNOWN',
      retry_after: 300, // 5 minutes
      fallback_action: 'manual_review_required'
    }
  }];
}
```

### Retry Logic Pattern
```javascript
// Implement retry logic with exponential backoff
const performWithRetry = async (operation, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(`Operation failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Exponential backoff: wait 2^attempt seconds
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
```

## Performance Optimization Patterns

### Batch Processing Template
```javascript
// Process large datasets in batches
const processBatches = (items, batchSize = 100) => {
  const batches = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    batches.push({ json: { batch_number: Math.floor(i / batchSize) + 1, items: batch } });
  }
  
  return batches;
};

// Use with Split in Batches node for efficient processing
```

### Caching Pattern
```javascript
// Simple in-memory cache for API responses
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedOrFetch = async (key, fetchFunction) => {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Cache hit for key:', key);
    return cached.data;
  }
  
  console.log('Cache miss, fetching data for key:', key);
  const data = await fetchFunction();
  
  cache.set(key, {
    data: data,
    timestamp: Date.now()
  });
  
  return data;
};
```

This comprehensive collection of workflow examples and patterns provides practical templates for common automation scenarios, from basic API processing to complex AI-powered business logic.