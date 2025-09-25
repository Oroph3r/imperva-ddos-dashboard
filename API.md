# 🔌 API Documentation

## 📋 Overview

The Imperva DDoS Dashboard provides a REST API for programmatic access to attack analytics and reporting capabilities. This API allows integration with external systems, automation of reporting tasks, and custom application development.

## 🎯 API Endpoints

### Base URL

```
http://127.0.0.1:5000/api
```

### Authentication

The API uses the same Imperva credentials configured in the dashboard environment variables. No additional authentication is required for API access.

---

## 📍 Endpoints

### 1. Health Check

Check the application health and status.

#### `GET /health`

**Description**: Returns the current health status of the application.

**Request:**
```http
GET /health HTTP/1.1
Host: 127.0.0.1:5000
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0"
}
```

**Response Codes:**
- `200`: Application is healthy
- `503`: Application is unhealthy

---

### 2. Sites Management

#### `GET /api/sites`

**Description**: Retrieve all available Imperva sites.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `refresh` | boolean | No | Force refresh of sites cache |

**Request:**
```http
GET /api/sites?refresh=true HTTP/1.1
Host: 127.0.0.1:5000
```

**Response (Success):**
```json
{
  "status": "ready",
  "sites": [
    {
      "site_id": "12345",
      "domain": "example.com",
      "account_id": "67890"
    },
    {
      "site_id": "12346",
      "domain": "test.com",
      "account_id": "67890"
    }
  ],
  "total_sites": 2,
  "last_updated": "2024-01-15T10:30:00.000Z",
  "error_message": null,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "success": true
}
```

**Response (Loading):**
```json
{
  "status": "loading",
  "sites": [],
  "total_sites": 0,
  "last_updated": null,
  "error_message": null,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "success": false
}
```

**Response (Error):**
```json
{
  "status": "error",
  "sites": [],
  "total_sites": 0,
  "last_updated": null,
  "error_message": "Authentication Error: API authentication failed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "success": false
}
```

**Response Codes:**
- `200`: Sites successfully retrieved
- `202`: Sites are still loading (check back later)
- `503`: Error loading sites (check credentials)

---

### 3. DDoS Report Generation

#### `POST /api/ddos-report`

**Description**: Generate a comprehensive DDoS attack report for a specific site and time range.

**Request Body:**
```json
{
  "site_id": "12345",
  "start_date": "2024-01-01T00:00:00",
  "end_date": "2024-01-02T00:00:00",
  "country_filter": "US"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `site_id` | string | Yes | Imperva site ID |
| `start_date` | string | Yes | ISO 8601 formatted start date |
| `end_date` | string | Yes | ISO 8601 formatted end date |
| `country_filter` | string | No | Filter by country code (e.g., "US", "CN") or "all" |

**Request:**
```http
POST /api/ddos-report HTTP/1.1
Host: 127.0.0.1:5000
Content-Type: application/json

{
  "site_id": "12345",
  "start_date": "2024-01-01T00:00:00",
  "end_date": "2024-01-02T00:00:00",
  "country_filter": "all"
}
```

**Response (Success):**
```json
{
  "visits": [
    {
      "timestamp": 1704067200000,
      "ip": "192.168.1.100",
      "country": ["US"],
      "user_agent": "Mozilla/5.0...",
      "request_size": 1024,
      "response_time": 150,
      "security_summary": {
        "DDoS": 5,
        "Bot": 2
      },
      "incap_rules": [
        {
          "rule_id": "123",
          "action": "block",
          "triggered": 3
        }
      ]
    }
  ],
  "total_pages": 5,
  "total_visits": 1500,
  "request_info": {
    "site_id": "12345",
    "date_range": "2024-01-01 00:00 to 2024-01-02 00:00",
    "country_filter": "all",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "rules_map": {
    "123": {
      "id": "123",
      "name": "DDoS Protection Rule",
      "action": "RULE_ACTION_BLOCK",
      "enabled": true,
      "type": "incap_rule"
    }
  },
  "stats": {
    "incap_rules": [
      {
        "rule_id": "123",
        "hits": 250,
        "rule_name": "DDoS Protection Rule"
      }
    ],
    "threats": [
      {
        "threat_type": "DDoS",
        "count": 1200,
        "percentage": 80.0
      }
    ],
    "incap_rules_timeseries": [
      {
        "timestamp": 1704067200000,
        "rule_123": 50,
        "rule_124": 25
      }
    ]
  },
  "success": true
}
```

**Response (Error):**
```json
{
  "error": "Authentication Error",
  "message": "API authentication failed (HTTP 403)",
  "suggestion": "Please check your API credentials in the .env file",
  "partial_data": null,
  "retry_recommended": false,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Response Codes:**
- `200`: Report generated successfully
- `400`: Invalid request parameters
- `403`: Authentication failed
- `500`: Internal server error
- `503`: Service unavailable (connectivity issues)

---

## 📊 Data Models

### Site Object

```json
{
  "site_id": "string",        // Unique Imperva site identifier
  "domain": "string",         // Domain name
  "account_id": "string"      // Imperva account ID
}
```

### Visit Object

```json
{
  "timestamp": "number",      // Unix timestamp in milliseconds
  "ip": "string",            // Source IP address
  "country": ["string"],     // Array of country codes
  "user_agent": "string",    // User agent string
  "request_size": "number",  // Request size in bytes
  "response_time": "number", // Response time in milliseconds
  "security_summary": {     // Security event summary
    "DDoS": "number",        // DDoS attack count
    "Bot": "number",         // Bot detection count
    "SQLi": "number"         // SQL injection attempts
  },
  "incap_rules": [           // Triggered security rules
    {
      "rule_id": "string",   // Rule identifier
      "action": "string",    // Action taken (block/alert)
      "triggered": "number"  // Number of triggers
    }
  ]
}
```

### Security Rule Object

```json
{
  "id": "string",            // Rule ID
  "name": "string",          // Human-readable name
  "action": "string",        // Rule action (RULE_ACTION_BLOCK, etc.)
  "enabled": "boolean",      // Rule enabled status
  "filter": "string",        // Rule filter criteria
  "type": "string"           // Rule type (incap_rule, rate_rule)
}
```

### Statistics Objects

#### Incap Rules Stats
```json
{
  "rule_id": "string",       // Rule identifier
  "hits": "number",          // Number of hits
  "rule_name": "string"      // Rule name
}
```

#### Threats Stats
```json
{
  "threat_type": "string",   // Type of threat
  "count": "number",         // Number of occurrences
  "percentage": "number"     // Percentage of total threats
}
```

#### Timeseries Data
```json
{
  "timestamp": "number",     // Unix timestamp in milliseconds
  "rule_123": "number",      // Hits for rule 123
  "rule_124": "number"       // Hits for rule 124
}
```

---

## 🔧 Error Handling

### Error Response Format

All API errors follow a consistent format:

```json
{
  "error": "string",         // Error category
  "message": "string",       // Detailed error message
  "suggestion": "string",    // Suggested resolution
  "partial_data": "object",  // Partial data if available
  "retry_recommended": "boolean", // Whether to retry
  "timestamp": "string"      // ISO 8601 timestamp
}
```

### Common Error Types

#### Authentication Errors
- **Status**: 403 Forbidden
- **Error**: "Authentication Error"
- **Causes**: Invalid API credentials, expired keys

#### Connectivity Errors
- **Status**: 503 Service Unavailable
- **Error**: "Connectivity Error"
- **Causes**: Network issues, Imperva API downtime

#### Validation Errors
- **Status**: 400 Bad Request
- **Error**: "Validation Error"
- **Causes**: Missing required parameters, invalid date formats

#### Rate Limiting
- **Status**: 429 Too Many Requests
- **Error**: "Rate Limit Exceeded"
- **Causes**: Too many concurrent requests

---

## 🚀 Usage Examples

### Python Example

```python
import requests
import json
from datetime import datetime, timedelta

# Base configuration
API_BASE_URL = "http://127.0.0.1:5000/api"

class DashboardAPI:
    def __init__(self, base_url):
        self.base_url = base_url

    def get_sites(self):
        """Get all available sites"""
        response = requests.get(f"{self.base_url}/sites")
        return response.json()

    def generate_report(self, site_id, start_date, end_date, country_filter="all"):
        """Generate DDoS report"""
        payload = {
            "site_id": site_id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "country_filter": country_filter
        }

        response = requests.post(
            f"{self.base_url}/ddos-report",
            headers={"Content-Type": "application/json"},
            data=json.dumps(payload)
        )

        return response.json()

# Usage
api = DashboardAPI(API_BASE_URL)

# Get sites
sites = api.get_sites()
if sites["success"]:
    print(f"Found {sites['total_sites']} sites")

    # Generate report for first site
    if sites["sites"]:
        site_id = sites["sites"][0]["site_id"]
        end_date = datetime.now()
        start_date = end_date - timedelta(days=1)

        report = api.generate_report(site_id, start_date, end_date)
        if report.get("success"):
            print(f"Generated report with {report['total_visits']} visits")
        else:
            print(f"Error: {report.get('error')}")
```

### JavaScript Example

```javascript
class DashboardAPI {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async getSites() {
        try {
            const response = await fetch(`${this.baseUrl}/sites`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching sites:', error);
            throw error;
        }
    }

    async generateReport(siteId, startDate, endDate, countryFilter = 'all') {
        const payload = {
            site_id: siteId,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            country_filter: countryFilter
        };

        try {
            const response = await fetch(`${this.baseUrl}/ddos-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            return await response.json();
        } catch (error) {
            console.error('Error generating report:', error);
            throw error;
        }
    }
}

// Usage
const api = new DashboardAPI('http://127.0.0.1:5000/api');

async function example() {
    try {
        // Get sites
        const sites = await api.getSites();
        console.log(`Found ${sites.total_sites} sites`);

        if (sites.sites.length > 0) {
            // Generate report for first site
            const siteId = sites.sites[0].site_id;
            const endDate = new Date();
            const startDate = new Date(endDate - 24 * 60 * 60 * 1000); // 24 hours ago

            const report = await api.generateReport(siteId, startDate, endDate);
            console.log(`Generated report with ${report.total_visits} visits`);
        }
    } catch (error) {
        console.error('API error:', error);
    }
}

example();
```

### cURL Examples

#### Get Sites
```bash
curl -X GET "http://127.0.0.1:5000/api/sites" \
     -H "Accept: application/json"
```

#### Generate Report
```bash
curl -X POST "http://127.0.0.1:5000/api/ddos-report" \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{
       "site_id": "12345",
       "start_date": "2024-01-01T00:00:00",
       "end_date": "2024-01-02T00:00:00",
       "country_filter": "US"
     }'
```

#### Health Check
```bash
curl -X GET "http://127.0.0.1:5000/health" \
     -H "Accept: application/json"
```

---

## 🔒 Security Considerations

### API Security

1. **Network Security**
   - API runs on localhost by default
   - Use HTTPS in production
   - Implement firewall rules

2. **Authentication**
   - Uses Imperva API credentials
   - No additional API key required
   - Secure credential storage

3. **Input Validation**
   - All inputs are validated
   - SQL injection prevention
   - XSS protection

4. **Rate Limiting**
   - Built-in request throttling
   - Concurrent request limits
   - Graceful degradation

### Best Practices

1. **Secure Deployment**
   ```python
   # Production configuration
   HOST = "127.0.0.1"  # Localhost only
   DEBUG = False       # Disable debug mode
   ```

2. **Error Handling**
   - Never expose internal details
   - Log errors securely
   - Provide helpful error messages

3. **Data Protection**
   - No persistent storage of sensitive data
   - Secure data transmission
   - Minimal data retention

---

## 📈 Performance Considerations

### Request Optimization

1. **Concurrent Processing**
   - Multiple API requests in parallel
   - Configurable concurrency limits
   - Intelligent batching

2. **Caching**
   - Sites cache for faster access
   - Configurable cache duration
   - Memory-efficient storage

3. **Data Processing**
   - Streaming data processing
   - Memory-conscious algorithms
   - Efficient data structures

### Monitoring

1. **Performance Metrics**
   - Request duration tracking
   - Memory usage monitoring
   - Error rate tracking

2. **Health Checks**
   - Application health endpoint
   - Dependency status checking
   - Resource utilization

---

## 🔄 API Versioning

### Current Version: v1

The API is currently at version 1. Future versions will be backward compatible or clearly documented with migration paths.

### Version Headers

```http
API-Version: 1.0
```

### Deprecation Policy

- 6 months notice for breaking changes
- Backward compatibility maintained
- Clear migration documentation

---

## 📞 Support and Troubleshooting

### Common Issues

1. **Sites Not Loading**
   - Check API credentials
   - Verify network connectivity
   - Review application logs

2. **Slow Report Generation**
   - Reduce time range
   - Apply geographic filters
   - Check API rate limits

3. **Authentication Errors**
   - Verify Imperva credentials
   - Check account permissions
   - Test in Imperva portal

### Getting Help

- **Documentation**: Check USAGE.md and TROUBLESHOOTING.md
- **Issues**: Report bugs on GitHub Issues
- **Community**: Join GitHub Discussions

---

**The API provides powerful programmatic access to Imperva DDoS analytics. Use responsibly and follow security best practices! 🔌**