// Data Processing Module

// Process timeline data from visits with better granularity and Chile timezone
function processTimelineData(visits, startTime, endTime) {
    console.log('Processing timeline data for', visits.length, 'visits');
    
    // Create time intervals (5-minute buckets for better granularity)
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const intervalMinutes = 5; // 5-minute intervals for better granularity
    const timeIntervals = {};
    
    // Initialize time buckets
    let currentTime = new Date(startDate);
    while (currentTime <= endDate) {
        const timeKey = currentTime.getTime();
        timeIntervals[timeKey] = {
            timestamp: timeKey,
            blockedHits: 0,
            totalVisits: 0,
            threatCount: 0,
            visits: []
        };
        currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
    }
    
    // Process each visit
    visits.forEach((visit, index) => {
        if (!visit.startTime) {
            console.warn(`Visit ${index} has no startTime`);
            return;
        }
        
        const visitTime = new Date(visit.startTime);
        // Round down to nearest 5-minute interval
        const roundedMinutes = Math.floor(visitTime.getMinutes() / intervalMinutes) * intervalMinutes;
        const bucketTime = new Date(visitTime.getFullYear(), visitTime.getMonth(), visitTime.getDate(), 
                                  visitTime.getHours(), roundedMinutes, 0, 0);
        const bucketKey = bucketTime.getTime();
        
        // Find the closest existing bucket if exact match doesn't exist
        let targetBucket = timeIntervals[bucketKey];
        if (!targetBucket) {
            // Find closest bucket within range
            const bucketKeys = Object.keys(timeIntervals).map(k => parseInt(k)).sort((a, b) => Math.abs(a - bucketKey) - Math.abs(b - bucketKey));
            if (bucketKeys.length > 0) {
                targetBucket = timeIntervals[bucketKeys[0]];
            }
        }
        
        if (targetBucket) {
            // Count hits if there are security threats (blocked traffic)
            const hasThreats = visit.securitySummary && Object.keys(visit.securitySummary).length > 0;
            
            if (hasThreats) {
                // Add the actual hits from this visit
                const visitHits = visit.hits || 0;
                const totalThreats = Object.values(visit.securitySummary).reduce((sum, count) => sum + count, 0);
                
                targetBucket.blockedHits += visitHits;
                targetBucket.threatCount += totalThreats;
                targetBucket.visits.push({
                    id: visit.id,
                    hits: visitHits,
                    threats: totalThreats,
                    time: visit.startTime
                });
                
                console.log(`Added visit ${visit.id}: ${visitHits} hits, ${totalThreats} threats at ${new Date(visit.startTime).toLocaleString('es-CL', {timeZone: 'America/Santiago'})}`);
            }
            
            targetBucket.totalVisits += 1;
        }
    });
    
    // Convert to array and sort by time
    const timelineData = Object.values(timeIntervals)
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(interval => [interval.timestamp, interval.blockedHits]);
    
    // Log some statistics
    const totalBlockedHits = Object.values(timeIntervals).reduce((sum, interval) => sum + interval.blockedHits, 0);
    const nonZeroIntervals = Object.values(timeIntervals).filter(interval => interval.blockedHits > 0).length;
    
    console.log(`Timeline processed: ${timelineData.length} intervals, ${nonZeroIntervals} with data, ${totalBlockedHits} total blocked hits`);
    
    return {
        data: timelineData,
        intervals: Object.values(timeIntervals).sort((a, b) => a.timestamp - b.timestamp)
    };
}

// Process client statistics from visits
function processClientStats(visits) {
    console.log('Processing client statistics for', visits.length, 'visits');
    
    const clientTypeStats = {};
    const clientAppStats = {};
    const cookiesStats = { true: 0, false: 0 };
    const javascriptStats = { true: 0, false: 0 };
    
    visits.forEach(visit => {
        // Client Type
        const clientType = visit.clientType || 'Unknown';
        clientTypeStats[clientType] = (clientTypeStats[clientType] || 0) + 1;
        
        // Client Application
        const clientApp = visit.clientApplication || 'Unknown';
        clientAppStats[clientApp] = (clientAppStats[clientApp] || 0) + 1;
        
        // Cookies Support
        const supportsCookies = visit.supportsCookies === true;
        cookiesStats[supportsCookies] += 1;
        
        // JavaScript Support
        const supportsJS = visit.supportsJavaScript === true;
        javascriptStats[supportsJS] += 1;
    });
    
    console.log('Client stats processed:', {
        types: Object.keys(clientTypeStats).length,
        apps: Object.keys(clientAppStats).length,
        cookies: cookiesStats,
        javascript: javascriptStats
    });
    
    return {
        clientType: clientTypeStats,
        clientApplication: clientAppStats,
        supportsCookies: cookiesStats,
        supportsJavaScript: javascriptStats
    };
}

// Process country statistics from visit data
function processCountryStats(visits) {
    const countryStats = {};
    const allUniqueIPs = new Set(); // Track all unique IPs globally

    visits.forEach(visit => {
        // Add all IPs from this visit to global set
        if (visit.clientIPs && Array.isArray(visit.clientIPs)) {
            visit.clientIPs.forEach(ip => allUniqueIPs.add(ip));
        }
        
        // Process by country - an IP can appear in multiple countries if the visit has multiple country codes
        if (visit.countryCode && Array.isArray(visit.countryCode)) {
            visit.countryCode.forEach((code, index) => {
                const country = visit.country && visit.country[index] ? visit.country[index] : (countryNames[code] || code);
            
            if (!countryStats[code]) {
                countryStats[code] = {
                    name: country,
                    visits: 0,
                    ips: new Set(),
                    threats: 0
                };
            }
            
            countryStats[code].visits++;
            
            // Add unique IPs for this country
            if (visit.clientIPs && Array.isArray(visit.clientIPs)) {
                visit.clientIPs.forEach(ip => {
                    countryStats[code].ips.add(ip);
                });
            }
            
            // Count DDoS threats
            if (visit.securitySummary && visit.securitySummary['api.threats.ddos']) {
                countryStats[code].threats += visit.securitySummary['api.threats.ddos'];
            }
            });
        }
    });

    // Convert sets to counts
    Object.keys(countryStats).forEach(code => {
        countryStats[code].ipCount = countryStats[code].ips.size;
        delete countryStats[code].ips; // Remove the set to save memory
    });

    // Add debug info
    console.log('Total unique IPs globally:', allUniqueIPs.size);
    console.log('Sum of country IPs:', Object.values(countryStats).reduce((sum, stats) => sum + stats.ipCount, 0));
    console.log('Country breakdown:', countryStats);

    return countryStats;
}

function processThreatsStats(visits) {
    console.log('Processing threats stats for', visits.length, 'visits');
    
    const threatsStats = {};
    const attackPatterns = {};
    let totalThreats = 0;
    
    try {
        visits.forEach((visit, index) => {
            if (!visit) {
                console.warn(`Visit at index ${index} is null/undefined`);
                return;
            }
        // Process security summary
        if (visit.securitySummary) {
            Object.entries(visit.securitySummary).forEach(([threatType, count]) => {
                if (!threatsStats[threatType]) {
                    threatsStats[threatType] = {
                        threatType: threatType,
                        totalOccurrences: 0,
                        affectedVisits: 0,
                        affectedIPs: new Set(),
                        countries: new Set(),
                        attackCodes: new Set()
                    };
                }
                
                threatsStats[threatType].totalOccurrences += count;
                threatsStats[threatType].affectedVisits++;
                totalThreats += count;
                
                // Add IPs and countries
                if (visit.clientIPs && Array.isArray(visit.clientIPs)) {
                    visit.clientIPs.forEach(ip => {
                        if (ip) threatsStats[threatType].affectedIPs.add(ip);
                    });
                }
                if (visit.country && Array.isArray(visit.country)) {
                    visit.country.forEach(country => {
                        if (country) threatsStats[threatType].countries.add(country);
                    });
                }
            });
        }
        
        // Process individual actions for attack codes
        if (visit.actions && Array.isArray(visit.actions)) {
            visit.actions.forEach(action => {
                if (action && action.threats && Array.isArray(action.threats) && action.threats.length > 0) {
                    action.threats.forEach(threat => {
                        if (!threat || !threat.securityRule) return;
                        const threatType = threat.securityRule;
                        
                        if (threatsStats[threatType]) {
                            // Add attack codes
                            if (threat.attackCodes && Array.isArray(threat.attackCodes)) {
                                threat.attackCodes.forEach(code => {
                                    if (code) threatsStats[threatType].attackCodes.add(code);
                                });
                            }
                        }
                        
                        // Categorize attack patterns
                        let category = 'other';
                        if (threatType && typeof threatType === 'string') {
                            if (threatType.includes('ddos')) category = 'ddos';
                            else if (threatType.includes('bot')) category = 'bot';
                            else if (threatType.includes('injection') || threatType.includes('sql') || threatType.includes('xss')) category = 'injection';
                        }
                        
                        if (!attackPatterns[category]) {
                            attackPatterns[category] = {
                                category: category,
                                count: 0,
                                threats: new Set()
                            };
                        }
                        attackPatterns[category].count++;
                        attackPatterns[category].threats.add(threatType);
                    });
                }
            });
        }
        });
    } catch (error) {
        console.error('Error processing threats stats:', error);
        return {
            threats: [],
            attackPatterns: [],
            totalThreats: 0
        };
    }
    
    // Convert sets to arrays and counts
    Object.keys(threatsStats).forEach(threatType => {
        threatsStats[threatType].affectedIPsCount = threatsStats[threatType].affectedIPs.size;
        threatsStats[threatType].countriesList = Array.from(threatsStats[threatType].countries);
        threatsStats[threatType].attackCodesList = Array.from(threatsStats[threatType].attackCodes);
        
        // Clean up sets
        delete threatsStats[threatType].affectedIPs;
        delete threatsStats[threatType].countries;
        delete threatsStats[threatType].attackCodes;
    });
    
    // Process attack patterns
    Object.keys(attackPatterns).forEach(category => {
        attackPatterns[category].percentage = totalThreats > 0 
            ? ((attackPatterns[category].count / totalThreats) * 100).toFixed(1)
            : 0;
        attackPatterns[category].uniqueThreats = attackPatterns[category].threats.size;
        delete attackPatterns[category].threats;
    });
    
    // Sort threats by total occurrences
    const sortedThreats = Object.values(threatsStats)
        .sort((a, b) => b.totalOccurrences - a.totalOccurrences);
    
    // Sort attack patterns by count
    const sortedPatterns = Object.values(attackPatterns)
        .sort((a, b) => b.count - a.count);
    
    return {
        threats: sortedThreats,
        attackPatterns: sortedPatterns,
        totalThreats: totalThreats
    };
}

// Process endpoints statistics from visit data
function processEndpointsStats(visits) {
    console.log('Processing endpoints statistics for', visits.length, 'visits');
    
    const endpointsStats = {};
    
    visits.forEach(visit => {
        // Only process visits that have security threats (attacks)
        const hasThreats = visit.securitySummary && Object.keys(visit.securitySummary).length > 0;
        
        if (hasThreats && visit.entryPage) {
            const endpoint = visit.entryPage;
            
            if (!endpointsStats[endpoint]) {
                endpointsStats[endpoint] = {
                    url: endpoint,
                    attacks: 0,
                    visits: 0,
                    totalHits: 0,
                    totalThreats: 0,
                    uniqueIPs: new Set(),
                    countries: new Set(),
                    threatTypes: new Set()
                };
            }
            
            endpointsStats[endpoint].attacks += 1;
            endpointsStats[endpoint].visits += 1;
            endpointsStats[endpoint].totalHits += visit.hits || 0;
            
            // Count threats
            if (visit.securitySummary) {
                Object.entries(visit.securitySummary).forEach(([threatType, count]) => {
                    endpointsStats[endpoint].totalThreats += count;
                    endpointsStats[endpoint].threatTypes.add(threatType);
                });
            }
            
            // Add unique IPs
            if (visit.clientIPs && Array.isArray(visit.clientIPs)) {
                visit.clientIPs.forEach(ip => {
                    if (ip) endpointsStats[endpoint].uniqueIPs.add(ip);
                });
            }
            
            // Add countries
            if (visit.country && Array.isArray(visit.country)) {
                visit.country.forEach(country => {
                    if (country) endpointsStats[endpoint].countries.add(country);
                });
            }
        }
    });
    
    // Convert sets to counts and clean up
    Object.keys(endpointsStats).forEach(endpoint => {
        endpointsStats[endpoint].uniqueIPsCount = endpointsStats[endpoint].uniqueIPs.size;
        endpointsStats[endpoint].countriesCount = endpointsStats[endpoint].countries.size;
        endpointsStats[endpoint].threatTypesCount = endpointsStats[endpoint].threatTypes.size;
        endpointsStats[endpoint].countriesList = Array.from(endpointsStats[endpoint].countries);
        endpointsStats[endpoint].threatTypesList = Array.from(endpointsStats[endpoint].threatTypes);
        
        // Clean up sets
        delete endpointsStats[endpoint].uniqueIPs;
        delete endpointsStats[endpoint].countries;
        delete endpointsStats[endpoint].threatTypes;
    });
    
    // Sort by attacks count and return top 15
    const sortedEndpoints = Object.values(endpointsStats)
        .sort((a, b) => b.attacks - a.attacks)
        .slice(0, 15);
    
    console.log(`Endpoints processed: ${sortedEndpoints.length} endpoints with attacks`);
    console.log('Top 5 endpoints:', sortedEndpoints.slice(0, 5).map(e => `${e.url}: ${e.attacks} attacks`));
    
    return sortedEndpoints;
}

// Extract unique activated security rules from all visits
function extractUniqueRules(visits, rulesMap) {
    console.log('Extracting unique security rules from', visits.length, 'visits');
    
    const uniqueRules = new Set();
    const ruleStats = {};
    
    visits.forEach(visit => {
        // Process securitySummary threats
        if (visit.securitySummary && Object.keys(visit.securitySummary).length > 0) {
            Object.keys(visit.securitySummary).forEach(threatType => {
                const cleanName = threatType.replace('api.threats.', '').replace('api.', '').toUpperCase();
                const displayName = `System Rule: ${cleanName}`;
                uniqueRules.add(displayName);
                
                if (!ruleStats[displayName]) {
                    ruleStats[displayName] = { count: 0, visits: 0 };
                }
                ruleStats[displayName].count += visit.securitySummary[threatType] || 0;
                ruleStats[displayName].visits++;
            });
        }
        
        // Process actions-based rules
        if (visit.actions && Array.isArray(visit.actions)) {
            visit.actions.forEach(action => {
                if (action.threats && Array.isArray(action.threats)) {
                    action.threats.forEach(threat => {
                        if (threat.securityRule === 'api.threats.customRule' && threat.attackCodes) {
                            threat.attackCodes.forEach(code => {
                                const cleanCode = String(code).split('.')[0];
                                if (cleanCode && cleanCode !== '0') {
                                    let displayName;
                                    let ruleName;
                                    let ruleAction;
                                    
                                    if (rulesMap && rulesMap[cleanCode]) {
                                        ruleName = rulesMap[cleanCode].name || `Unknown Rule (ID: ${cleanCode})`;
                                        ruleAction = rulesMap[cleanCode].action || 'Unknown Action';
                                        // Use ONLY the rule name for custom rules (individual filtering)
                                        displayName = ruleName;
                                    } else {
                                        displayName = `Rule ID: ${cleanCode}`;
                                    }
                                    
                                    uniqueRules.add(displayName);
                                    
                                    if (!ruleStats[displayName]) {
                                        ruleStats[displayName] = { 
                                            count: 0, 
                                            visits: 0, 
                                            ruleAction: ruleAction,
                                            ruleId: cleanCode,
                                            isCustomRule: true
                                        };
                                    }
                                    ruleStats[displayName].count++;
                                    ruleStats[displayName].visits++;
                                }
                            });
                        } else if (threat.securityRule && threat.securityRule !== 'api.threats.customRule') {
                            const ruleName = threat.securityRule.replace('api.threats.', '').replace('api.', '').toUpperCase();
                            const displayName = `System Rule: ${ruleName}`;
                            uniqueRules.add(displayName);
                            
                            if (!ruleStats[displayName]) {
                                ruleStats[displayName] = { count: 0, visits: 0 };
                            }
                            ruleStats[displayName].count++;
                            ruleStats[displayName].visits++;
                        }
                    });
                }
            });
        }
    });
    
    // Convert to array and sort by usage count
    const rulesArray = Array.from(uniqueRules).map(rule => ({
        name: rule,
        count: ruleStats[rule]?.count || 0,
        visits: ruleStats[rule]?.visits || 0,
        ruleAction: ruleStats[rule]?.ruleAction,
        ruleId: ruleStats[rule]?.ruleId,
        isCustomRule: ruleStats[rule]?.isCustomRule || false
    })).sort((a, b) => b.count - a.count);
    
    console.log('Found', rulesArray.length, 'unique security rules');
    return rulesArray;
}

// Process Imperva Statistics Data
function processIncapRulesStats(incapRules) {
    console.log('Processing incap rules statistics for', incapRules.length, 'rules');
    
    // Sort by incidents count and take top 10
    const sortedRules = incapRules
        .filter(rule => rule.incidents > 0)
        .sort((a, b) => b.incidents - a.incidents)
        .slice(0, 10);
    
    console.log(`Top 10 incap rules by incidents:`, sortedRules.map(r => `${r.name}: ${r.incidents}`));
    return sortedRules;
}

function processThreatsStats(threats) {
    console.log('Processing threats statistics for', threats.length, 'threats');
    
    // Sort by incidents count and take top 10
    const sortedThreats = threats
        .filter(threat => threat.incidents > 0)
        .sort((a, b) => b.incidents - a.incidents)
        .slice(0, 10);
    
    console.log(`Top 10 threats by incidents:`, sortedThreats.map(t => `${t.name}: ${t.incidents}`));
    return sortedThreats;
}

function processIncapRulesTimeseriesStats(incapRulesTimeseries) {
    console.log('Processing incap rules timeseries for', incapRulesTimeseries.length, 'rules');
    
    if (!incapRulesTimeseries || incapRulesTimeseries.length === 0) {
        console.log('No rules found for timeseries');
        return {
            rules: [],
            totalIncidents: 0
        };
    }
    
    // Process all rules with incidents > 0, limit to top 5
    const rulesWithIncidents = incapRulesTimeseries
        .map(rule => {
            const totalIncidents = rule.incidents.reduce((sum, point) => sum + point[1], 0);
            return {
                id: rule.id || rule.name,
                name: rule.name || 'Unknown Rule',
                action: rule.action || 'Unknown Action',
                data: rule.incidents || [],
                totalIncidents: totalIncidents,
                createdAt: rule.createdAt || 'Unknown',
                updatedBy: rule.updatedBy || 'Unknown'
            };
        })
        .filter(rule => rule.totalIncidents > 0)
        .sort((a, b) => b.totalIncidents - a.totalIncidents)
        .slice(0, 5); // Top 5 rules for better visibility
    
    if (rulesWithIncidents.length === 0) {
        console.log('No rules with incidents found for timeseries');
        return {
            rules: [],
            totalIncidents: 0
        };
    }
    
    const totalIncidents = rulesWithIncidents.reduce((sum, rule) => sum + rule.totalIncidents, 0);
    
    console.log(`Found ${rulesWithIncidents.length} rules for timeseries with ${totalIncidents} total incidents`);
    console.log('Top rules:', rulesWithIncidents.map(r => `${r.name}: ${r.totalIncidents}`));
    
    return {
        rules: rulesWithIncidents,
        totalIncidents: totalIncidents
    };
}

// Process IPs statistics from visit data
function processIPsStats(visits) {
    console.log('Processing IPs statistics for', visits.length, 'visits');
    
    const ipStats = {};
    
    visits.forEach(visit => {
        // Only process visits that have security threats (attacks)
        const hasThreats = visit.securitySummary && Object.keys(visit.securitySummary).length > 0;
        
        if (hasThreats && visit.clientIPs && Array.isArray(visit.clientIPs)) {
            visit.clientIPs.forEach(ip => {
                if (!ip) return;
                
                if (!ipStats[ip]) {
                    ipStats[ip] = {
                        ip: ip,
                        hits: 0,
                        visits: 0,
                        totalThreats: 0,
                        countries: new Set(),
                        threatTypes: new Set(),
                        endpoints: new Set(),
                        userAgents: new Set()
                    };
                }
                
                ipStats[ip].hits += visit.hits || 0;
                ipStats[ip].visits += 1;
                
                // Count threats
                if (visit.securitySummary) {
                    Object.entries(visit.securitySummary).forEach(([threatType, count]) => {
                        ipStats[ip].totalThreats += count;
                        ipStats[ip].threatTypes.add(threatType);
                    });
                }
                
                // Add countries
                if (visit.country && Array.isArray(visit.country)) {
                    visit.country.forEach(country => {
                        if (country) ipStats[ip].countries.add(country);
                    });
                }
                
                // Add endpoints
                if (visit.entryPage) {
                    ipStats[ip].endpoints.add(visit.entryPage);
                }
                
                // Add user agents
                if (visit.userAgent) {
                    ipStats[ip].userAgents.add(visit.userAgent);
                }
            });
        }
    });
    
    // Convert sets to counts and arrays for display
    Object.keys(ipStats).forEach(ip => {
        ipStats[ip].countriesCount = ipStats[ip].countries ? ipStats[ip].countries.size : 0;
        ipStats[ip].countriesList = ipStats[ip].countries ? Array.from(ipStats[ip].countries) : [];
        ipStats[ip].threatTypesCount = ipStats[ip].threatTypes ? ipStats[ip].threatTypes.size : 0;
        ipStats[ip].threatTypesList = ipStats[ip].threatTypes ? Array.from(ipStats[ip].threatTypes) : [];
        ipStats[ip].endpointsCount = ipStats[ip].endpoints ? ipStats[ip].endpoints.size : 0;
        ipStats[ip].endpointsList = ipStats[ip].endpoints ? Array.from(ipStats[ip].endpoints) : [];
        ipStats[ip].userAgentsCount = ipStats[ip].userAgents ? ipStats[ip].userAgents.size : 0;
        
        // Clean up sets
        delete ipStats[ip].countries;
        delete ipStats[ip].threatTypes;
        delete ipStats[ip].endpoints;
        delete ipStats[ip].userAgents;
    });
    
    // Sort by hits count and return top 15
    const sortedIPs = Object.values(ipStats)
        .sort((a, b) => b.hits - a.hits)
        .slice(0, 15);
    
    console.log(`IPs processed: ${sortedIPs.length} IPs with attacks`);
    console.log('Top 5 IPs:', sortedIPs.slice(0, 5).map(ip => `${ip.ip}: ${ip.hits} hits`));
    
    return sortedIPs;
}