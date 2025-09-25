// Main Application Module
let currentData = null;
let cachedRawData = null; // Raw data from API without filtering
let currentRequestParams = null; // Track current request parameters
let rulesMap = {}; // Store rules map for attack code correlation
let allVisits = []; // Store all visits for filtering
let uniqueRules = []; // Store unique security rules for filtering
let availableSites = []; // Store available sites from API
let filteredSites = []; // Store filtered sites for search
let sitesLoadingInterval = null; // Interval for checking sites loading status
let maxDisplaySites = 100; // Limit displayed sites for performance

// Country names mapping (simplified version)
const countryNames = {
    'CL': 'Chile',
    'US': 'United States',
    'BR': 'Brazil',
    'AR': 'Argentina',
    'CN': 'China',
    'RU': 'Russia'
    // Add more as needed
};

// UI State Management
let isFormVisible = true;
let isDashboardMode = false;

function showForm() {
    isFormVisible = true;
    const wasDashboardMode = isDashboardMode;
    document.getElementById('formOverlay').classList.remove('hidden');
    document.getElementById('gearButton').classList.remove('show');
    
    // Show/hide headers
    const dashboardHeader = document.getElementById('dashboardHeader');
    const mainHeader = document.querySelector('.executive-header:not(#dashboardHeader)');
    
    if (dashboardHeader) dashboardHeader.style.display = 'none';
    if (mainHeader) mainHeader.style.display = 'block';
    
    document.getElementById('dashboardContainer').classList.remove('show');
    document.getElementById('formCloseBtn').style.display = wasDashboardMode ? 'block' : 'none';
}

function hideForm() {
    isFormVisible = false;
    document.getElementById('formOverlay').classList.add('hidden');
    
    if (isDashboardMode) {
        document.getElementById('gearButton').classList.add('show');
        
        // Show/hide headers
        const dashboardHeader = document.getElementById('dashboardHeader');
        const mainHeader = document.querySelector('.executive-header:not(#dashboardHeader)');
        
        if (dashboardHeader) dashboardHeader.style.display = 'block';
        if (mainHeader) mainHeader.style.display = 'none';
        
        document.getElementById('dashboardContainer').classList.add('show');
    }
}

function showDashboard() {
    isDashboardMode = true;
    hideForm();
    setTimeout(() => {
        document.getElementById('dashboardContainer').classList.add('show');
    }, 100);
}

function hideDashboard() {
    isDashboardMode = false;
    document.getElementById('dashboardContainer').classList.remove('show');
    document.getElementById('gearButton').classList.remove('show');
    
    // Show/hide headers
    const dashboardHeader = document.getElementById('dashboardHeader');
    const mainHeader = document.querySelector('.executive-header:not(#dashboardHeader)');
    
    if (dashboardHeader) dashboardHeader.style.display = 'none';
    if (mainHeader) mainHeader.style.display = 'block';
}

// Check sites loading status and update UI
async function checkSitesStatus() {
    try {
        const response = await fetch('/api/sites');
        const data = await response.json();
        
        updateSitesUI(data);
        
        // Stop checking if sites are ready or in error state
        if (data.status === 'ready' || data.status === 'error') {
            if (sitesLoadingInterval) {
                clearInterval(sitesLoadingInterval);
                sitesLoadingInterval = null;
            }
        }
        
        return data;
        
    } catch (error) {
        console.error('Error checking sites status:', error);
        updateSitesUI({
            status: 'error',
            error_message: 'Network error while checking sites status',
            sites: []
        });
        
        if (sitesLoadingInterval) {
            clearInterval(sitesLoadingInterval);
            sitesLoadingInterval = null;
        }
        
        return null;
    }
}

// Update sites UI based on status
function updateSitesUI(data) {
    const siteSelect = document.getElementById('siteId');
    const sitesStatus = document.getElementById('sitesStatus');
    const sitesStatusText = document.getElementById('sitesStatusText');
    const refreshButton = document.getElementById('refreshSites');
    
    // Clear previous classes
    sitesStatus.className = 'form-text mt-2';
    
    switch (data.status) {
        case 'loading':
            sitesStatus.classList.add('loading');
            sitesStatusText.innerHTML = `🔄 Loading sites from Imperva API... (${data.sites?.length || 0} loaded)`;
            refreshButton.style.display = 'none';
            siteSelect.innerHTML = '<option value="" class="loading-option">🔄 Loading sites from API...</option>';
            siteSelect.disabled = true;
            break;
            
        case 'ready':
            sitesStatus.classList.add('ready');
            availableSites = data.sites || [];
            filteredSites = [...availableSites]; // Initialize filtered sites
            
            sitesStatusText.innerHTML = `✅ ${availableSites.length} sites loaded successfully`;
            if (data.last_updated) {
                const lastUpdated = new Date(data.last_updated);
                sitesStatusText.innerHTML += ` (${lastUpdated.toLocaleTimeString()})`;
            }
            
            refreshButton.style.display = 'inline-block';
            siteSelect.disabled = false;
            populateSiteDropdown(filteredSites.slice(0, maxDisplaySites));
            break;
            
        case 'error':
            sitesStatus.classList.add('error');
            sitesStatusText.innerHTML = `❌ Error: ${data.error_message || 'Failed to load sites'}`;
            refreshButton.style.display = 'inline-block';
            siteSelect.innerHTML = '<option value="" class="error-option">❌ Failed to load sites</option>';
            siteSelect.disabled = false;
            break;
            
        default:
            sitesStatusText.innerHTML = 'Unknown status';
            break;
    }
    
    console.log(`Sites status updated: ${data.status}, ${data.sites?.length || 0} sites available`);
}

// Populate site dropdown with search and limiting
function populateSiteDropdown(sites) {
    const siteSelect = document.getElementById('siteId');
    const currentValue = siteSelect.value; // Preserve selection
    
    // Clear existing options
    siteSelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = sites.length === 0 ? 'No sites available' : 'Select a site...';
    siteSelect.appendChild(defaultOption);
    
    if (sites.length === 0) {
        const noResultsOption = document.createElement('option');
        noResultsOption.value = '';
        noResultsOption.textContent = 'No matching sites found';
        noResultsOption.className = 'no-results';
        noResultsOption.disabled = true;
        siteSelect.appendChild(noResultsOption);
        return;
    }
    
    // Sort sites by domain name for better UX
    const sortedSites = sites.sort((a, b) => a.domain.localeCompare(b.domain));
    
    // Limit displayed sites for performance
    const displayedSites = sortedSites.slice(0, maxDisplaySites);
    
    // Add site options
    displayedSites.forEach(site => {
        const option = document.createElement('option');
        option.value = site.site_id;
        option.textContent = `${site.domain} (ID: ${site.site_id})`;
        option.setAttribute('data-domain', site.domain);
        option.setAttribute('data-account-id', site.account_id);
        siteSelect.appendChild(option);
    });
    
    // Show info if sites were limited
    if (sortedSites.length > maxDisplaySites) {
        const moreOption = document.createElement('option');
        moreOption.value = '';
        moreOption.textContent = `... and ${sortedSites.length - maxDisplaySites} more sites (use search to filter)`;
        moreOption.className = 'no-results';
        moreOption.disabled = true;
        siteSelect.appendChild(moreOption);
    }
    
    // Restore previous selection if it still exists
    if (currentValue && [...siteSelect.options].some(opt => opt.value === currentValue)) {
        siteSelect.value = currentValue;
    }
    
    console.log(`Populated dropdown with ${displayedSites.length} of ${sortedSites.length} sites`);
}

// Filter sites based on search input
function filterSites(searchTerm) {
    if (!searchTerm.trim()) {
        filteredSites = [...availableSites];
    } else {
        const term = searchTerm.toLowerCase();
        filteredSites = availableSites.filter(site => 
            site.domain.toLowerCase().includes(term) ||
            site.site_id.toString().includes(term)
        );
    }
    
    populateSiteDropdown(filteredSites);
    
    console.log(`Filtered ${availableSites.length} sites to ${filteredSites.length} using term: "${searchTerm}"`);
}

// Refresh sites cache
async function refreshSitesCache() {
    const refreshButton = document.getElementById('refreshSites');
    const originalHTML = refreshButton.innerHTML;
    
    try {
        // Show refreshing state
        refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refreshing...';
        refreshButton.classList.add('refreshing');
        refreshButton.disabled = true;
        
        // Trigger refresh
        const response = await fetch('/api/sites?refresh=true');
        const data = await response.json();
        
        updateSitesUI(data);
        
        // Start checking status if still loading
        if (data.status === 'loading') {
            startSitesStatusChecking();
        }
        
    } catch (error) {
        console.error('Error refreshing sites cache:', error);
        updateSitesUI({
            status: 'error',
            error_message: 'Failed to refresh sites cache',
            sites: []
        });
    } finally {
        // Restore button state
        setTimeout(() => {
            refreshButton.innerHTML = originalHTML;
            refreshButton.classList.remove('refreshing');
            refreshButton.disabled = false;
        }, 1000);
    }
}

// Start periodic checking of sites loading status
function startSitesStatusChecking() {
    // Clear any existing interval
    if (sitesLoadingInterval) {
        clearInterval(sitesLoadingInterval);
    }
    
    // Check status immediately
    checkSitesStatus();
    
    // Then check every 2 seconds
    sitesLoadingInterval = setInterval(checkSitesStatus, 2000);
    
    console.log('Started sites status checking');
}

// Initialize sites loading
function initializeSites() {
    console.log('Initializing sites loading...');
    startSitesStatusChecking();
}

// Initialize and update Highcharts heatmap
function updateMap(countryStats) {
    console.log('UpdateMap called with stats for', Object.keys(countryStats).length, 'countries');
    
    // Only exclude countries that definitely don't exist in Highcharts world map
    const excludedCountries = ['PS', 'XK']; // Palestinian Territory, Kosovo
    
    // Prepare data for Highcharts Maps
    const heatmapData = [];
    let skippedCountries = 0;
    
    Object.entries(countryStats).forEach(([code, stats]) => {
        if (stats.ipCount > 0) {
            // Skip countries that don't exist in Highcharts world map
            if (excludedCountries.includes(code)) {
                console.log(`Skipping ${stats.name} (${code}) - not supported by Highcharts world map`);
                skippedCountries++;
                return;
            }
            
            // Use lowercase ISO-A2 code (standard for Highcharts)
            const highchartsCode = code.toLowerCase();
            
            // Try multiple formats to ensure compatibility
            const dataPoint = [
                highchartsCode,  // ['cl', 389]
                stats.ipCount
            ];
            
            heatmapData.push(dataPoint);
            console.log(`Adding ${stats.name} (${code} -> ${highchartsCode}): ${stats.ipCount} IPs - Format: [code, value]`);
        }
    });
    
    console.log(`Heatmap data prepared: ${heatmapData.length} countries (${skippedCountries} skipped)`);
    console.log('Sample data:', heatmapData.slice(0, 5)); // Show first 5 entries
    
    // Destroy existing chart
    if (heatmapChart) {
        heatmapChart.destroy();
    }
    
    // Create new Highcharts map
    heatmapChart = Highcharts.mapChart('heatMapChart', {
        chart: {
            map: 'custom/world',
            backgroundColor: '#ffffff',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            shadow: {
                color: 'rgba(0, 0, 0, 0.1)',
                offsetX: 0,
                offsetY: 4,
                opacity: 0.15,
                width: 8
            }
        },
        
        accessibility: {
            enabled: false
        },
        
        title: {
            text: null
        },
        
        credits: {
            enabled: false
        },
        
        legend: {
            align: 'left',
            verticalAlign: 'bottom',
            floating: true,
            layout: 'vertical',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderColor: '#cbd5e1',
            borderWidth: 1,
            borderRadius: 12,
            padding: 16,
            shadow: {
                color: 'rgba(0, 0, 0, 0.15)',
                offsetX: 0,
                offsetY: 4,
                opacity: 0.3,
                width: 8
            },
            itemStyle: {
                color: '#334155',
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500'
            }
        },
        
        colorAxis: {
            dataClasses: [
                {
                    from: 0,
                    to: 0,
                    color: '#f1f5f9',
                    name: '0 IPs'
                },
                {
                    from: 1,
                    to: 4,
                    color: '#3b82f6',
                    name: '1-4 IPs'
                },
                {
                    from: 5,
                    to: 19,
                    color: '#2563eb',
                    name: '5-19 IPs'
                },
                {
                    from: 20,
                    to: 49,
                    color: '#1d4ed8',
                    name: '20-49 IPs'
                },
                {
                    from: 50,
                    color: '#1e40af',
                    name: '50+ IPs'
                }
            ]
        },
        
        series: [{
            data: heatmapData,
            joinBy: ['hc-key', 0], // Join map hc-key with array index 0
            name: 'DDoS Attacks',
            borderColor: '#cbd5e1',
            borderWidth: 0.5,
            nullColor: '#f8fafc',
            
            tooltip: {
                pointFormatter: function() {
                    const countryName = this.name || 'Unknown Country';
                    const ipCount = this.value || 0;
                    
                    return `<b>${countryName}</b><br>` +
                           `Unique IPs: ${ipCount}<br>` +
                           `DDoS Attacks from this country`;
                }
            },
            
            states: {
                hover: {
                    borderColor: '#2563eb',
                    borderWidth: 2,
                    brightness: 0.1
                }
            }
        }]
    });
    
    console.log('Highcharts map created successfully');
}

// Update country statistics panel
function updateCountryStats(countryStats) {
    const container = document.getElementById('countryStats');
    container.innerHTML = '';

    // Sort countries by IP count - showing all countries
    const sortedCountries = Object.entries(countryStats)
        .sort(([,a], [,b]) => b.ipCount - a.ipCount);

    // Update country count display
    document.getElementById('countryCount').textContent = `(${sortedCountries.length} countries)`;

    sortedCountries.forEach(([code, stats]) => {
        const severity = stats.ipCount >= 50 ? 'high' :
                       stats.ipCount >= 20 ? 'medium' :
                       stats.ipCount >= 5 ? 'low' : 'minimal';

        const item = document.createElement('div');
        item.className = `country-item ${severity}`;
        item.innerHTML = `
            <div>
                <strong>${stats.name}</strong> (${code})
                <br>
                <small>${stats.ipCount} IPs • ${stats.visits} visits • ${stats.threats} threats</small>
            </div>
            <div class="text-end">
                <span class="badge bg-danger">${stats.ipCount}</span>
            </div>
        `;
        container.appendChild(item);
    });
}

// Event Listeners for UI Controls
document.getElementById('gearButton').addEventListener('click', function() {
    showForm();
});

document.getElementById('formCloseBtn').addEventListener('click', function() {
    if (isDashboardMode) {
        hideForm();
    }
});

// Close form when clicking outside (only in dashboard mode)
document.getElementById('formOverlay').addEventListener('click', function(e) {
    if (e.target === this && isDashboardMode) {
        hideForm();
    }
});

// Close form with ESC key (only in dashboard mode)
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isFormVisible && isDashboardMode) {
        hideForm();
    }
});

// Initialize date pickers
flatpickr("#startDate", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    time_24hr: true
});

flatpickr("#endDate", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    time_24hr: true
});

// Main form submission handler
document.getElementById('reportForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const siteId = document.getElementById('siteId').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!siteId || !startDate || !endDate) {
        alert('Please fill all required fields');
        return;
    }

    // Store request data for timeline processing
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();
    window.currentRequestData = {
        site_id: siteId,
        start_date: startDate,
        end_date: endDate,
        start_timestamp: startTimestamp,
        end_timestamp: endTimestamp
    };

    // Hide previous results and errors
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('errorSection').style.display = 'none';
    
    // Show loading
    document.querySelector('.loading').style.display = 'block';
    document.getElementById('loadingStatus').textContent = 'Checking server connection...';

    try {
        // First, check server health
        try {
            const healthResponse = await fetch('/health');
            if (!healthResponse.ok) {
                throw new Error('Server health check failed');
            }
            console.log('DEBUG: Server health check passed');
        } catch (healthError) {
            console.log('DEBUG: Health check failed, proceeding anyway:', healthError);
        }
        
        document.getElementById('loadingStatus').textContent = 'Starting request...';
        
        // Get selected country filter
        const countryFilterElement = document.getElementById('countryFilter');
        const countryFilter = countryFilterElement && countryFilterElement.value ? 
            countryFilterElement.value : 'all';
        
        const requestData = {
            site_id: siteId,
            start_date: startDate,
            end_date: endDate,
            country_filter: countryFilter
        };
        
        console.log('DEBUG: Sending request data:', requestData);
        
        const response = await fetch('/api/ddos-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        console.log('DEBUG: Response status:', response.status);
        console.log('DEBUG: Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        document.querySelector('.loading').style.display = 'none';

        if (data.error) {
            showError(
                data.error, 
                data.message, 
                data.suggestion, 
                data.retry_recommended, 
                data.partial_data
            );
        } else {
            // Cache the raw data if this was a fresh API call (no local filtering)
            if (!data.filtered_locally) {
                console.log('DEBUG: Caching raw data from API');
                cachedRawData = { ...data }; // Deep copy
                currentRequestParams = {
                    site_id: siteId,
                    start_date: startDate,
                    end_date: endDate
                };
                console.log(`DEBUG: Cached ${cachedRawData.total_visits} visits`);
            }
            
            showResults(data);
        }

    } catch (error) {
        document.querySelector('.loading').style.display = 'none';
        showError(
            'Network Error', 
            error.message,
            'Check your internet connection or try again in a few moments. The server may be temporarily unavailable.',
            true
        );
    }
});

function showError(error, message, suggestion = null, retryRecommended = false, partialData = null) {
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');
    
    // Create enhanced error display
    let errorHTML = `
        <div class="alert alert-danger">
            <h5><i class="fas fa-exclamation-triangle me-2"></i>${error}</h5>
            <p><strong>Details:</strong> ${message}</p>
    `;
    
    if (suggestion) {
        errorHTML += `<p><strong>Suggestion:</strong> ${suggestion}</p>`;
    }
    
    if (partialData && partialData.visits && partialData.visits.length > 0) {
        errorHTML += `
            <div class="alert alert-warning mt-3">
                <h6><i class="fas fa-info-circle me-2"></i>Partial Data Available</h6>
                <p>${partialData.note}</p>
                <button id="usePartialDataBtn" class="btn btn-warning btn-sm">
                    <i class="fas fa-database me-2"></i>Use Partial Data (${partialData.total_visits} visits)
                </button>
            </div>
        `;
    }
    
    if (retryRecommended) {
        errorHTML += `
            <div class="mt-3">
                <button id="retryBtn" class="btn btn-primary me-2">
                    <i class="fas fa-redo me-2"></i>Retry Request
                </button>
                <button id="changeSettingsBtn" class="btn btn-secondary">
                    <i class="fas fa-cog me-2"></i>Change Settings
                </button>
            </div>
        `;
    }
    
    errorHTML += `</div>`;
    errorMessage.innerHTML = errorHTML;
    errorSection.style.display = 'block';
    
    // Add event listeners for the buttons
    if (retryRecommended) {
        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', function() {
                generateReport();
            });
        }
        
        const changeSettingsBtn = document.getElementById('changeSettingsBtn');
        if (changeSettingsBtn) {
            changeSettingsBtn.addEventListener('click', function() {
                showForm();
            });
        }
    }
    
    if (partialData) {
        const usePartialBtn = document.getElementById('usePartialDataBtn');
        if (usePartialBtn) {
            usePartialBtn.addEventListener('click', function() {
                // Use partial data to show results
                showResults(partialData);
                errorSection.style.display = 'none';
            });
        }
    }
    
    // Show dashboard mode even on error
    showDashboard();
}

function showResults(data) {
    currentData = data;
    
    // Store rules map for attack code correlation
    rulesMap = data.rules_map || {};
    console.log('Rules map stored:', Object.keys(rulesMap).length, 'rules');
    
    // Populate country filter on first load
    populateCountryFilter(data.visits);
    
    // Update statistics
    document.getElementById('totalVisits').textContent = data.total_visits;
    document.getElementById('totalPages').textContent = data.total_pages;
    
    let totalThreats = 0;
    let uniqueIPs = new Set();
    
    data.visits.forEach(visit => {
        visit.clientIPs.forEach(ip => uniqueIPs.add(ip));
        if (visit.securitySummary && visit.securitySummary['api.threats.ddos']) {
            totalThreats += visit.securitySummary['api.threats.ddos'];
        }
    });
    
    document.getElementById('totalThreats').textContent = totalThreats;
    document.getElementById('uniqueIPs').textContent = uniqueIPs.size;

    // Process and display geographic data
    const countryStats = processCountryStats(data.visits);
    updateMap(countryStats);
    updateCountryStats(countryStats);
    
    // Process and display timeline data
    if (window.currentRequestData) {
        const timelineData = processTimelineData(data.visits, window.currentRequestData.start_timestamp, window.currentRequestData.end_timestamp);
        updateTimelineChart(timelineData, window.currentRequestData.start_timestamp, window.currentRequestData.end_timestamp);
    }
    
    // Process and display client analytics
    const clientStats = processClientStats(data.visits);
    updateClientCharts(clientStats);
    
    // Process and display endpoints statistics
    const endpointsStats = processEndpointsStats(data.visits);
    updateTopEndpointsChart(endpointsStats);
    
    // Process and display IPs statistics
    const ipsStats = processIPsStats(data.visits);
    updateTopIPsChart(ipsStats);
    
    // Process and display request results distribution
    updateRequestResultsChart(data.visits);
    
    // Process and display new statistics charts
    if (data.stats) {
        console.log('Processing stats data:', data.stats);
        
        // Process incap rules
        if (data.stats.incap_rules && Array.isArray(data.stats.incap_rules)) {
            const incapRulesStats = processIncapRulesStats(data.stats.incap_rules);
            updateIncapRulesChart(incapRulesStats);
        } else {
            console.log('No incap_rules data available');
            updateIncapRulesChart([]);
        }
        
        // Process threats
        if (data.stats.threats && Array.isArray(data.stats.threats)) {
            const threatsStats = processThreatsStats(data.stats.threats);
            updateThreatsChart(threatsStats);
        } else {
            console.log('No threats data available');
            updateThreatsChart([]);
        }
        
        // Process incap rules timeseries
        if (data.stats.incap_rules_timeseries && Array.isArray(data.stats.incap_rules_timeseries)) {
            const rulesTimelineStats = processIncapRulesTimeseriesStats(data.stats.incap_rules_timeseries);
            updateRulesTimelineChart(rulesTimelineStats);
            
            // Update timeline info
            const timelineInfo = document.getElementById('ruleTimelineInfo');
            if (timelineInfo && rulesTimelineStats.rules && rulesTimelineStats.rules.length > 0) {
                const topRuleName = rulesTimelineStats.rules[0].name;
                const ruleCount = rulesTimelineStats.rules.length;
                timelineInfo.textContent = `(${ruleCount} rules, top: ${topRuleName} - ${rulesTimelineStats.totalIncidents.toLocaleString()} total incidents)`;
            } else if (timelineInfo) {
                timelineInfo.textContent = '';
            }
        } else {
            console.log('No incap_rules_timeseries data available');
            updateRulesTimelineChart({ rules: [], totalIncidents: 0 });
        }
    } else {
        console.log('No stats data in response');
        // Update charts with empty data
        updateIncapRulesChart([]);
        updateThreatsChart([]);
        updateRulesTimelineChart({ rules: [], totalIncidents: 0 });
    }
    

    // Store all visits and rules for filtering
    allVisits = data.visits;
    uniqueRules = extractUniqueRules(data.visits, rulesMap);
    
    // Display visits
    displayVisits(data.visits);

    document.getElementById('resultsSection').style.display = 'block';
    
    // Setup rule filtering after displaying visits
    setupRuleFiltering();
    
    // Switch to dashboard mode
    showDashboard();
}

function createVisitCard(visit) {
    const card = document.createElement('div');
    card.className = 'visit-card';
    
    const startTime = new Date(visit.startTime).toLocaleString();
    
    // Process all security threats for this visit
    let threatsDisplay = '';
    let activatedRulesDisplay = '';
    
    if (visit.securitySummary && Object.keys(visit.securitySummary).length > 0) {
        const threatBadges = Object.entries(visit.securitySummary).map(([threatType, count]) => {
            // Clean threat name for display
            const cleanName = threatType.replace('api.threats.', '').replace('api.', '').toUpperCase();
            
            // Determine badge color based on threat type
            let badgeClass = 'threat-badge';
            if (threatType.includes('ddos')) badgeClass += ' bg-danger';
            else if (threatType.includes('bot')) badgeClass += ' bg-warning';
            else if (threatType.includes('injection') || threatType.includes('sql') || threatType.includes('xss')) badgeClass += ' bg-info';
            else badgeClass += ' bg-secondary';
            
            return `<span class="${badgeClass}">${cleanName}: ${count}</span>`;
        }).join(' ');
        
        threatsDisplay = `<div class="mb-2">${threatBadges}</div>`;
    } else {
        threatsDisplay = `<div class="mb-2"><span class="threat-badge bg-success">NO THREATS</span></div>`;
    }
    
    // Check for activated security rules in actions
    if (visit.actions && Array.isArray(visit.actions)) {
        const activatedRules = new Set();
        const securityActions = new Set();
        const requestResults = new Set();
        
        visit.actions.forEach(action => {
            // Collect request results
            if (action.requestResult) {
                const cleanRequestResult = action.requestResult.replace('api.request_result.', '').replace('req_', '').toUpperCase();
                requestResults.add(cleanRequestResult);
            }
            
            if (action.threats && Array.isArray(action.threats)) {
                action.threats.forEach(threat => {
                    // Collect security rule actions
                    if (threat.securityRuleAction) {
                        const cleanSecurityAction = threat.securityRuleAction.replace('api.rule_action_type.', '').replace('rule_action_', '').toUpperCase();
                        securityActions.add(cleanSecurityAction);
                    }
                    
                    if (threat.securityRule === 'api.threats.customRule' && threat.attackCodes) {
                        threat.attackCodes.forEach(code => {
                            const cleanCode = String(code).split('.')[0];
                            if (cleanCode && cleanCode !== '0') {
                                // Try to find the rule name in rulesMap
                                if (rulesMap && rulesMap[cleanCode]) {
                                    const ruleName = rulesMap[cleanCode].name || `Unknown Rule (ID: ${cleanCode})`;
                                    const ruleAction = rulesMap[cleanCode].action || 'Unknown Action';
                                    activatedRules.add(`${ruleName} (${ruleAction})`);
                                } else {
                                    activatedRules.add(`Rule ID: ${cleanCode} (No name found)`);
                                }
                            }
                        });
                    } else if (threat.securityRule && threat.securityRule !== 'api.threats.customRule') {
                        // For non-custom rules, show the rule type
                        const ruleName = threat.securityRule.replace('api.threats.', '').replace('api.', '').toUpperCase();
                        activatedRules.add(`System Rule: ${ruleName}`);
                    }
                });
            }
        });
        
        // Display activated rules
        if (activatedRules.size > 0) {
            const ruleBadges = Array.from(activatedRules).map(rule => 
                `<span class="threat-badge bg-warning">${rule}</span>`
            ).join(' ');
            activatedRulesDisplay = `
                <div class="mb-2">
                    <small><strong>Reglas Activadas:</strong></small><br>
                    ${ruleBadges}
                </div>
            `;
        }
        
        // Display security actions
        if (securityActions.size > 0) {
            const actionBadges = Array.from(securityActions).map(action => 
                `<span class="threat-badge bg-info">${action}</span>`
            ).join(' ');
            activatedRulesDisplay += `
                <div class="mb-2">
                    <small><strong>Acciones de Seguridad:</strong></small><br>
                    ${actionBadges}
                </div>
            `;
        }
        
        // Display request results
        if (requestResults.size > 0) {
            const resultBadges = Array.from(requestResults).map(result => 
                `<span class="threat-badge bg-secondary">${result}</span>`
            ).join(' ');
            activatedRulesDisplay += `
                <div class="mb-2">
                    <small><strong>Resultados de Solicitud:</strong></small><br>
                    ${resultBadges}
                </div>
            `;
        }
    }
    
    card.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
                <strong>Visit ID:</strong> ${visit.id}
                <br>
                <strong>Start Time:</strong> ${startTime}
            </div>
        </div>
        ${threatsDisplay}
        ${activatedRulesDisplay}
        
        <div class="row mb-2">
            <div class="col-md-6">
                <strong>Client IPs:</strong> ${visit.clientIPs && Array.isArray(visit.clientIPs) ? visit.clientIPs.join(', ') : 'Unknown'}<br>
                <strong>Country:</strong> ${visit.country && Array.isArray(visit.country) ? visit.country.join(', ') : 'Unknown'} (${visit.countryCode && Array.isArray(visit.countryCode) ? visit.countryCode.join(', ') : 'Unknown'})<br>
                <strong>User Agent:</strong> ${visit.userAgent ? visit.userAgent.substring(0, 100) + '...' : 'Unknown'}
            </div>
            <div class="col-md-6">
                <strong>Hits:</strong> ${visit.hits}<br>
                <strong>Page Views:</strong> ${visit.pageViews}<br>
                <strong>Client:</strong> ${visit.clientApplication}
            </div>
        </div>
        
        <div class="mt-2">
            <strong>Served Via:</strong> ${visit.servedVia.join(', ')}<br>
            <strong>Entry Page:</strong> ${visit.entryPage}
        </div>
    `;
    
    return card;
}

// Function to generate detailed CSV from visits data
function generateDetailedCSV(visits, rulesMap) {
    // Define CSV headers matching the fields you specified
    const headers = [
        'Visit ID',
        'Start Time',
        'Custom Rule',
        'Reglas Activadas',
        'Client IPs',
        'Country',
        'Country Code',
        'User Agent',
        'Hits',
        'Page Views',
        'Client Type',
        'Client Application',
        'Served Via',
        'Entry Page'
    ];
    
    // Function to escape CSV fields
    function escapeCSVField(field) {
        if (field === null || field === undefined) {
            return '';
        }
        
        const stringField = String(field);
        
        // If field contains comma, newline, or quote, wrap in quotes and escape internal quotes
        if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('\r') || stringField.includes('"')) {
            return '"' + stringField.replace(/"/g, '""') + '"';
        }
        
        return stringField;
    }
    
    // Function to format activated rules
    function formatActivatedRules(visit, rulesMap) {
        const rules = [];
        
        if (visit.security && visit.security.threats) {
            visit.security.threats.forEach(threat => {
                if (threat.attackCodes && Array.isArray(threat.attackCodes)) {
                    threat.attackCodes.forEach(code => {
                        const ruleName = rulesMap[code] || `Rule ID ${code}`;
                        const action = threat.action || 'UNKNOWN';
                        rules.push(`${ruleName} (${action})`);
                    });
                }
            });
        }
        
        return rules.length > 0 ? rules.join('; ') : 'No rules activated';
    }
    
    // Function to format date time
    function formatDateTime(timestamp) {
        if (!timestamp) return 'Unknown';
        
        try {
            const date = new Date(parseInt(timestamp));
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true
            });
        } catch (e) {
            return 'Invalid Date';
        }
    }
    
    // Generate CSV rows
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.map(header => escapeCSVField(header)).join(','));
    
    // Add data rows
    visits.forEach(visit => {
        const row = [
            escapeCSVField(visit.visitId || 'N/A'),
            escapeCSVField(formatDateTime(visit.startTime)),
            escapeCSVField(visit.security && visit.security.customRule ? '1' : '0'),
            escapeCSVField(formatActivatedRules(visit, rulesMap)),
            escapeCSVField(visit.clientIPs && Array.isArray(visit.clientIPs) ? visit.clientIPs.join(', ') : 'Unknown'),
            escapeCSVField(visit.country && Array.isArray(visit.country) ? visit.country.join(', ') : 'Unknown'),
            escapeCSVField(visit.countryCode && Array.isArray(visit.countryCode) ? visit.countryCode.join(', ') : 'Unknown'),
            escapeCSVField(visit.userAgent || 'Unknown'),
            escapeCSVField(visit.hits || 0),
            escapeCSVField(visit.pageViews || 0),
            escapeCSVField(visit.clientType || 'Unknown'),
            escapeCSVField(visit.clientApplication || 'Unknown'),
            escapeCSVField(visit.servedVia && Array.isArray(visit.servedVia) ? visit.servedVia.join(', ') : 'Unknown'),
            escapeCSVField(visit.entryPage || 'Unknown')
        ];
        
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

// Export functionality
document.getElementById('exportIPsBtn').addEventListener('click', function() {
    if (currentData) {
        // Extract simplified data: ip, country, client_type, hits
        const simplifiedData = currentData.visits.map(visit => {
            return {
                ip: visit.clientIPs.join(', '),
                country: visit.country.join(', '),
                client_type: visit.clientType || 'Unknown',
                hits: visit.hits
            };
        });
        
        const blob = new Blob([JSON.stringify(simplifiedData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ddos_ips_${new Date().toISOString().slice(0, 19)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});

document.getElementById('exportBtn').addEventListener('click', function() {
    if (currentData) {
        const blob = new Blob([JSON.stringify(currentData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ddos_report_${new Date().toISOString().slice(0, 19)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});

// Export Detailed CSV functionality
document.getElementById('exportCSVBtn').addEventListener('click', function() {
    if (currentData && currentData.visits) {
        // Create CSV content with detailed visit information
        const csvContent = generateDetailedCSV(currentData.visits, currentData.rules_map || {});
        
        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ddos_detailed_report_${new Date().toISOString().slice(0, 19)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});

// Function to populate country filter dropdown
function populateCountryFilter(visits) {
    const countrySelect = document.getElementById('countryFilter');
    if (!countrySelect) return;
    
    // Extract unique countries from visits
    const countries = new Set();
    visits.forEach(visit => {
        if (visit.country && Array.isArray(visit.country)) {
            visit.country.forEach(country => {
                if (country && country.trim() !== '') {
                    countries.add(country);
                }
            });
        }
    });
    
    // Clear existing options (except 'All Countries')
    while (countrySelect.children.length > 1) {
        countrySelect.removeChild(countrySelect.lastChild);
    }
    
    // Add countries to dropdown
    Array.from(countries).sort().forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
}


// Function to find generateReport and make it accessible
function generateReport() {
    // Find and click the generate button to trigger the report generation
    const generateBtn = document.querySelector('button[type="submit"]');
    if (generateBtn) {
        generateBtn.click();
    }
}

// Function to display visits (replaces the inline forEach)
function displayVisits(visits) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';

    visits.forEach(visit => {
        const visitCard = createVisitCard(visit);
        container.appendChild(visitCard);
    });
    
    // Update filter stats
    updateFilterStats(visits.length, allVisits.length);
}

// Function to populate rule filter dropdown
function populateRuleFilter() {
    const ruleSelect = document.getElementById('ruleFilter');
    
    // Clear existing options except "all"
    ruleSelect.innerHTML = '<option value="all">Todas las reglas</option>';
    
    // Add unique rules as options
    uniqueRules.forEach(rule => {
        const option = document.createElement('option');
        option.value = rule.name;
        
        // Format display text based on rule type
        let displayText;
        if (rule.isCustomRule) {
            displayText = `${rule.name} (${rule.ruleAction || 'Custom Rule'}) - ${rule.count} activaciones, ${rule.visits} visitas`;
        } else {
            displayText = `${rule.name} - ${rule.count} activaciones, ${rule.visits} visitas`;
        }
        
        option.textContent = displayText;
        ruleSelect.appendChild(option);
    });
}

// Function to setup rule filtering functionality
function setupRuleFiltering() {
    // Populate the filter dropdown
    populateRuleFilter();
    
    const ruleSelect = document.getElementById('ruleFilter');
    const clearButton = document.getElementById('clearRuleFilter');
    
    // Add event listener for rule filter change
    ruleSelect.addEventListener('change', function() {
        const selectedRule = this.value;
        filterVisitsByRule(selectedRule);
    });
    
    // Add event listener for clear filter button
    clearButton.addEventListener('click', function() {
        ruleSelect.value = 'all';
        filterVisitsByRule('all');
    });
}

// Function to filter visits by selected rule
function filterVisitsByRule(selectedRule) {
    if (selectedRule === 'all') {
        // Reset to show all data
        displayVisits(allVisits);
        document.getElementById('filterStats').style.display = 'none';
        
        // Regenerate all charts and stats with full data
        regenerateAllChartsAndStats(allVisits);
        return;
    }
    
    console.log('Filtering visits by rule:', selectedRule);
    
    const filteredVisits = allVisits.filter(visit => {
        return visitHasRule(visit, selectedRule);
    });
    
    console.log(`Filtered ${filteredVisits.length} visits out of ${allVisits.length} for rule: ${selectedRule}`);
    
    // Update visit display
    displayVisits(filteredVisits);
    document.getElementById('filterStats').style.display = 'block';
    
    // Regenerate all charts and stats with filtered data
    regenerateAllChartsAndStats(filteredVisits, selectedRule);
}

// Function to check if a visit has a specific rule activated
function visitHasRule(visit, targetRule) {
    // Check securitySummary
    if (visit.securitySummary && Object.keys(visit.securitySummary).length > 0) {
        for (const threatType of Object.keys(visit.securitySummary)) {
            const cleanName = threatType.replace('api.threats.', '').replace('api.', '').toUpperCase();
            const displayName = `System Rule: ${cleanName}`;
            if (displayName === targetRule) {
                return true;
            }
        }
    }
    
    // Check actions-based rules
    if (visit.actions && Array.isArray(visit.actions)) {
        for (const action of visit.actions) {
            if (action.threats && Array.isArray(action.threats)) {
                for (const threat of action.threats) {
                    if (threat.securityRule === 'api.threats.customRule' && threat.attackCodes) {
                        for (const code of threat.attackCodes) {
                            const cleanCode = String(code).split('.')[0];
                            if (cleanCode && cleanCode !== '0') {
                                let ruleName;
                                if (rulesMap && rulesMap[cleanCode]) {
                                    ruleName = rulesMap[cleanCode].name || `Unknown Rule (ID: ${cleanCode})`;
                                } else {
                                    ruleName = `Rule ID: ${cleanCode}`;
                                }
                                // Match by individual rule name only (not including action)
                                if (ruleName === targetRule) {
                                    return true;
                                }
                            }
                        }
                    } else if (threat.securityRule && threat.securityRule !== 'api.threats.customRule') {
                        const ruleName = threat.securityRule.replace('api.threats.', '').replace('api.', '').toUpperCase();
                        const displayName = `System Rule: ${ruleName}`;
                        if (displayName === targetRule) {
                            return true;
                        }
                    }
                }
            }
        }
    }
    
    return false;
}

// Function to update filter statistics
function updateFilterStats(filteredCount, totalCount) {
    document.getElementById('filteredCount').textContent = filteredCount;
    document.getElementById('totalCount').textContent = totalCount;
}

// Function to regenerate all charts and statistics with filtered data
function regenerateAllChartsAndStats(visits, selectedRule = null) {
    console.log(`Regenerating all charts and stats with ${visits.length} visits` + (selectedRule ? ` for rule: ${selectedRule}` : ''));
    
    // 1. Update main statistics
    updateMainStatistics(visits);
    
    // 2. Update geographic analysis
    updateGeographicAnalysis(visits);
    
    // 3. Update client analysis
    updateClientAnalysis(visits);
    
    // 4. Update endpoints analysis
    updateEndpointsAnalysis(visits);
    
    // 5. Update IPs analysis
    updateIPsAnalysis(visits);
    
    // 6. Update request results distribution
    updateRequestResultsAnalysis(visits);
    
    // 7. Update stats charts (these don't change with filtering since they're based on API stats)
    // Note: Stats charts show API-level statistics that don't change with visit filtering
    
    // 8. Update country filter dropdown (in case countries changed)
    populateCountryFilter(visits);
    
    // 9. Add visual indicator if filtered
    updateFilterIndicator(selectedRule);
}

// Function to update main statistics
function updateMainStatistics(visits) {
    // Update total visits
    document.getElementById('totalVisits').textContent = visits.length;
    
    // Calculate unique IPs and threats
    let totalThreats = 0;
    let uniqueIPs = new Set();
    
    visits.forEach(visit => {
        visit.clientIPs.forEach(ip => uniqueIPs.add(ip));
        if (visit.securitySummary && visit.securitySummary['api.threats.ddos']) {
            totalThreats += visit.securitySummary['api.threats.ddos'];
        }
    });
    
    document.getElementById('totalThreats').textContent = totalThreats;
    document.getElementById('uniqueIPs').textContent = uniqueIPs.size;
}

// Function to update geographic analysis
function updateGeographicAnalysis(visits) {
    // Process and update country statistics
    const countryStats = processCountryStats(visits);
    updateMap(countryStats);
    updateCountryStats(countryStats);
}

// Function to update client analysis  
function updateClientAnalysis(visits) {
    const clientStats = processClientStats(visits);
    updateClientCharts(clientStats);
}

// Function to update endpoints analysis
function updateEndpointsAnalysis(visits) {
    const endpointsStats = processEndpointsStats(visits);
    updateTopEndpointsChart(endpointsStats);
}

// Function to update IPs analysis
function updateIPsAnalysis(visits) {
    const ipsStats = processIPsStats(visits);
    updateTopIPsChart(ipsStats);
}

// Function to update request results analysis
function updateRequestResultsAnalysis(visits) {
    updateRequestResultsChart(visits);
}

// Function to add visual indicator when filtering is active
function updateFilterIndicator(selectedRule) {
    const dashboardTitle = document.getElementById('dashboardTitle');
    if (!dashboardTitle) return;
    
    if (selectedRule) {
        // Add filter indicator
        if (!dashboardTitle.textContent.includes('🔍')) {
            dashboardTitle.textContent += ` 🔍 Filtered by: ${selectedRule}`;
        }
        dashboardTitle.style.color = '#2563eb'; // Blue color to indicate filtering
    } else {
        // Remove filter indicator
        dashboardTitle.textContent = dashboardTitle.textContent.replace(/ 🔍 Filtered by:.*$/, '');
        dashboardTitle.style.color = ''; // Reset color
    }
}

// Setup event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sites loading
    initializeSites();
    
    // Site search functionality
    const siteSearch = document.getElementById('siteSearch');
    if (siteSearch) {
        siteSearch.addEventListener('input', function(e) {
            const searchTerm = e.target.value;
            filterSites(searchTerm);
        });
        
        // Clear search on escape key
        siteSearch.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                e.target.value = '';
                filterSites('');
            }
        });
    }
    
    // Refresh sites button
    const refreshSitesBtn = document.getElementById('refreshSites');
    if (refreshSitesBtn) {
        refreshSitesBtn.addEventListener('click', refreshSitesCache);
    }
    
    // Apply Filter button event listener
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', function() {
            console.log('Apply Filter button clicked');
            applyCountryFilter();
        });
    }
});

// Function to apply country filter
async function applyCountryFilter() {
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const siteId = document.getElementById('siteId').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const countryFilter = document.getElementById('countryFilter').value || 'all';
    
    console.log('Applying country filter:', countryFilter);
    
    if (!siteId || !startDate || !endDate) {
        alert('Please fill in all fields (Site ID, Start Date, End Date) before applying the filter.');
        return;
    }
    
    // Check if we have cached data and just need to filter
    if (cachedRawData && !needsFreshData(siteId, startDate, endDate)) {
        console.log('Using cached data for country filtering');
        
        // Show loading state
        const originalText = applyFilterBtn.innerHTML;
        applyFilterBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Filtering...';
        applyFilterBtn.disabled = true;
        
        // Filter cached data by country
        let filteredData = cachedRawData;
        if (countryFilter !== 'all') {
            filteredData = {
                ...cachedRawData,
                visits: cachedRawData.visits.filter(visit => {
                    if (visit.country && Array.isArray(visit.country)) {
                        return visit.country.some(country => 
                            country.toLowerCase() === countryFilter.toLowerCase()
                        );
                    }
                    return false;
                })
            };
            console.log(`Filtered ${cachedRawData.visits.length} visits down to ${filteredData.visits.length} for country: ${countryFilter}`);
        }
        
        // Update display with filtered data
        showResults(filteredData);
        
        // Re-apply rule filter if one was selected
        const ruleSelect = document.getElementById('ruleFilter');
        if (ruleSelect && ruleSelect.value !== 'all') {
            console.log('Re-applying rule filter after country filter:', ruleSelect.value);
            setTimeout(() => {
                filterVisitsByRule(ruleSelect.value);
            }, 100); // Small delay to ensure data is loaded
        }
        
        // Restore button state
        applyFilterBtn.innerHTML = originalText;
        applyFilterBtn.disabled = false;
        
    } else {
        console.log('Fetching fresh data with country filter');
        // Need fresh data - trigger form submission
        document.getElementById('reportForm').dispatchEvent(new Event('submit'));
    }
}

// Function to check if fresh data is needed
function needsFreshData(siteId, startDate, endDate) {
    if (!currentRequestParams) return true;
    
    return (
        currentRequestParams.site_id !== siteId ||
        currentRequestParams.start_date !== startDate ||
        currentRequestParams.end_date !== endDate
    );
}