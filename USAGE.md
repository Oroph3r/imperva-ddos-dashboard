# 📖 Usage Guide - Imperva DDoS Dashboard

Comprehensive guide for using the Imperva DDoS Attack Dashboard effectively.

## 🎯 Getting Started

### First Time Setup

1. **Launch the Application**
   ```bash
   source venv/bin/activate
   python app.py
   ```

2. **Access the Dashboard**
   Open your browser to: `http://127.0.0.1:5000`

3. **Wait for Site Loading**
   The application will automatically load your Imperva sites. This may take a few moments.

4. **Verify Connection**
   You should see your sites appear in the dropdown menu.

## 🖥️ Dashboard Overview

### Main Interface Components

#### 1. **Site Selection Panel**
- **Site Dropdown**: Choose from your available Imperva sites
- **Search Function**: Quickly find sites by domain name
- **Refresh Button**: Reload sites if needed

#### 2. **Time Range Controls**
- **Start Date/Time**: Select beginning of analysis period
- **End Date/Time**: Select end of analysis period
- **Quick Presets**: Last 24h, 7 days, 30 days buttons

#### 3. **Filter Options**
- **Country Filter**: Analyze attacks from specific countries
- **Threat Type Filter**: Focus on specific attack patterns
- **Traffic Type Filter**: All traffic, attacks only, or clean traffic

#### 4. **Action Buttons**
- **Generate Report**: Start analysis with current settings
- **Export Data**: Download results in various formats
- **Settings**: Configure dashboard preferences

### Dashboard Sections

#### 🎛️ **Control Panel**
The top section where you configure your analysis:
- Site selection
- Time range picker
- Filter controls
- Generate report button

#### 📊 **Analytics Overview**
High-level metrics displayed as cards:
- Total attacks detected
- Geographic regions affected
- Peak attack intensity
- Attack duration statistics

#### 🗺️ **Geographic Visualization**
Interactive world map showing:
- Attack origins by country
- Attack intensity heat mapping
- Click countries for detailed statistics
- Zoom and pan functionality

#### 📈 **Trend Analysis Charts**
Time-series visualizations:
- Attack volume over time
- Attack types timeline
- Traffic patterns
- Threat escalation curves

#### 🎯 **Threat Intelligence**
Detailed attack breakdowns:
- Attack vector analysis
- Threat category distribution
- Security rule triggers
- Blocked vs. allowed traffic

## 📋 Step-by-Step Usage

### Basic Report Generation

#### Step 1: Select Your Site
1. Click the **Site** dropdown
2. Search or scroll to find your domain
3. Select the site to analyze

#### Step 2: Set Time Range
1. Click **Start Date** field
2. Choose start date and time
3. Click **End Date** field
4. Choose end date and time

**💡 Tip**: Use the preset buttons for common ranges:
- **Last 24h**: Quick view of recent activity
- **Last 7 days**: Weekly security overview
- **Last 30 days**: Monthly trend analysis

#### Step 3: Apply Filters (Optional)
1. **Country Filter**:
   - Select "All Countries" for global view
   - Choose specific country for regional analysis

2. **Threat Filter**:
   - "All Threats" for comprehensive view
   - Specific threat types for focused analysis

#### Step 4: Generate Report
1. Click **Generate Report** button
2. Wait for data processing (progress indicator will show)
3. Review results in the dashboard

### Advanced Filtering

#### Geographic Filtering
```
Purpose: Analyze attacks from specific regions
Use Case: Investigate regional threat patterns
```

**Steps:**
1. Select site and time range
2. Choose **Country Filter** dropdown
3. Select specific country (e.g., "China", "Russia")
4. Generate report for regional analysis

#### Threat Type Analysis
```
Purpose: Focus on specific attack vectors
Use Case: Understand attack methodology
```

**Available Filters:**
- **DDoS Attacks**: Volumetric attacks
- **Application Attacks**: Layer 7 attacks
- **Bot Traffic**: Automated threats
- **Security Violations**: Rule-based blocks

### Real-Time Monitoring

#### Live Dashboard Mode
1. Set time range to "Last 1 hour"
2. Enable auto-refresh (if available)
3. Monitor real-time attack patterns
4. Use for active incident response

#### Alert Configuration
1. Access **Settings** panel
2. Configure alert thresholds
3. Set notification preferences
4. Enable real-time monitoring

## 📊 Understanding the Visualizations

### Geographic Attack Map

#### Map Features
- **Color Coding**: Intensity of attacks by country
  - Light colors: Low attack volume
  - Dark colors: High attack volume
- **Interactive**: Click countries for details
- **Zoom**: Use mouse wheel to zoom in/out
- **Pan**: Drag to move around the map

#### Map Data Points
- **Attack Count**: Total attacks from each country
- **Percentage**: Relative attack distribution
- **Top IPs**: Most active attacking IPs per country

### Timeline Charts

#### Attack Volume Chart
```
X-Axis: Time periods (hours/days)
Y-Axis: Number of attacks
Purpose: Identify attack patterns and peaks
```

**Reading the Chart:**
- **Spikes**: High-intensity attack periods
- **Valleys**: Quiet periods
- **Trends**: Increasing/decreasing attack patterns

#### Traffic Analysis Chart
```
Purpose: Distinguish legitimate vs malicious traffic
Data: Attack traffic vs clean traffic over time
```

**Chart Elements:**
- **Red Areas**: Attack traffic
- **Green Areas**: Legitimate traffic
- **Yellow Areas**: Suspicious traffic

### Threat Intelligence Tables

#### Attack Summary Table
| Column | Description | Use Case |
|--------|-------------|----------|
| **Time** | Attack timestamp | Temporal analysis |
| **Source IP** | Attacking IP address | IP reputation checks |
| **Country** | Source country | Geographic patterns |
| **Attack Type** | Threat category | Attack methodology |
| **Severity** | Threat level | Prioritization |
| **Status** | Blocked/Allowed | Effectiveness analysis |

#### Security Rules Table
| Column | Description | Use Case |
|--------|-------------|----------|
| **Rule Name** | Security rule triggered | Policy effectiveness |
| **Triggers** | Number of activations | Rule performance |
| **Action** | Block/Alert/Monitor | Response analysis |
| **Effectiveness** | Success rate | Rule optimization |

## 🎨 Customization Options

### Dashboard Themes
1. **Executive Theme** (Default): Professional, presentation-ready
2. **Dark Theme**: Reduced eye strain for SOC environments
3. **High Contrast**: Accessibility-focused design

### Chart Preferences
1. **Time Zone**: Adjust for your local time zone
2. **Date Format**: Choose preferred date/time display
3. **Chart Types**: Line, bar, or area charts
4. **Color Schemes**: Customize visualization colors

### Export Options

#### Report Formats
- **PDF Report**: Executive summary with charts
- **CSV Data**: Raw data for analysis
- **JSON**: API-compatible format
- **Excel**: Spreadsheet with multiple tabs

#### Export Steps
1. Generate your desired report
2. Click **Export** button
3. Choose format from dropdown
4. Configure export options
5. Download file

## 🔍 Analysis Scenarios

### Scenario 1: Incident Response
**Situation**: Active DDoS attack in progress

**Steps:**
1. Set time range to last 1-2 hours
2. Select affected site
3. Generate real-time report
4. Identify attack sources and vectors
5. Export data for incident documentation

### Scenario 2: Weekly Security Review
**Situation**: Regular security assessment

**Steps:**
1. Set time range to last 7 days
2. Analyze all sites or focus on critical ones
3. Review geographic attack distribution
4. Identify trends and patterns
5. Generate executive report

### Scenario 3: Compliance Reporting
**Situation**: Monthly security reporting for audits

**Steps:**
1. Set time range to previous month
2. Include all sites in scope
3. Generate comprehensive analytics
4. Export detailed reports
5. Include in compliance documentation

### Scenario 4: Threat Intelligence
**Situation**: Research emerging threat patterns

**Steps:**
1. Set extended time range (30-90 days)
2. Use country filtering to study regions
3. Analyze attack vector evolution
4. Export data for threat research
5. Share intelligence with security team

## 📱 Mobile Usage

### Responsive Design
The dashboard adapts to mobile devices:
- **Tablet View**: Full functionality with touch controls
- **Mobile View**: Essential features with optimized layout
- **Touch Navigation**: Swipe and tap interactions

### Mobile-Specific Features
- **Quick Actions**: Streamlined report generation
- **Swipe Charts**: Navigate through visualizations
- **Emergency Mode**: Simplified interface for urgent responses

## 🚨 Best Practices

### Performance Optimization

#### 1. **Smart Time Ranges**
- Use shorter ranges (24-48h) for detailed analysis
- Use longer ranges (7-30 days) for trend analysis
- Avoid extremely long ranges that may timeout

#### 2. **Effective Filtering**
- Apply country filters to reduce data volume
- Use threat type filters for focused analysis
- Combine filters for precise investigations

#### 3. **Concurrent Usage**
- Multiple users can access simultaneously
- Each session maintains independent state
- Share URLs for collaborative analysis

### Security Considerations

#### 1. **Access Control**
- Use secure networks for dashboard access
- Don't share API credentials
- Log out when session complete

#### 2. **Data Handling**
- Downloaded reports contain sensitive data
- Store exports securely
- Follow data retention policies

#### 3. **Regular Updates**
- Keep dashboard updated
- Monitor for security patches
- Review API key permissions regularly

## 🔧 Troubleshooting Usage Issues

### Common User Issues

#### Issue: No Sites Appearing
**Symptoms**: Empty site dropdown
**Solutions:**
1. Wait for initial loading (30-60 seconds)
2. Check internet connection
3. Verify API credentials
4. Click refresh button

#### Issue: Slow Report Generation
**Symptoms**: Long processing times
**Solutions:**
1. Reduce time range
2. Apply geographic filters
3. Check network connection
4. Try during off-peak hours

#### Issue: Charts Not Loading
**Symptoms**: Empty or broken visualizations
**Solutions:**
1. Refresh the page
2. Check browser compatibility
3. Disable ad blockers
4. Try different browser

#### Issue: Export Fails
**Symptoms**: Download doesn't start
**Solutions:**
1. Check browser download settings
2. Try smaller data sets
3. Use different export format
4. Ensure sufficient disk space

## 📞 Getting Help

### Self-Help Resources
1. **Dashboard Help**: Click "?" icons for contextual help
2. **Tooltips**: Hover over elements for explanations
3. **Status Messages**: Check bottom of screen for updates

### Support Channels
1. **GitHub Issues**: Report bugs and feature requests
2. **Documentation**: Comprehensive guides and references
3. **Community**: User forums and discussions

## 🎯 Advanced Features

### API Integration
Use the dashboard's API endpoints for:
- Automated reporting
- Integration with SIEM systems
- Custom applications
- Scheduled data exports

### Webhook Support
Configure webhooks for:
- Real-time attack notifications
- Automated incident response
- Integration with ticketing systems
- Custom alert workflows

### Bulk Operations
- Analyze multiple sites simultaneously
- Batch export for multiple time periods
- Automated report scheduling
- Bulk configuration management

---

**Ready to analyze threats? 🛡️**

Start with the basic report generation and explore advanced features as you become more comfortable with the dashboard.