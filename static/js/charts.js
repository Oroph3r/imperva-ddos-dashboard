// Chart Management Module with Executive Corporate Styling
// Global Highcharts configuration for corporate theme
Highcharts.setOptions({
    chart: {
        style: {
            fontFamily: 'Inter, sans-serif'
        }
    },
    tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#cbd5e1',
        borderRadius: 12,
        borderWidth: 1,
        shadow: {
            color: 'rgba(0, 0, 0, 0.15)',
            offsetX: 0,
            offsetY: 4,
            opacity: 0.3,
            width: 8
        },
        style: {
            color: '#0f172a',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '500'
        }
    },
    credits: {
        enabled: false
    }
});

let heatmapChart = null;
let timelineChart = null;
let clientTypeChart = null;
let clientAppChart = null;
let cookiesChart = null;
let javascriptChart = null;
let incapRulesChart = null;
let threatsChart = null;
let rulesTimelineChart = null;
let topIPsChart = null;
let requestResultsChart = null;

// Executive Corporate Pie Chart
function createPieChart(containerId, title, data, colors = null) {
    const chartData = Object.entries(data).map(([name, value]) => ({
        name: name,
        y: value
    }));
    
    const defaultColors = ['#2563eb', '#3b82f6', '#1d4ed8', '#1e40af', '#059669', '#0284c7', '#d97706', '#dc2626'];
    
    return Highcharts.chart(containerId, {
        chart: {
            type: 'pie',
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
        
        title: {
            text: null
        },
        
        credits: {
            enabled: false
        },
        
        accessibility: {
            enabled: false
        },
        
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderColor: '#cbd5e1',
            borderRadius: 12,
            borderWidth: 1,
            shadow: {
                color: 'rgba(0, 0, 0, 0.15)',
                offsetX: 0,
                offsetY: 4,
                opacity: 0.3,
                width: 8
            },
            style: {
                color: '#0f172a',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500'
            },
            pointFormat: '<span style="color:{point.color}">●</span> <b>{point.name}</b>: {point.y} visits ({point.percentage:.1f}%)'
        },
        
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '{point.name}<br><b>{point.percentage:.1f}%</b>',
                    style: {
                        color: '#1e293b',
                        fontSize: '11px',
                        fontWeight: '500',
                        fontFamily: 'Inter, sans-serif',
                        textOutline: 'none'
                    },
                    distance: 25,
                    connectorColor: '#cbd5e1',
                    connectorWidth: 1
                },
                showInLegend: false,
                size: '75%',
                colors: colors || defaultColors,
                innerSize: '30%',
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        },
        
        series: [{
            name: 'Visits',
            data: chartData
        }]
    });
}


// Create empty chart placeholder
function createEmptyChart(containerId, message) {
    Highcharts.chart(containerId, {
        chart: {
            backgroundColor: '#1e293b',
            borderRadius: 10,
            style: {
                fontFamily: 'system-ui, sans-serif'
            }
        },
        title: {
            text: message,
            style: {
                color: '#94a3b8',
                fontSize: '14px'
            }
        },
        credits: {
            enabled: false
        },
        xAxis: {
            visible: false
        },
        yAxis: {
            visible: false
        },
        series: []
    });
}

// Create and update timeline chart with Chile timezone
function updateTimelineChart(timelineData, startTime, endTime) {
    console.log('Updating timeline chart with', timelineData.data.length, 'data points');
    
    // Update timeline range display with Chile timezone
    const startDate = new Date(parseInt(startTime));
    const endDate = new Date(parseInt(endTime));
    const rangeText = `${startDate.toLocaleString('es-CL', {timeZone: 'America/Santiago'})} - ${endDate.toLocaleString('es-CL', {timeZone: 'America/Santiago'})}`;
    document.getElementById('timelineRange').textContent = `(${rangeText})`;
    
    // Calculate total blocked hits for the period
    const totalBlocked = timelineData.intervals.reduce((sum, interval) => sum + interval.blockedHits, 0);
    const maxHits = Math.max(...timelineData.data.map(d => d[1]));
    
    console.log(`Total blocked hits: ${totalBlocked}, Max in interval: ${maxHits}`);
    
    // Destroy existing chart
    if (timelineChart) {
        timelineChart.destroy();
    }
    
    // Create executive timeline chart
    timelineChart = Highcharts.chart('timelineChart', {
        chart: {
            type: 'areaspline',
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
            },
            style: {
                fontFamily: 'Inter, sans-serif'
            }
        },
        
        title: {
            text: null
        },
        
        credits: {
            enabled: false
        },
        
        xAxis: {
            type: 'datetime',
            lineColor: '#cbd5e1',
            tickColor: '#cbd5e1',
            gridLineColor: '#f1f5f9',
            gridLineWidth: 1,
            labels: {
                style: {
                    color: '#334155',
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif'
                },
                // Show Chilean time format
                formatter: function() {
                    return new Date(this.value).toLocaleTimeString('es-CL', {
                        timeZone: 'America/Santiago',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
            },
            tickInterval: 5 * 60 * 1000 // Show tick every 5 minutes
        },
        
        yAxis: {
            title: {
                text: 'Blocked Hits',
                style: {
                    color: '#334155',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600'
                }
            },
            lineColor: '#cbd5e1',
            tickColor: '#cbd5e1',
            gridLineColor: '#f1f5f9',
            gridLineWidth: 1,
            labels: {
                style: {
                    color: '#334155',
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif'
                }
            },
            min: 0
        },
        
        legend: {
            align: 'right',
            verticalAlign: 'top',
            floating: true,
            itemStyle: {
                color: '#334155',
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500'
            }
        },
        
        plotOptions: {
            areaspline: {
                fillOpacity: 0.3,
                marker: {
                    enabled: true,
                    radius: 3,
                    fillColor: '#ffffff',
                    lineWidth: 2,
                    lineColor: '#2563eb',
                    shadow: {
                        color: 'rgba(37, 99, 235, 0.4)',
                        offsetX: 0,
                        offsetY: 1,
                        opacity: 0.5,
                        width: 2
                    }
                },
                lineWidth: 3,
                connectNulls: false,
                shadow: {
                    color: 'rgba(37, 99, 235, 0.3)',
                    offsetX: 0,
                    offsetY: 2,
                    opacity: 0.4,
                    width: 3
                }
            }
        },
        
        series: [{
            name: 'Blocked Hits',
            data: timelineData.data,
            color: '#2563eb',
            fillColor: {
                linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops: [
                    [0, 'rgba(37, 99, 235, 0.6)'],
                    [1, 'rgba(37, 99, 235, 0.1)']
                ]
            },
            tooltip: {
                pointFormatter: function() {
                    // Show time in Chilean timezone
                    const chileTime = new Date(this.x).toLocaleString('es-CL', {
                        timeZone: 'America/Santiago',
                        year: 'numeric',
                        month: '2-digit', 
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                    
                    return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y.toLocaleString()}</b> hits<br/>` +
                           `<small>Hora Chile: ${chileTime}</small>`;
                }
            }
        }],
        
        tooltip: {
            shared: false,
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            borderColor: '#475569',
            style: {
                color: '#f1f5f9',
                fontSize: '12px'
            },
            shadow: true
        }
    });
    
    console.log(`Timeline chart created with ${totalBlocked.toLocaleString()} total blocked hits, showing 5-minute intervals`);
}

// Update client analytics charts
function updateClientCharts(clientStats) {
    console.log('Updating client charts');
    
    // Destroy existing charts
    if (clientTypeChart) clientTypeChart.destroy();
    if (clientAppChart) clientAppChart.destroy();
    if (cookiesChart) cookiesChart.destroy();
    if (javascriptChart) javascriptChart.destroy();
    
    // Client Type Chart
    clientTypeChart = createPieChart('clientTypeChart', 'Client Types', clientStats.clientType, 
        ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']);
    
    // Client Application Chart - Show top 8 applications
    const topApps = Object.entries(clientStats.clientApplication)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
    
    clientAppChart = createPieChart('clientAppChart', 'Client Applications', topApps,
        ['#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1', '#14b8a6', '#f59e0b', '#ef4444']);
    
    // Cookies Support Chart (Boolean)
    const cookiesData = {
        'Supports Cookies': clientStats.supportsCookies[true] || 0,
        'No Cookie Support': clientStats.supportsCookies[false] || 0
    };
    cookiesChart = createPieChart('cookiesChart', 'Cookies Support', cookiesData,
        ['#10b981', '#ef4444']);
    
    // JavaScript Support Chart (Boolean)
    const jsData = {
        'Supports JavaScript': clientStats.supportsJavaScript[true] || 0,
        'No JavaScript Support': clientStats.supportsJavaScript[false] || 0
    };
    javascriptChart = createPieChart('javascriptChart', 'JavaScript Support', jsData,
        ['#3b82f6', '#f59e0b']);
    
    console.log('Client charts updated successfully');
}


// Update top endpoints chart
function updateTopEndpointsChart(endpointsData) {
    console.log('Updating top endpoints chart with', endpointsData.length, 'endpoints');
    
    if (!endpointsData || !Array.isArray(endpointsData) || endpointsData.length === 0) {
        createEmptyChart('topEndpointsChart', 'No Endpoints Attack Data');
        return;
    }
    
    // Prepare data for horizontal bar chart
    const categories = endpointsData.map(endpoint => {
        // Truncate long URLs for display
        let displayUrl = endpoint.url;
        if (displayUrl.length > 50) {
            displayUrl = displayUrl.substring(0, 47) + '...';
        }
        return displayUrl;
    });
    
    const attacksData = endpointsData.map(endpoint => endpoint.attacks);
    const hitsData = endpointsData.map(endpoint => endpoint.totalHits);
    const threatsData = endpointsData.map(endpoint => endpoint.totalThreats);
    
    Highcharts.chart('topEndpointsChart', {
        chart: {
            type: 'bar',
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
            },
            height: 500
        },
        title: {
            text: null
        },
        xAxis: {
            categories: categories,
            title: {
                text: 'Endpoints',
                style: {
                    color: '#334155',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600'
                }
            },
            labels: {
                style: {
                    color: '#334155',
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif'
                },
                useHTML: true,
                formatter: function() {
                    const originalUrl = endpointsData[this.pos].url;
                    return `<span title="${originalUrl}" style="color: #334155; font-family: Inter, sans-serif;">${this.value}</span>`;
                }
            },
            lineColor: '#cbd5e1',
            tickColor: '#cbd5e1',
            gridLineColor: '#f1f5f9',
            gridLineWidth: 1
        },
        yAxis: {
            title: {
                text: 'Número de Ataques',
                style: {
                    color: '#334155',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600'
                }
            },
            labels: {
                style: {
                    color: '#334155',
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif'
                }
            },
            gridLineColor: '#f1f5f9',
            gridLineWidth: 1,
            min: 0
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            floating: true,
            itemStyle: {
                color: '#334155',
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500'
            }
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true,
                    style: {
                        color: '#334155',
                        fontSize: '11px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: '600'
                    }
                },
                borderRadius: 6,
                shadow: {
                    color: 'rgba(37, 99, 235, 0.3)',
                    offsetX: 0,
                    offsetY: 2,
                    opacity: 0.4,
                    width: 3
                }
            }
        },
        series: [{
            name: 'Ataques',
            data: attacksData,
            color: '#2563eb',
            dataLabels: {
                enabled: true,
                inside: false,
                align: 'right',
                formatter: function() {
                    return this.y.toLocaleString();
                }
            }
        }, {
            name: 'Hits Totales',
            data: hitsData,
            color: '#3b82f6',
            visible: false,
            dataLabels: {
                enabled: false
            }
        }, {
            name: 'Amenazas',
            data: threatsData,
            color: '#dc2626',
            visible: false,
            dataLabels: {
                enabled: false
            }
        }],
        credits: { enabled: false },
        tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            borderColor: '#475569',
            style: {
                color: '#f1f5f9',
                fontSize: '12px'
            },
            formatter: function() {
                const endpointIndex = this.point.index;
                const endpoint = endpointsData[endpointIndex];
                
                return `
                    <b>${endpoint.url}</b><br/>
                    <span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y.toLocaleString()}</b><br/>
                    Total Hits: <b>${endpoint.totalHits.toLocaleString()}</b><br/>
                    Total Amenazas: <b>${endpoint.totalThreats.toLocaleString()}</b><br/>
                    IPs Únicas: <b>${endpoint.uniqueIPsCount}</b><br/>
                    Países: <b>${endpoint.countriesCount}</b><br/>
                    Tipos de Amenaza: <b>${endpoint.threatTypesCount}</b><br/>
                    <small>Países: ${endpoint.countriesList.slice(0, 3).join(', ')}${endpoint.countriesList.length > 3 ? '...' : ''}</small>
                `;
            }
        },
        exporting: {
            enabled: true,
            buttons: {
                contextButton: {
                    theme: {
                        fill: '#334155',
                        stroke: '#475569',
                        style: {
                            color: '#f1f5f9'
                        }
                    }
                }
            }
        }
    });
    
    console.log('Top endpoints chart created successfully');
}

// Create Incap Rules Chart
function updateIncapRulesChart(incapRulesData) {
    console.log('Updating incap rules chart with', incapRulesData.length, 'rules');
    
    if (incapRulesChart) {
        incapRulesChart.destroy();
    }
    
    if (!incapRulesData || incapRulesData.length === 0) {
        createEmptyChart('incapRulesChart', 'No Security Rules Data');
        return;
    }
    
    const categories = incapRulesData.map(rule => rule.name);
    const incidents = incapRulesData.map(rule => rule.incidents);
    
    incapRulesChart = Highcharts.chart('incapRulesChart', {
        chart: {
            type: 'column',
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
            },
            height: 400
        },
        title: {
            text: null
        },
        xAxis: {
            categories: categories,
            labels: {
                style: {
                    color: '#334155',
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '500'
                },
                rotation: -45,
                useHTML: true,
                formatter: function() {
                    const rule = incapRulesData[this.pos];
                    const tooltip = `${rule.name} - Action: ${rule.action} - Created: ${rule.createdAt}`;
                    return `<span title="${tooltip}" style="color: #334155; font-family: Inter, sans-serif;">${this.value}</span>`;
                }
            },
            lineColor: '#cbd5e1',
            tickColor: '#cbd5e1'
        },
        yAxis: {
            title: {
                text: 'Incidents',
                style: {
                    color: '#334155',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600'
                }
            },
            labels: {
                style: {
                    color: '#334155',
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif'
                }
            },
            gridLineColor: '#f1f5f9',
            gridLineWidth: 1,
            min: 0
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            column: {
                color: '#dc2626',
                borderRadius: 8,
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    style: {
                        color: '#334155',
                        fontSize: '11px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 'bold'
                    }
                },
                shadow: {
                    color: 'rgba(220, 38, 38, 0.3)',
                    offsetX: 0,
                    offsetY: 2,
                    opacity: 0.4,
                    width: 4
                }
            }
        },
        series: [{
            name: 'Incidents',
            data: incidents
        }],
        credits: { enabled: false },
        tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            borderColor: '#475569',
            style: {
                color: '#f1f5f9',
                fontSize: '12px'
            },
            formatter: function() {
                const rule = incapRulesData[this.point.index];
                return `
                    <b>${rule.name}</b><br/>
                    Incidents: <b>${this.y.toLocaleString()}</b><br/>
                    Action: <b>${rule.action}</b><br/>
                    Created: <b>${rule.createdAt}</b><br/>
                    Updated by: <b>${rule.updatedBy}</b>
                `;
            }
        }
    });
    
    console.log('Incap rules chart created successfully');
}

// Create Threats Donut Chart with Table
function updateThreatsChart(threatsData) {
    console.log('Updating threats donut chart with', threatsData.length, 'threats');
    
    if (threatsChart) {
        threatsChart.destroy();
    }
    
    if (!threatsData || threatsData.length === 0) {
        createEmptyChart('threatsChart', 'No Threats Data');
        // Clear table
        document.getElementById('threatsTableBody').innerHTML = '<tr><td colspan="3" class="text-center text-muted">No threats data available</td></tr>';
        return;
    }
    
    // Take top 5 for donut chart
    const top5Threats = threatsData.slice(0, 5);
    const chartData = top5Threats.map((threat, index) => ({
        name: threat.name,
        y: threat.incidents,
        color: ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6'][index] || '#6b7280'
    }));
    
    // Create donut chart
    threatsChart = Highcharts.chart('threatsChart', {
        chart: {
            type: 'pie',
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
            },
            height: 300
        },
        title: {
            text: null
        },
        credits: { enabled: false },
        accessibility: { enabled: false },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderColor: '#cbd5e1',
            borderRadius: 12,
            borderWidth: 1,
            shadow: {
                color: 'rgba(0, 0, 0, 0.15)',
                offsetX: 0,
                offsetY: 4,
                opacity: 0.3,
                width: 8
            },
            style: {
                color: '#0f172a',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500'
            },
            pointFormat: '<span style="color:{point.color}">●</span> <b>{point.name}</b><br/>Incidents: <b>{point.y}</b> ({point.percentage:.1f}%)'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '{point.percentage:.1f}%',
                    style: {
                        color: '#1e293b',
                        fontSize: '11px',
                        fontWeight: '600',
                        fontFamily: 'Inter, sans-serif',
                        textOutline: 'none'
                    },
                    distance: 15
                },
                showInLegend: false,
                size: '85%',
                innerSize: '50%',  // Creates donut effect
                borderWidth: 2,
                borderColor: '#ffffff',
                states: {
                    hover: {
                        halo: {
                            size: 10
                        }
                    }
                }
            }
        },
        series: [{
            name: 'Threats',
            data: chartData
        }]
    });
    
    // Update threats table
    updateThreatsTable(threatsData);
    
    console.log('Threats donut chart and table created successfully');
}

// Update Threats Table
function updateThreatsTable(threatsData) {
    const tableBody = document.getElementById('threatsTableBody');
    tableBody.innerHTML = '';
    
    // Colors matching the donut chart
    const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6'];
    
    threatsData.forEach((threat, index) => {
        const statusClass = threat.status === 'ok' ? 'ok' : 
                           threat.status === 'warning' ? 'warning' : 'error';
        
        // Get color for this threat (matches donut chart)
        const threatColor = index < 5 ? colors[index] : '#6b7280';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${threatColor}; flex-shrink: 0;"></div>
                    <div style="max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" 
                         title="${threat.name}">
                        ${threat.name}
                    </div>
                </div>
            </td>
            <td class="text-center">
                <strong>${threat.incidents.toLocaleString()}</strong>
            </td>
            <td class="text-center">
                <span class="threat-status-badge ${statusClass}">
                    ${threat.status || 'Unknown'}
                </span>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Create Rules Timeline Chart with Multiple Rules
function updateRulesTimelineChart(timelineData) {
    console.log('Updating rules timeline chart with', timelineData.rules?.length || 0, 'rules');
    
    if (rulesTimelineChart) {
        rulesTimelineChart.destroy();
    }
    
    if (!timelineData.rules || timelineData.rules.length === 0) {
        createEmptyChart('rulesTimelineChart', 'No Rules Timeline Data');
        return;
    }
    
    // Colors for different rules
    const colors = ['#8b5cf6', '#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
    
    // Create series for each rule
    const series = timelineData.rules.map((rule, index) => ({
        name: rule.name,
        data: rule.data,
        color: colors[index % colors.length],
        visible: index < 3, // Show first 3 rules by default
        tooltip: {
            pointFormatter: function() {
                const chileTime = new Date(this.x).toLocaleString('es-CL', {
                    timeZone: 'America/Santiago',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                return `<span style="color:${this.color}">●</span> <b>${this.series.name}</b>: ${this.y} incidents<br/>` +
                       `<small>Hora Chile: ${chileTime}</small><br/>` +
                       `<small>Total incidents: ${rule.totalIncidents}</small>`;
            }
        }
    }));
    
    rulesTimelineChart = Highcharts.chart('rulesTimelineChart', {
        chart: {
            type: 'spline',
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
            },
            height: 400,
            zoomType: 'x'
        },
        title: {
            text: null
        },
        xAxis: {
            type: 'datetime',
            lineColor: '#cbd5e1',
            tickColor: '#cbd5e1',
            gridLineColor: '#f1f5f9',
            gridLineWidth: 1,
            labels: {
                style: {
                    color: '#334155',
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: function() {
                    return new Date(this.value).toLocaleTimeString('es-CL', {
                        timeZone: 'America/Santiago',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
            }
        },
        yAxis: {
            title: {
                text: 'Incidents',
                style: {
                    color: '#334155',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600'
                }
            },
            lineColor: '#cbd5e1',
            tickColor: '#cbd5e1',
            gridLineColor: '#f1f5f9',
            gridLineWidth: 1,
            labels: {
                style: {
                    color: '#334155',
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif'
                }
            },
            min: 0
        },
        legend: {
            enabled: true,
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal',
            itemStyle: {
                color: '#334155',
                fontSize: '11px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500'
            },
            itemHoverStyle: {
                color: '#2563eb'
            },
            itemDistance: 15,
            symbolRadius: 6,
            useHTML: true,
            labelFormatter: function() {
                const rule = timelineData.rules.find(r => r.name === this.name);
                return `${this.name} (${rule ? rule.totalIncidents.toLocaleString() : 0})`;
            }
        },
        plotOptions: {
            spline: {
                marker: {
                    enabled: false,  // Disable markers to avoid white points
                    radius: 0
                },
                lineWidth: 3,
                connectNulls: false,
                shadow: {
                    offsetX: 0,
                    offsetY: 2,
                    opacity: 0.3,
                    width: 3
                },
                states: {
                    hover: {
                        marker: {
                            enabled: true,  // Only show marker on hover
                            radius: 5,
                            fillColor: 'rgba(255, 255, 255, 0.9)',
                            lineWidth: 2
                        },
                        lineWidth: 4
                    }
                }
            }
        },
        series: series,
        tooltip: {
            shared: false,
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            borderColor: '#475569',
            style: {
                color: '#f1f5f9',
                fontSize: '12px'
            },
            headerFormat: '<span style="font-size: 13px; font-weight: bold;">{point.key}</span><br/>'
        },
        credits: { enabled: false }
    });
    
    console.log('Rules timeline chart created successfully with', series.length, 'series');
}

// Update top IPs chart
function updateTopIPsChart(ipsData) {
    console.log('Updating top IPs chart with', ipsData.length, 'IPs');
    
    if (!ipsData || !Array.isArray(ipsData) || ipsData.length === 0) {
        createEmptyChart('topIPsChart', 'No IPs Attack Data');
        return;
    }
    
    // Prepare data for horizontal bar chart
    const categories = ipsData.map(ipData => {
        // Show IP address
        return ipData.ip;
    });
    
    const hitsData = ipsData.map(ipData => ipData.hits);
    const visitsData = ipsData.map(ipData => ipData.visits);
    const threatsData = ipsData.map(ipData => ipData.totalThreats);
    
    Highcharts.chart('topIPsChart', {
        chart: {
            type: 'bar',
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
            },
            height: 500
        },
        title: {
            text: null
        },
        xAxis: {
            categories: categories,
            title: {
                text: 'IP Addresses',
                style: {
                    color: '#334155',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600'
                }
            },
            labels: {
                style: {
                    color: '#334155',
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif'
                },
                useHTML: true,
                formatter: function() {
                    const ipData = ipsData[this.pos];
                    const countries = ipData.countriesList && Array.isArray(ipData.countriesList) ? ipData.countriesList.join(', ') : 'Unknown';
                    const tooltip = `${ipData.ip} - Countries: ${countries}`;
                    return `<span title="${tooltip}" style="color: #334155; font-family: Inter, sans-serif;">${this.value}</span>`;
                }
            },
            lineColor: '#cbd5e1',
            tickColor: '#cbd5e1',
            gridLineColor: '#f1f5f9',
            gridLineWidth: 1
        },
        yAxis: {
            title: {
                text: 'Número de Hits',
                style: {
                    color: '#334155',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600'
                }
            },
            labels: {
                style: {
                    color: '#334155',
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif'
                }
            },
            gridLineColor: '#f1f5f9',
            gridLineWidth: 1,
            min: 0
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            floating: true,
            itemStyle: {
                color: '#334155',
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500'
            }
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true,
                    style: {
                        color: '#334155',
                        fontSize: '11px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: '600'
                    }
                },
                borderRadius: 6,
                shadow: {
                    color: 'rgba(37, 99, 235, 0.3)',
                    offsetX: 0,
                    offsetY: 2,
                    opacity: 0.4,
                    width: 3
                }
            }
        },
        series: [{
            name: 'Hits',
            data: hitsData,
            color: '#dc2626',
            dataLabels: {
                enabled: true,
                inside: false,
                align: 'right',
                formatter: function() {
                    return this.y.toLocaleString();
                }
            }
        }, {
            name: 'Visits',
            data: visitsData,
            color: '#3b82f6',
            visible: false,
            dataLabels: {
                enabled: false
            }
        }, {
            name: 'Amenazas',
            data: threatsData,
            color: '#f59e0b',
            visible: false,
            dataLabels: {
                enabled: false
            }
        }],
        credits: { enabled: false },
        tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            borderColor: '#475569',
            style: {
                color: '#f1f5f9',
                fontSize: '12px'
            },
            formatter: function() {
                const ipIndex = this.point.index;
                const ipData = ipsData[ipIndex];
                
                return `
                    <b>${ipData.ip}</b><br/>
                    <span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y.toLocaleString()}</b><br/>
                    Total Visits: <b>${ipData.visits.toLocaleString()}</b><br/>
                    Total Amenazas: <b>${ipData.totalThreats.toLocaleString()}</b><br/>
                    Endpoints Únicos: <b>${ipData.endpointsCount}</b><br/>
                    Países: <b>${ipData.countriesCount}</b><br/>
                    Tipos de Amenaza: <b>${ipData.threatTypesCount}</b><br/>
                    <small>Países: ${ipData.countriesList && Array.isArray(ipData.countriesList) ? ipData.countriesList.slice(0, 3).join(', ') + (ipData.countriesList.length > 3 ? '...' : '') : 'Unknown'}</small>
                `;
            }
        },
        exporting: {
            enabled: true,
            buttons: {
                contextButton: {
                    theme: {
                        fill: '#334155',
                        stroke: '#475569',
                        style: {
                            color: '#f1f5f9'
                        }
                    }
                }
            }
        }
    });
    
    console.log('Top IPs chart created successfully');
}

// Process Request Results for Donut Chart
function processRequestResults(visits) {
    console.log(`Processing request results for ${visits.length} visits`);
    
    const requestResults = {};
    let totalRequests = 0;
    
    visits.forEach(visit => {
        if (visit.actions && Array.isArray(visit.actions)) {
            visit.actions.forEach(action => {
                if (action.requestResult) {
                    // Clean and categorize request results
                    let cleanResult = action.requestResult.replace('api.request_result.', '').replace('req_', '');
                    
                    // Group similar results
                    if (cleanResult.includes('captcha') || cleanResult.includes('challenge_captcha')) {
                        cleanResult = 'CAPTCHA';
                    } else if (cleanResult.includes('blocked') || cleanResult.includes('block')) {
                        cleanResult = 'BLOCKED';
                    } else if (cleanResult.includes('javascript') || cleanResult.includes('challenge_javascript')) {
                        cleanResult = 'JAVASCRIPT_CHALLENGE';
                    } else if (cleanResult.includes('cookieless')) {
                        cleanResult = 'COOKIELESS_SESSION';
                    } else if (cleanResult.includes('allowed') || cleanResult.includes('pass')) {
                        cleanResult = 'ALLOWED';
                    } else {
                        // Keep other results as they are but clean them
                        cleanResult = cleanResult.toUpperCase().replace(/_/g, ' ');
                    }
                    
                    requestResults[cleanResult] = (requestResults[cleanResult] || 0) + 1;
                    totalRequests++;
                }
            });
        }
    });
    
    console.log('Request results processed:', requestResults);
    console.log('Total requests:', totalRequests);
    
    return {
        results: requestResults,
        totalRequests: totalRequests
    };
}

// Create Request Results Donut Chart
function updateRequestResultsChart(visits) {
    console.log('Updating request results donut chart');
    
    if (requestResultsChart) {
        requestResultsChart.destroy();
    }
    
    const processedData = processRequestResults(visits);
    
    if (processedData.totalRequests === 0) {
        createEmptyChart('requestResultsChart', 'No Request Results Data');
        document.getElementById('requestResultsInfo').textContent = '';
        return;
    }
    
    // Prepare data for donut chart
    const chartData = Object.entries(processedData.results).map(([name, count]) => ({
        name: name,
        y: count,
        percentage: parseFloat(((count / processedData.totalRequests) * 100).toFixed(1))
    }));
    
    // Sort by count (largest first)
    chartData.sort((a, b) => b.y - a.y);
    
    // Colors for different request results - corporate colors
    const colors = {
        'CAPTCHA': '#f59e0b',      // Orange - warning/challenge
        'BLOCKED': '#ef4444',       // Red - blocked/danger
        'JAVASCRIPT_CHALLENGE': '#3b82f6', // Blue - challenge
        'COOKIELESS_SESSION': '#8b5cf6',   // Purple - session issue
        'ALLOWED': '#10b981',       // Green - success
        'DEFAULT': '#6b7280'        // Gray - other
    };
    
    // Assign colors to data points
    chartData.forEach(point => {
        point.color = colors[point.name] || colors['DEFAULT'];
    });
    
    requestResultsChart = Highcharts.chart('requestResultsChart', {
        chart: {
            type: 'pie',
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
            },
            height: 300
        },
        
        title: {
            text: null
        },
        
        credits: {
            enabled: false
        },
        
        accessibility: {
            enabled: false
        },
        
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderColor: '#cbd5e1',
            borderRadius: 12,
            borderWidth: 1,
            shadow: {
                color: 'rgba(0, 0, 0, 0.15)',
                offsetX: 0,
                offsetY: 4,
                opacity: 0.3,
                width: 8
            },
            style: {
                color: '#0f172a',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500'
            },
            pointFormat: '<span style="color:{point.color}">●</span> <b>{point.name}</b><br/>Requests: <b>{point.y}</b> ({point.percentage:.1f}%)'
        },
        
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b><br/>{point.percentage:.1f}%',
                    style: {
                        color: '#1e293b',
                        fontSize: '11px',
                        fontWeight: '600',
                        fontFamily: 'Inter, sans-serif',
                        textOutline: 'none'
                    },
                    distance: 20,
                    connectorColor: '#cbd5e1'
                },
                showInLegend: true,
                size: '75%',
                innerSize: '45%',  // Creates donut effect
                borderWidth: 2,
                borderColor: '#ffffff',
                states: {
                    hover: {
                        halo: {
                            size: 10,
                            attributes: {
                                fill: 'rgba(37, 99, 235, 0.3)',
                                stroke: '#2563eb',
                                'stroke-width': 2
                            }
                        }
                    }
                }
            }
        },
        
        legend: {
            align: 'right',
            verticalAlign: 'middle',
            layout: 'vertical',
            itemStyle: {
                color: '#334155',
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500'
            },
            itemHoverStyle: {
                color: '#2563eb'
            },
            itemMarginTop: 5,
            itemMarginBottom: 5,
            symbolRadius: 6
        },
        
        series: [{
            name: 'Request Results',
            data: chartData
        }]
    });
    
    // Update info text
    const infoElement = document.getElementById('requestResultsInfo');
    if (infoElement) {
        const captchaCount = processedData.results['CAPTCHA'] || 0;
        const blockedCount = processedData.results['BLOCKED'] || 0;
        const captchaPercent = ((captchaCount / processedData.totalRequests) * 100).toFixed(1);
        const blockedPercent = ((blockedCount / processedData.totalRequests) * 100).toFixed(1);
        
        infoElement.textContent = `(${processedData.totalRequests.toLocaleString()} total requests: ${captchaPercent}% CAPTCHA, ${blockedPercent}% BLOCKED)`;
    }
    
    console.log('Request results donut chart created successfully');
}