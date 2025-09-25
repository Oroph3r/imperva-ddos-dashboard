# 📦 Installation Guide - Imperva DDoS Dashboard

Complete step-by-step installation guide for the Imperva DDoS Attack Dashboard.

## 📋 System Requirements

### Minimum Requirements
- **Operating System**: Linux, macOS, or Windows
- **Python**: Version 3.8 or higher
- **Memory**: 512 MB RAM minimum (2 GB recommended)
- **Storage**: 100 MB free disk space
- **Network**: Internet connection for Imperva API access

### Recommended Requirements
- **Python**: Version 3.9+
- **Memory**: 2 GB RAM or higher
- **CPU**: 2 cores or more
- **Storage**: 1 GB free disk space

## 🛠️ Pre-Installation Setup

### 1. Install Python

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

#### CentOS/RHEL
```bash
sudo yum update
sudo yum install python3 python3-pip
```

#### macOS
```bash
# Using Homebrew
brew install python3

# Or download from python.org
```

#### Windows
1. Download Python from [python.org](https://python.org)
2. Run installer and check "Add Python to PATH"
3. Verify installation: `python --version`

### 2. Verify Python Installation
```bash
python3 --version
pip3 --version
```

## 📥 Installation Methods

### Method 1: Direct Installation (Recommended)

#### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/imperva-ddos-dashboard.git
cd imperva-ddos-dashboard
```

#### Step 2: Create Virtual Environment
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

#### Step 3: Install Dependencies
```bash
# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt
```

#### Step 4: Verify Installation
```bash
pip list
```

Expected packages:
```
Flask==2.3.3
python-dotenv==1.0.0
requests==2.31.0
```

### Method 2: Docker Installation

#### Prerequisites
- Docker installed and running
- Docker Compose (optional)

#### Step 1: Build Docker Image
```bash
git clone https://github.com/your-username/imperva-ddos-dashboard.git
cd imperva-ddos-dashboard

# Build image
docker build -t imperva-dashboard .
```

#### Step 2: Run Container
```bash
docker run -p 5000:5000 --env-file .env imperva-dashboard
```

#### Step 3: Using Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  dashboard:
    build: .
    ports:
      - "5000:5000"
    env_file:
      - .env
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

## ⚙️ Configuration Setup

### 1. Environment Variables

#### Create Configuration File
```bash
# Copy template
cp .env.example .env

# Edit configuration
nano .env  # or use your preferred editor
```

#### Required Configuration
```bash
# Imperva API Credentials (Required)
API_KEY=your_imperva_api_key_here
API_ID=your_imperva_api_id_here
ACCOUNT_ID=your_imperva_account_id_here

# Server Configuration (Optional)
HOST=127.0.0.1
PORT=5000
DEBUG=true

# Performance Settings (Optional)
MAX_CONCURRENT_REQUESTS=5
ENABLE_CONCURRENT_REQUESTS=true
```

### 2. Get Imperva API Credentials

#### Step 1: Access Imperva Portal
1. Go to [my.imperva.com](https://my.imperva.com)
2. Log in with your account

#### Step 2: Generate API Key
1. Navigate to **Account Settings**
2. Go to **API Keys** section
3. Click **Create API Key**
4. Copy the generated key

#### Step 3: Get API ID and Account ID
1. In Imperva portal, go to **API Management**
2. Find your **API ID** (numeric)
3. Find your **Account ID** (numeric)

### 3. Security Configuration

#### Production Settings
```bash
# Production environment
DEBUG=false
HOST=127.0.0.1  # or 0.0.0.0 for external access
SECRET_KEY=your-random-secret-key-here

# Generate secret key
python3 -c "import secrets; print(secrets.token_hex(32))"
```

#### File Permissions
```bash
# Secure configuration file
chmod 600 .env

# Set proper permissions
chmod +x app.py
```

## 🚀 First Run

### 1. Start Application
```bash
# Activate virtual environment
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate     # Windows

# Run application
python app.py
```

### 2. Verify Installation
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

You should see the dashboard loading screen.

### 3. Test API Connection
1. Wait for sites to load in the dropdown
2. If you see your Imperva sites, the API connection is working
3. If you see errors, check your credentials

## 🔧 Troubleshooting

### Common Issues

#### Issue 1: Python Version Error
```
Error: Python 3.8+ required
```
**Solution:**
```bash
python3 --version  # Check version
# Upgrade if needed
```

#### Issue 2: Permission Denied
```
Error: Permission denied
```
**Solution:**
```bash
# Fix permissions
chmod +x app.py
sudo chown -R $USER:$USER .
```

#### Issue 3: Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution:**
```bash
# Use different port
export PORT=5001
python app.py

# Or kill existing process
sudo lsof -ti:5000 | xargs sudo kill -9
```

#### Issue 4: API Connection Failed
```
Error: Authentication failed
```
**Solution:**
1. Verify API credentials in `.env`
2. Check Imperva portal for key status
3. Ensure account has API access

#### Issue 5: Module Not Found
```
ModuleNotFoundError: No module named 'flask'
```
**Solution:**
```bash
# Activate virtual environment first
source venv/bin/activate
pip install -r requirements.txt
```

### Debug Mode

Enable debug mode for detailed error information:
```bash
export DEBUG=true
export FLASK_ENV=development
python app.py
```

### Log Analysis
```bash
# Check application logs
tail -f app.log

# Check system logs
sudo tail -f /var/log/messages
```

## 🎯 Performance Optimization

### 1. Concurrent Requests
```bash
# Adjust based on your API limits
MAX_CONCURRENT_REQUESTS=3  # Conservative
MAX_CONCURRENT_REQUESTS=8  # Aggressive
```

### 2. Timeout Configuration
```bash
TIMEOUT_CONNECT=10  # Connection timeout
TIMEOUT_READ=30     # Read timeout
```

### 3. Retry Settings
```bash
MAX_RETRIES=5           # Number of retries
BACKOFF_FACTOR=2.0      # Exponential backoff
```

## 🔄 Updates and Maintenance

### Update Application
```bash
# Pull latest changes
git pull origin main

# Update dependencies
pip install -r requirements.txt --upgrade

# Restart application
python app.py
```

### Backup Configuration
```bash
# Backup your .env file
cp .env .env.backup

# Create backup script
#!/bin/bash
cp .env backups/.env.$(date +%Y%m%d)
```

## 🐳 Advanced Docker Setup

### Multi-stage Dockerfile
```dockerfile
# Build stage
FROM python:3.9-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.9-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

### Production Docker Compose
```yaml
version: '3.8'
services:
  dashboard:
    build: .
    ports:
      - "127.0.0.1:5000:5000"
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## ✅ Installation Checklist

- [ ] Python 3.8+ installed
- [ ] Virtual environment created
- [ ] Dependencies installed
- [ ] `.env` file configured
- [ ] Imperva API credentials obtained
- [ ] Application starts without errors
- [ ] Dashboard loads in browser
- [ ] Sites dropdown populates
- [ ] Test report generation works

## 📞 Support

If you encounter issues during installation:

1. **Check the logs** for detailed error messages
2. **Verify prerequisites** are met
3. **Review configuration** for typos
4. **Test API credentials** in Imperva portal
5. **Create an issue** on GitHub with error details

## 📚 Next Steps

After successful installation:

1. Read the [Usage Guide](USAGE.md)
2. Explore the [API Documentation](API.md)
3. Check out [Configuration Options](CONFIG.md)
4. Learn about [Deployment](DEPLOYMENT.md)

---

**Installation complete! 🎉**

Your Imperva DDoS Dashboard is ready to use. Access it at `http://127.0.0.1:5000`