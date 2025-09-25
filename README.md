# 🛡️ Imperva DDoS Attack Dashboard

> **A comprehensive real-time dashboard for visualizing and analyzing DDoS attacks through the Imperva API**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-brightgreen.svg)
![Flask](https://img.shields.io/badge/flask-2.3+-orange.svg)
![Status](https://img.shields.io/badge/status-production%20ready-success.svg)

## 🌟 Overview

The **Imperva DDoS Attack Dashboard** is a powerful, enterprise-grade web application designed to provide real-time visualization and comprehensive analysis of DDoS attacks and security threats. Built specifically for Imperva Cloud WAF users, this dashboard transforms raw attack data into actionable intelligence through intuitive charts, geographic visualizations, and detailed analytics.

### 🎯 Key Features

- **🚨 Real-Time Attack Monitoring** - Live visualization of ongoing DDoS attacks
- **🗺️ Geographic Attack Mapping** - Interactive world map showing attack origins
- **📊 Comprehensive Analytics** - Detailed charts and statistics for threat intelligence
- **⚡ High-Performance Data Processing** - Concurrent API requests for fast data retrieval
- **🔒 Security-First Design** - Secure credential management and error handling
- **📱 Responsive Dashboard** - Modern, mobile-friendly interface
- **🎨 Executive Reporting** - Professional charts suitable for C-level presentations
- **🔄 Advanced Filtering** - Filter by country, time range, and attack patterns

### 🏢 Use Cases

- **Security Operations Centers (SOC)** - Monitor and respond to active threats
- **Executive Reporting** - Generate professional security reports for leadership
- **Incident Response** - Analyze attack patterns and threat intelligence
- **Compliance Reporting** - Document security events for audit purposes
- **Threat Research** - Study attack trends and patterns over time


## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Imperva Cloud WAF account with API access
- Valid Imperva API credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/imperva-ddos-dashboard.git
   cd imperva-ddos-dashboard
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure credentials**
   ```bash
   cp .env.example .env
   # Edit .env with your Imperva API credentials
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Access the dashboard**
   Open your browser to `http://127.0.0.1:5000`

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `API_KEY` | Your Imperva API Key | ✅ | `12345678-1234-1234-1234-123456789abc` |
| `API_ID` | Your Imperva API ID | ✅ | `123456` |
| `ACCOUNT_ID` | Your Imperva Account ID | ✅ | `1234567` |
| `HOST` | Server bind address | ❌ | `127.0.0.1` |
| `PORT` | Server port | ❌ | `5000` |
| `DEBUG` | Enable debug mode | ❌ | `true` |
| `MAX_CONCURRENT_REQUESTS` | Concurrent API requests | ❌ | `5` |

### Performance Tuning

- **Concurrent Requests**: Adjust `MAX_CONCURRENT_REQUESTS` (1-10) based on your API rate limits
- **Timeouts**: Configure `TIMEOUT_CONNECT` and `TIMEOUT_READ` for your network conditions
- **Retry Logic**: Modify `MAX_RETRIES` and `BACKOFF_FACTOR` for resilient API calls

## 📋 Features Deep Dive

### 🎯 Attack Visualization

- **Timeline Charts** - Show attack patterns over time
- **Geographic Maps** - Interactive world map with attack origins
- **Threat Categories** - Breakdown by attack types and severity
- **Traffic Analysis** - Legitimate vs malicious traffic patterns

### 📊 Analytics & Reporting

- **Executive Summary** - High-level security metrics
- **Attack Patterns** - Detailed analysis of threat behaviors
- **Country Statistics** - Geographic distribution of attacks
- **Time-based Analysis** - Hourly, daily, and weekly trends

### 🔧 Advanced Features

- **Real-time Updates** - Live data streaming
- **Custom Date Ranges** - Flexible time period selection
- **Export Capabilities** - Download reports in various formats
- **Alert System** - Notifications for critical events

## 🏗️ Architecture

```
imperva-ddos-dashboard/
├── app.py                 # Main Flask application
├── config/
│   ├── __init__.py
│   └── settings.py        # Configuration management
├── api/
│   ├── __init__.py
│   └── imperva_client.py  # Imperva API client
├── static/
│   ├── css/
│   │   └── main.css       # Dashboard styling
│   └── js/
│       ├── app.js         # Main application logic
│       ├── charts.js      # Chart management
│       └── data-processing.js # Data analysis
├── templates/
│   └── index.html         # Main dashboard template
├── utils/
│   └── __init__.py
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
└── README.md             # This file
```

### Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Highcharts.js
- **Maps**: Highcharts Maps
- **Styling**: Custom CSS with executive theme
- **API Client**: Requests with retry logic

## 🔒 Security Features

- **Credential Management** - Secure environment variable handling
- **Rate Limiting** - Built-in API rate limit handling
- **Error Handling** - Comprehensive exception management
- **Input Validation** - Sanitized user inputs
- **Secure Headers** - Security-focused HTTP headers

## 📈 Performance Optimization

- **Concurrent Processing** - Parallel API requests for faster data retrieval
- **Caching Strategy** - Intelligent data caching to reduce API calls
- **Lazy Loading** - Progressive data loading for better UX
- **Memory Management** - Efficient data structures and cleanup


## 🚀 Deployment

### Production Deployment

1. **Set production environment**
   ```bash
   export FLASK_ENV=production
   export DEBUG=false
   ```

2. **Use production WSGI server**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:8000 app:app
   ```

3. **Configure reverse proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

## 🧪 Testing

Run the test suite:

```bash
python -m pytest tests/
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🙏 Acknowledgments

- Imperva for providing the comprehensive API
- The Flask community for the excellent framework
- Highcharts for powerful visualization capabilities

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/your-username/imperva-ddos-dashboard?style=social)
![GitHub forks](https://img.shields.io/github/forks/your-username/imperva-ddos-dashboard?style=social)
![GitHub issues](https://img.shields.io/github/issues/your-username/imperva-ddos-dashboard)
![GitHub pull requests](https://img.shields.io/github/issues-pr/your-username/imperva-ddos-dashboard)

---

**Made with ❤️ for cybersecurity professionals**

*Built by [Elias Garrido](https://github.com/your-username) - Cybersecurity Specialist*