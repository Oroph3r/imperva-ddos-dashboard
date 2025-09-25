# 🏗️ Architecture Documentation

## 📋 Overview

The Imperva DDoS Dashboard is built with a modern, modular architecture designed for scalability, maintainability, and performance. This document provides a comprehensive overview of the system architecture, component interactions, and design decisions.

## 🎯 Design Principles

### Core Principles

1. **Modularity**: Clear separation of concerns with independent, testable components
2. **Scalability**: Designed to handle large datasets and concurrent requests
3. **Reliability**: Robust error handling and graceful degradation
4. **Security**: Security-first design with secure defaults
5. **Performance**: Optimized for fast data processing and visualization
6. **Maintainability**: Clean, documented code with consistent patterns

### Architectural Patterns

- **Model-View-Controller (MVC)**: Clear separation of data, presentation, and logic
- **Repository Pattern**: Abstracted data access through the Imperva API client
- **Factory Pattern**: Configuration management and application creation
- **Observer Pattern**: Event-driven updates and real-time data handling

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   HTML/CSS  │  │ JavaScript  │  │    Visualization    │ │
│  │  Templates  │  │   Modules   │  │     Libraries       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │    Flask    │  │   Routes    │  │    Controllers      │ │
│  │ Application │  │  Handlers   │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │    Data     │  │   Security  │  │     Analytics       │ │
│  │ Processing  │  │   Rules     │  │    Processing       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Access Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Imperva   │  │   Request   │  │      Caching        │ │
│  │ API Client  │  │  Handlers   │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Imperva   │  │    CDN/     │  │    Monitoring       │ │
│  │     API     │  │   Assets    │  │    Services         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure

```
imperva-ddos-dashboard/
├── app.py                      # Main application entry point
├── config/                     # Configuration management
│   ├── __init__.py
│   └── settings.py             # Environment configuration
├── api/                        # Data access layer
│   ├── __init__.py
│   └── imperva_client.py       # Imperva API client
├── static/                     # Frontend assets
│   ├── css/
│   │   └── main.css           # Application styling
│   ├── js/
│   │   ├── app.js             # Main application logic
│   │   ├── charts.js          # Chart management
│   │   └── data-processing.js # Data processing utilities
│   └── assets/                # Images, icons, etc.
├── templates/                  # HTML templates
│   └── index.html             # Main dashboard template
├── utils/                      # Utility functions
│   └── __init__.py
├── tests/                      # Test suite
│   ├── test_api.py
│   ├── test_app.py
│   └── fixtures/
├── docs/                       # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── TROUBLESHOOTING.md
├── requirements.txt            # Python dependencies
├── requirements-dev.txt        # Development dependencies
├── .env                       # Environment variables
├── .gitignore                # Git ignore rules
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose setup
└── README.md                 # Project documentation
```

## 🔧 Component Architecture

### 1. Application Layer (`app.py`)

**Responsibility**: Main application orchestration and HTTP request handling

```python
# Key Components:
- Flask application factory
- Route registration
- Global state management
- Background task coordination
- Error handling middleware
```

**Design Patterns**:
- **Factory Pattern**: `create_app()` function for application creation
- **Singleton Pattern**: Global caches for sites and configuration
- **Observer Pattern**: Background task coordination

### 2. Configuration Layer (`config/`)

**Responsibility**: Environment-based configuration management

```python
# Key Components:
- Environment variable loading
- Configuration validation
- Multi-environment support (dev/prod/test)
- Security settings management
```

**Features**:
- Type conversion and validation
- Required parameter checking
- Environment-specific overrides
- Secure defaults

### 3. Data Access Layer (`api/`)

**Responsibility**: External API communication and data retrieval

```python
# Key Components:
- Imperva API client
- Request/response handling
- Connection management
- Error handling and retries
- Rate limiting
```

**Design Patterns**:
- **Repository Pattern**: Abstract data access
- **Circuit Breaker Pattern**: Failure handling
- **Retry Pattern**: Resilient API calls

#### API Client Architecture

```python
class ImpervaAPI:
    """
    High-performance API client with advanced features:
    - Concurrent request processing
    - Automatic retry with exponential backoff
    - Connection pooling and session management
    - Dynamic endpoint fallback
    - Comprehensive error handling
    """

    def __init__(self):
        # Session management with connection pooling
        self.session = self._create_resilient_session()

        # Multi-URL failover capability
        self.base_urls = [...]

        # Performance optimization
        self.concurrent_executor = ThreadPoolExecutor()
```

### 4. Business Logic Layer

**Responsibility**: Data processing, analytics, and business rules

#### Data Processing (`static/js/data-processing.js`)

```javascript
// Key Components:
- Attack data aggregation
- Geographic data processing
- Time-series analysis
- Statistical calculations
- Filter applications
```

**Processing Pipeline**:
1. **Raw Data Ingestion**: Receive API data
2. **Data Validation**: Ensure data integrity
3. **Transformation**: Convert to analysis-ready format
4. **Aggregation**: Group and summarize data
5. **Analytics**: Generate insights and metrics

#### Security Rules Processing

```python
# Security rule correlation and analysis
- Rule effectiveness analysis
- Attack pattern recognition
- Threat categorization
- Risk assessment
```

### 5. Presentation Layer

**Responsibility**: User interface and data visualization

#### Frontend Architecture

```javascript
// Modular JavaScript Architecture:

// 1. Application Controller (app.js)
const AppController = {
    // State management
    // Event coordination
    // API communication
    // UI orchestration
};

// 2. Chart Manager (charts.js)
const ChartManager = {
    // Chart lifecycle management
    // Data visualization
    // Interactive features
    // Performance optimization
};

// 3. Data Processor (data-processing.js)
const DataProcessor = {
    // Data transformation
    // Analytics calculations
    // Filter applications
    // Export functions
};
```

## 🔄 Data Flow Architecture

### Request Flow

```
1. User Interaction
   ↓
2. JavaScript Event Handler
   ↓
3. API Request Formation
   ↓
4. Flask Route Handler
   ↓
5. Business Logic Processing
   ↓
6. Imperva API Client
   ↓
7. External API Call
   ↓
8. Response Processing
   ↓
9. Data Transformation
   ↓
10. JSON Response
    ↓
11. Frontend Processing
    ↓
12. Chart/UI Update
```

### Data Processing Pipeline

```
Raw API Data → Validation → Transformation → Aggregation → Analytics → Visualization
      ↓              ↓             ↓            ↓           ↓            ↓
   Error         Data Types    Normalization  Grouping   Statistics   Charts
  Handling      Validation     Time Zones     Filtering  Calculations  Maps
   Logging      Range Check    Formatting     Sorting    Trends       Tables
```

## ⚡ Performance Architecture

### Concurrent Processing

```python
# Multi-threaded API processing
def get_ddos_visits_concurrent(self, site_id, start_time, end_time, max_concurrent=5):
    """
    High-performance concurrent data fetching:

    1. Dynamic page discovery
    2. Batched concurrent requests
    3. Intelligent failure handling
    4. Memory-efficient processing
    5. Progress tracking
    """

    # ThreadPoolExecutor for concurrent API calls
    with ThreadPoolExecutor(max_workers=max_concurrent) as executor:
        # Submit batch requests
        futures = {executor.submit(fetch_page, page): page for page in pages}

        # Collect results as they complete
        for future in as_completed(futures):
            # Process results incrementally
```

### Caching Strategy

```python
# Multi-level caching approach:

# 1. Application-level caching
sites_cache = {
    'data': [],
    'status': 'loading',
    'last_updated': None,
    'error_message': None
}

# 2. Session-level caching
# Maintain data across requests within user session

# 3. Browser-level caching
# Static assets with proper cache headers
```

### Memory Management

```javascript
// Frontend memory optimization:

// 1. Lazy loading of large datasets
// 2. Virtual scrolling for large tables
// 3. Chart data decimation for performance
// 4. Garbage collection friendly patterns
// 5. Efficient DOM manipulation
```

## 🔒 Security Architecture

### Defense in Depth

```
1. Network Layer
   - HTTPS enforcement
   - Firewall rules
   - VPN access

2. Application Layer
   - Input validation
   - Output encoding
   - Error handling

3. Data Layer
   - Credential management
   - API key security
   - Data encryption

4. Infrastructure Layer
   - Container security
   - System hardening
   - Access controls
```

### Security Components

```python
# Input validation and sanitization
def validate_request_data(data):
    """
    Comprehensive input validation:
    - Type checking
    - Range validation
    - Format verification
    - Injection prevention
    """

# Secure credential management
class Config:
    """
    Environment-based configuration:
    - No hardcoded secrets
    - Validation of required vars
    - Secure defaults
    """

# Error handling without information disclosure
def safe_error_response(error):
    """
    Security-conscious error handling:
    - Generic error messages
    - Detailed logging
    - No stack trace exposure
    """
```

## 🚀 Scalability Architecture

### Horizontal Scaling

```yaml
# Docker Compose scaling example:
version: '3.8'
services:
  dashboard:
    build: .
    deploy:
      replicas: 3
    ports:
      - "5000-5002:5000"
```

### Vertical Scaling

```python
# Configuration for different deployment sizes:

# Small deployment (1-2 users)
MAX_CONCURRENT_REQUESTS = 3
TIMEOUT_READ = 30

# Medium deployment (5-10 users)
MAX_CONCURRENT_REQUESTS = 8
TIMEOUT_READ = 60

# Large deployment (20+ users)
MAX_CONCURRENT_REQUESTS = 15
TIMEOUT_READ = 120
```

### Performance Optimization

```python
# Adaptive request handling:
def optimize_request_strategy(self, data_size):
    """
    Dynamic optimization based on data size:
    - Small datasets: Sequential processing
    - Medium datasets: Limited concurrency
    - Large datasets: Full concurrency with batching
    """
```

## 🔄 API Architecture

### RESTful Design

```python
# Endpoint design following REST principles:

GET    /api/sites              # List all sites
GET    /api/sites/{id}         # Get specific site
POST   /api/ddos-report        # Generate report
GET    /api/health             # Health check
```

### Response Format

```json
{
  "success": true,
  "data": {
    "visits": [...],
    "total_visits": 1500,
    "stats": {...}
  },
  "metadata": {
    "request_id": "uuid",
    "timestamp": "2024-01-01T12:00:00Z",
    "processing_time": 2.5
  },
  "pagination": {
    "page": 1,
    "per_page": 100,
    "total_pages": 15
  }
}
```

## 🧪 Testing Architecture

### Test Pyramid

```
                    ╱ E2E Tests ╲
                  ╱             ╲
                ╱   Integration   ╲
              ╱      Tests         ╲
            ╱                       ╲
          ╱          Unit            ╲
        ╱           Tests             ╲
      ╱___________________________ ╲
```

### Testing Layers

1. **Unit Tests**: Individual function testing
2. **Integration Tests**: Component interaction testing
3. **End-to-End Tests**: Full workflow testing
4. **Performance Tests**: Load and stress testing
5. **Security Tests**: Vulnerability testing

## 📊 Monitoring Architecture

### Observability Stack

```python
# Built-in monitoring capabilities:

# 1. Health checks
@app.route('/health')
def health_check():
    return {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0'
    }

# 2. Performance metrics
def track_request_performance():
    # Request duration
    # Error rates
    # Resource utilization

# 3. Business metrics
def track_business_metrics():
    # Reports generated
    # Data volume processed
    # User activity
```

## 🔮 Future Architecture Considerations

### Planned Enhancements

1. **Microservices**: Split into focused services
2. **Message Queues**: Async processing with Redis/RabbitMQ
3. **Database**: Persistent storage for historical data
4. **Real-time**: WebSocket support for live updates
5. **Machine Learning**: AI-powered threat analysis

### Technology Evolution

```python
# Future architecture components:

# 1. Event-driven architecture
# 2. Container orchestration (Kubernetes)
# 3. Service mesh (Istio)
# 4. Distributed tracing
# 5. Advanced analytics pipeline
```

## 🎯 Architecture Decisions

### Key Decisions and Rationale

1. **Flask Framework**
   - **Decision**: Use Flask over Django
   - **Rationale**: Lightweight, flexible, minimal dependencies
   - **Trade-offs**: Manual configuration vs. built-in features

2. **Frontend Architecture**
   - **Decision**: Vanilla JavaScript over frameworks
   - **Rationale**: Simplicity, performance, no build process
   - **Trade-offs**: Manual DOM management vs. framework overhead

3. **Concurrent Processing**
   - **Decision**: ThreadPoolExecutor for API calls
   - **Rationale**: I/O bound operations, GIL not a concern
   - **Trade-offs**: Thread overhead vs. asyncio complexity

4. **Caching Strategy**
   - **Decision**: In-memory application caching
   - **Rationale**: Simple deployment, fast access
   - **Trade-offs**: Memory usage vs. external cache complexity

## 📚 Architecture References

### Design Patterns Used

- **Factory Pattern**: Application and client creation
- **Repository Pattern**: Data access abstraction
- **Observer Pattern**: Event handling and updates
- **Circuit Breaker**: API failure handling
- **Retry Pattern**: Resilient external calls

### Best Practices Implemented

- **Separation of Concerns**: Clear layer boundaries
- **Single Responsibility**: Focused component design
- **Dependency Injection**: Configuration and client injection
- **Error Handling**: Comprehensive exception management
- **Security by Design**: Built-in security considerations

---

**This architecture provides a solid foundation for scaling, maintaining, and extending the Imperva DDoS Dashboard while maintaining security and performance standards. 🏗️**