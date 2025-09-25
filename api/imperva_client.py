import requests
import os
import time
import random
import socket
import asyncio
import aiohttp
import concurrent.futures
from datetime import datetime
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry


class ImpervaAPI:
    def __init__(self):
        self.api_key = os.getenv('API_KEY')
        self.api_id = os.getenv('API_ID')
        self.account_id = os.getenv('ACCOUNT_ID')
        self.base_urls = [
            "https://my.imperva.com",
            "https://my.incapsula.com",  # Fallback URL
        ]
        self.current_base_url = self.base_urls[0]
        self.session = self._create_resilient_session()
        
    def _create_resilient_session(self):
        """Create a requests session with retry strategy and timeout handling"""
        session = requests.Session()
        
        # Define retry strategy
        retry_strategy = Retry(
            total=5,  # Total number of retries
            status_forcelist=[429, 500, 502, 503, 504],  # HTTP status codes to retry on
            allowed_methods=["HEAD", "GET", "POST", "PUT", "DELETE", "OPTIONS", "TRACE"],
            backoff_factor=2,  # Exponential backoff factor (0.5, 1, 2, 4, 8 seconds)
            raise_on_status=False
        )
        
        # Mount adapter with retry strategy
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        # Set timeouts
        session.timeout = (10, 30)  # (connection_timeout, read_timeout)
        
        return session
    
    def _test_dns_connectivity(self):
        """Test DNS resolution and basic connectivity"""
        for base_url in self.base_urls:
            try:
                hostname = base_url.replace('https://', '').replace('http://', '')
                socket.gethostbyname(hostname)
                # Test basic connectivity
                response = self.session.get(base_url, timeout=5)
                if response.status_code != 404:  # Any response except 404 is good
                    self.current_base_url = base_url
                    print(f"DEBUG: Using base URL: {self.current_base_url}")
                    return True
            except (socket.gaierror, requests.exceptions.RequestException) as e:
                print(f"DEBUG: Failed to connect to {base_url}: {str(e)}")
                continue
        return False
    
    def get_ddos_visits(self, site_id, start_time, end_time, country_filter=None, max_retries=3):
        """Fetch DDoS visits with resilient error handling and automatic retries"""
        
        # Test connectivity first
        if not self._test_dns_connectivity():
            return {
                'error': 'Connectivity Error',
                'message': 'Unable to establish connection to Imperva API. Please check your internet connection.',
                'suggestion': 'Try again in a few moments or check if the Imperva service is experiencing issues.'
            }
        
        all_visits = []
        page_num = 0
        consecutive_failures = 0
        max_consecutive_failures = 3
        
        headers = {
            'accept': 'application/json',
            'x-API-Key': self.api_key,
            'x-API-Id': self.api_id,
            'User-Agent': 'Imperva-DDoS-Report-Generator/1.0'
        }
        
        print(f"DEBUG: Starting data collection for site {site_id} from {datetime.fromtimestamp(start_time/1000)} to {datetime.fromtimestamp(end_time/1000)}")
        
        while True:
            params = {
                'site_id': site_id,
                'time_range': 'custom',
                'start': start_time,
                'end': end_time,
                'page_size': 100,
                'page_num': page_num
            }
            
            success = False
            last_error = None
            
            # Retry logic with exponential backoff
            for attempt in range(max_retries):
                try:
                    print(f"DEBUG: Fetching page {page_num}, attempt {attempt + 1}")
                    
                    response = self.session.post(
                        f"{self.current_base_url}/api/visits/v1",
                        headers=headers,
                        params=params,
                        data='',
                        timeout=(15, 60)  # Longer timeout for data requests
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        visits = data.get('visits', [])
                        
                        if not visits:
                            print(f"DEBUG: No more visits found. Collected {len(all_visits)} total visits.")
                            success = True
                            break
                        
                        all_visits.extend(visits)
                        print(f"DEBUG: Page {page_num}: collected {len(visits)} visits (total: {len(all_visits)})")
                        page_num += 1
                        consecutive_failures = 0
                        success = True
                        break
                        
                    elif response.status_code == 429:  # Rate limited
                        wait_time = 2 ** attempt + random.uniform(0, 1)
                        print(f"DEBUG: Rate limited, waiting {wait_time:.2f} seconds")
                        time.sleep(wait_time)
                        last_error = f"Rate limited (HTTP {response.status_code})"
                        
                    elif response.status_code in [401, 403]:  # Auth errors
                        return {
                            'error': 'Authentication Error',
                            'message': f'API authentication failed (HTTP {response.status_code})',
                            'suggestion': 'Please check your API credentials in the .env file'
                        }
                        
                    elif response.status_code in [404]:  # Not found
                        return {
                            'error': 'API Endpoint Error',
                            'message': f'API endpoint not found (HTTP {response.status_code})',
                            'suggestion': 'The API endpoint may have changed or the site ID may be incorrect'
                        }
                        
                    else:
                        last_error = f"HTTP {response.status_code}: {response.text[:200]}"
                        print(f"DEBUG: HTTP error {response.status_code}: {response.text[:100]}")
                        
                except requests.exceptions.Timeout as e:
                    last_error = f"Timeout error: {str(e)}"
                    print(f"DEBUG: Timeout on attempt {attempt + 1}")
                    
                except requests.exceptions.ConnectionError as e:
                    last_error = f"Connection error: {str(e)}"
                    print(f"DEBUG: Connection error on attempt {attempt + 1}")
                    
                    # Try fallback URL if available
                    if attempt == 0 and len(self.base_urls) > 1:
                        old_url = self.current_base_url
                        self.current_base_url = self.base_urls[1] if self.current_base_url == self.base_urls[0] else self.base_urls[0]
                        print(f"DEBUG: Switching from {old_url} to {self.current_base_url}")
                        
                except requests.exceptions.RequestException as e:
                    last_error = f"Request error: {str(e)}"
                    print(f"DEBUG: Request error on attempt {attempt + 1}: {str(e)}")
                    
                except Exception as e:
                    last_error = f"Unexpected error: {str(e)}"
                    print(f"DEBUG: Unexpected error on attempt {attempt + 1}: {str(e)}")
                
                # Exponential backoff between retries
                if attempt < max_retries - 1:
                    wait_time = (2 ** attempt) + random.uniform(0, 1)
                    print(f"DEBUG: Waiting {wait_time:.2f} seconds before retry")
                    time.sleep(wait_time)
            
            if not success:
                consecutive_failures += 1
                print(f"DEBUG: Page {page_num} failed after {max_retries} attempts. Consecutive failures: {consecutive_failures}")
                
                if consecutive_failures >= max_consecutive_failures:
                    return {
                        'error': 'Multiple Request Failures',
                        'message': f'Failed to fetch data after multiple attempts. Last error: {last_error}',
                        'suggestion': 'The service may be temporarily unavailable. Please try again later.',
                        'partial_data': {
                            'visits': all_visits,
                            'total_visits': len(all_visits),
                            'note': f'Partial data collected ({len(all_visits)} visits before failure)'
                        } if all_visits else None
                    }
                    
                # Skip this page and try the next one
                page_num += 1
                continue
            else:
                # Success - exit the loop if no visits were returned
                if not data.get('visits'):
                    break
        
        print(f"DEBUG: Successfully collected {len(all_visits)} total visits")
        
        # Apply country filter after collecting all visits
        if country_filter and country_filter.lower() != 'all':
            print(f"DEBUG: Applying country filter: {country_filter}")
            original_count = len(all_visits)
            filtered_visits = []
            for visit in all_visits:
                if visit.get('country') and isinstance(visit['country'], list):
                    # Check if any country in the list matches the filter
                    if any(country.lower() == country_filter.lower() for country in visit['country']):
                        filtered_visits.append(visit)
                elif visit.get('country') and isinstance(visit['country'], str):
                    # Handle single country as string
                    if visit['country'].lower() == country_filter.lower():
                        filtered_visits.append(visit)
            all_visits = filtered_visits
            print(f"DEBUG: Country filter applied: {original_count} -> {len(all_visits)} visits")
        
        return {
            'visits': all_visits,
            'total_pages': page_num,
            'total_visits': len(all_visits),
            'success': True,
            'collection_info': {
                'pages_processed': page_num,
                'base_url_used': self.current_base_url,
                'filter_applied': country_filter if country_filter and country_filter.lower() != 'all' else None
            }
        }

    def get_security_rules(self, site_id):
        """Fetch security rules for a site to correlate with attack codes"""
        
        # Test connectivity first
        if not self._test_dns_connectivity():
            return {
                'error': 'Connectivity Error',
                'message': 'Unable to establish connection to Imperva API'
            }
        
        headers = {
            'accept': 'application/json',
            'x-API-Key': self.api_key,
            'x-API-Id': self.api_id,
            'User-Agent': 'Imperva-DDoS-Report-Generator/1.0'
        }
        
        params = {
            'site_id': site_id,
            'include_incap_rules': 'true',
            'include_ad_rules': 'NO',
            'page_size': 100,
            'page_num': 0
        }
        
        try:
            print(f"DEBUG: Fetching security rules for site {site_id}")
            
            response = self.session.post(
                f"{self.current_base_url}/api/prov/v1/sites/incapRules/list",
                headers=headers,
                params=params,
                data='',
                timeout=(15, 60)
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Process and organize rules
                rules_map = {}
                alert_rules = []
                block_rules = []
                
                # Process incap_rules
                incap_rules = data.get('incap_rules', {}).get('All', [])
                for rule in incap_rules:
                    rule_id = rule.get('id')
                    rule_name = rule.get('name', 'Unknown Rule')
                    rule_action = rule.get('action', '')
                    rule_enabled = rule.get('enabled', 'false') == 'true'
                    
                    if rule_id:
                        rules_map[rule_id] = {
                            'id': rule_id,
                            'name': rule_name,
                            'action': rule_action,
                            'enabled': rule_enabled,
                            'filter': rule.get('filter', ''),
                            'type': 'incap_rule'
                        }
                        
                        if rule_action == 'RULE_ACTION_ALERT':
                            alert_rules.append(rules_map[rule_id])
                        elif rule_action == 'RULE_ACTION_BLOCK':
                            block_rules.append(rules_map[rule_id])
                
                # Process rate_rules
                rate_rules = data.get('rate_rules', {}).get('Rates', [])
                for rule in rate_rules:
                    rule_id = rule.get('id')
                    rule_name = rule.get('name', 'Unknown Rate Rule')
                    rule_action = rule.get('action', '')
                    rule_enabled = rule.get('enabled', 'false') == 'true'
                    
                    if rule_id:
                        rules_map[rule_id] = {
                            'id': rule_id,
                            'name': rule_name,
                            'action': rule_action,
                            'enabled': rule_enabled,
                            'filter': rule.get('filter', ''),
                            'type': 'rate_rule'
                        }
                
                print(f"DEBUG: Retrieved {len(rules_map)} security rules")
                print(f"DEBUG: Alert rules: {len(alert_rules)}, Block rules: {len(block_rules)}")
                
                return {
                    'success': True,
                    'rules_map': rules_map,
                    'alert_rules': alert_rules,
                    'block_rules': block_rules,
                    'total_rules': len(rules_map),
                    'raw_data': data
                }
                
            elif response.status_code in [401, 403]:
                return {
                    'error': 'Authentication Error',
                    'message': f'API authentication failed for security rules (HTTP {response.status_code})',
                    'suggestion': 'Please check your API credentials and permissions'
                }
            else:
                return {
                    'error': 'API Error',
                    'message': f'Failed to fetch security rules (HTTP {response.status_code}): {response.text[:200]}',
                    'suggestion': 'The security rules API may be temporarily unavailable'
                }
                
        except requests.exceptions.Timeout as e:
            return {
                'error': 'Timeout Error',
                'message': f'Timeout while fetching security rules: {str(e)}'
            }
        except requests.exceptions.RequestException as e:
            return {
                'error': 'Connection Error',
                'message': f'Connection error while fetching security rules: {str(e)}'
            }
        except Exception as e:
            return {
                'error': 'Unexpected Error',
                'message': f'Unexpected error while fetching security rules: {str(e)}'
            }


    def get_ddos_visits_concurrent(self, site_id, start_time, end_time, country_filter=None, max_concurrent=5):
        """Fetch DDoS visits using dynamic concurrent requests until no more data"""
        
        # Test connectivity first
        if not self._test_dns_connectivity():
            return {
                'error': 'Connectivity Error',
                'message': 'Unable to establish connection to Imperva API. Please check your internet connection.',
                'suggestion': 'Try again in a few moments or check if the Imperva service is experiencing issues.'
            }
        
        print(f"DEBUG: Starting concurrent data collection for site {site_id}")
        print(f"DEBUG: Time range: {datetime.fromtimestamp(start_time/1000)} to {datetime.fromtimestamp(end_time/1000)}")
        
        try:
            # Step 1: Start with first page to check if data exists
            initial_result = self._fetch_single_page(site_id, start_time, end_time, 0)
            if 'error' in initial_result:
                return initial_result
                
            all_visits = initial_result.get('visits', [])
            
            if not all_visits:
                print("DEBUG: No data found on first page")
                return {
                    'visits': [],
                    'total_pages': 0,
                    'total_visits': 0,
                    'success': True,
                    'collection_info': {
                        'pages_processed': 0,
                        'base_url_used': self.current_base_url,
                        'filter_applied': country_filter if country_filter and country_filter.lower() != 'all' else None,
                        'concurrent': False
                    }
                }
            
            # If first page has less than 100 visits, we're done
            if len(all_visits) < 100:
                print(f"DEBUG: Only 1 page found with {len(all_visits)} visits")
                return {
                    'visits': all_visits,
                    'total_pages': 1,
                    'total_visits': len(all_visits),
                    'success': True,
                    'collection_info': {
                        'pages_processed': 1,
                        'base_url_used': self.current_base_url,
                        'filter_applied': country_filter if country_filter and country_filter.lower() != 'all' else None,
                        'concurrent': False
                    }
                }
            
            print(f"DEBUG: First page has {len(all_visits)} visits, discovering more pages...")
            
            # Step 2: Dynamically discover and fetch all remaining pages
            all_pages_visits = self._fetch_all_pages_dynamic(
                site_id, start_time, end_time, max_concurrent
            )
            
            if 'error' in all_pages_visits:
                # Fallback to sequential if concurrent fails
                print(f"DEBUG: Concurrent fetch failed, falling back to sequential: {all_pages_visits['error']}")
                return self.get_ddos_visits(site_id, start_time, end_time, country_filter)
            
            # Combine results (all_pages_visits includes page 0)
            all_visits = all_pages_visits['visits']
            
            print(f"DEBUG: Successfully collected {len(all_visits)} total visits using concurrent requests")
            
            # Apply country filter if specified
            if country_filter and country_filter.lower() != 'all':
                print(f"DEBUG: Applying country filter: {country_filter}")
                original_count = len(all_visits)
                filtered_visits = []
                for visit in all_visits:
                    if visit.get('country') and isinstance(visit['country'], list):
                        if any(country.lower() == country_filter.lower() for country in visit['country']):
                            filtered_visits.append(visit)
                    elif visit.get('country') and isinstance(visit['country'], str):
                        if visit['country'].lower() == country_filter.lower():
                            filtered_visits.append(visit)
                all_visits = filtered_visits
                print(f"DEBUG: Country filter applied: {original_count} -> {len(all_visits)} visits")
            
            return {
                'visits': all_visits,
                'total_pages': all_pages_visits['total_pages'],
                'total_visits': len(all_visits),
                'success': True,
                'collection_info': {
                    'pages_processed': all_pages_visits['total_pages'],
                    'base_url_used': self.current_base_url,
                    'filter_applied': country_filter if country_filter and country_filter.lower() != 'all' else None,
                    'concurrent': True,
                    'max_concurrent': max_concurrent
                }
            }
            
        except Exception as e:
            print(f"DEBUG: Concurrent collection failed with exception: {str(e)}")
            # Fallback to sequential method
            return self.get_ddos_visits(site_id, start_time, end_time, country_filter)

    def _fetch_initial_page(self, site_id, start_time, end_time):
        """Fetch the first page to estimate total pages"""
        headers = {
            'accept': 'application/json',
            'x-API-Key': self.api_key,
            'x-API-Id': self.api_id,
            'User-Agent': 'Imperva-DDoS-Report-Generator/1.0'
        }
        
        params = {
            'site_id': site_id,
            'time_range': 'custom',
            'start': start_time,
            'end': end_time,
            'page_size': 100,
            'page_num': 0
        }
        
        try:
            response = self.session.post(
                f"{self.current_base_url}/api/visits/v1",
                headers=headers,
                params=params,
                data='',
                timeout=(15, 60)
            )
            
            if response.status_code == 200:
                data = response.json()
                visits = data.get('visits', [])
                
                if not visits:
                    return {'visits': [], 'estimated_pages': 0}
                
                # Estimate total pages based on first page
                # This is a rough estimate - we'll discover the actual number during concurrent fetching
                estimated_pages = min(50, max(1, len(visits) // 20))  # Conservative estimate
                
                return {
                    'visits': visits,
                    'estimated_pages': estimated_pages
                }
            else:
                return {
                    'error': f'Initial page fetch failed: HTTP {response.status_code}',
                    'message': response.text[:200]
                }
                
        except Exception as e:
            return {
                'error': 'Initial page fetch error',
                'message': str(e)
            }

    def _fetch_pages_concurrent(self, site_id, start_time, end_time, page_numbers, max_concurrent):
        """Fetch multiple pages concurrently using ThreadPoolExecutor"""
        
        def fetch_single_page(page_num):
            """Fetch a single page - this will run in a thread"""
            headers = {
                'accept': 'application/json',
                'x-API-Key': self.api_key,
                'x-API-Id': self.api_id,
                'User-Agent': 'Imperva-DDoS-Report-Generator/1.0'
            }
            
            params = {
                'site_id': site_id,
                'time_range': 'custom',
                'start': start_time,
                'end': end_time,
                'page_size': 100,
                'page_num': page_num
            }
            
            try:
                # Add small random delay to avoid hammering the API
                time.sleep(random.uniform(0.1, 0.5))
                
                response = self.session.post(
                    f"{self.current_base_url}/api/visits/v1",
                    headers=headers,
                    params=params,
                    data='',
                    timeout=(15, 60)
                )
                
                if response.status_code == 200:
                    data = response.json()
                    visits = data.get('visits', [])
                    print(f"DEBUG: Page {page_num}: collected {len(visits)} visits")
                    return {'page_num': page_num, 'visits': visits, 'success': True}
                elif response.status_code == 429:
                    print(f"DEBUG: Page {page_num}: rate limited, will retry")
                    time.sleep(2)  # Wait before retry
                    return {'page_num': page_num, 'visits': [], 'success': False, 'retry': True}
                else:
                    print(f"DEBUG: Page {page_num}: HTTP {response.status_code}")
                    return {'page_num': page_num, 'visits': [], 'success': False, 'retry': False}
                    
            except Exception as e:
                print(f"DEBUG: Page {page_num}: Exception {str(e)}")
                return {'page_num': page_num, 'visits': [], 'success': False, 'retry': True, 'error': str(e)}
        
        all_visits = []
        failed_pages = []
        
        # Process pages in batches to avoid overwhelming the API
        batch_size = min(max_concurrent, 10)
        
        for i in range(0, len(page_numbers), batch_size):
            batch = page_numbers[i:i + batch_size]
            print(f"DEBUG: Processing batch {i//batch_size + 1}: pages {batch}")
            
            with concurrent.futures.ThreadPoolExecutor(max_workers=max_concurrent) as executor:
                # Submit all requests in this batch
                future_to_page = {executor.submit(fetch_single_page, page_num): page_num for page_num in batch}
                
                # Collect results
                for future in concurrent.futures.as_completed(future_to_page):
                    page_num = future_to_page[future]
                    try:
                        result = future.result()
                        if result['success']:
                            all_visits.extend(result['visits'])
                        elif result.get('retry'):
                            failed_pages.append(page_num)
                    except Exception as e:
                        print(f"DEBUG: Page {page_num}: Future exception {str(e)}")
                        failed_pages.append(page_num)
            
            # Small delay between batches
            if i + batch_size < len(page_numbers):
                time.sleep(0.5)
        
        # Retry failed pages sequentially
        if failed_pages:
            print(f"DEBUG: Retrying {len(failed_pages)} failed pages sequentially")
            for page_num in failed_pages[:5]:  # Limit retries to 5 pages
                result = fetch_single_page(page_num)
                if result['success']:
                    all_visits.extend(result['visits'])
        
        return {
            'visits': all_visits,
            'total_pages_fetched': len(page_numbers),
            'failed_pages': len(failed_pages)
        }

    def _fetch_single_page(self, site_id, start_time, end_time, page_num):
        """Fetch a single page of data"""
        headers = {
            'accept': 'application/json',
            'x-API-Key': self.api_key,
            'x-API-Id': self.api_id,
            'User-Agent': 'Imperva-DDoS-Report-Generator/1.0'
        }
        
        params = {
            'site_id': site_id,
            'time_range': 'custom',
            'start': start_time,
            'end': end_time,
            'page_size': 100,
            'page_num': page_num
        }
        
        try:
            response = self.session.post(
                f"{self.current_base_url}/api/visits/v1",
                headers=headers,
                params=params,
                data='',
                timeout=(15, 60)
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'visits': data.get('visits', []),
                    'success': True
                }
            else:
                return {
                    'error': f'Page {page_num} fetch failed: HTTP {response.status_code}',
                    'message': response.text[:200]
                }
                
        except Exception as e:
            return {
                'error': f'Page {page_num} fetch error',
                'message': str(e)
            }

    def _fetch_all_pages_dynamic(self, site_id, start_time, end_time, max_concurrent):
        """Dynamically discover and fetch all pages until no more data"""
        
        def fetch_page_batch(start_page, batch_size):
            """Fetch a batch of pages concurrently"""
            page_numbers = list(range(start_page, start_page + batch_size))
            
            def fetch_single_page_worker(page_num):
                """Worker function for ThreadPoolExecutor"""
                return self._fetch_single_page(site_id, start_time, end_time, page_num)
            
            batch_visits = []
            empty_pages = 0
            
            with concurrent.futures.ThreadPoolExecutor(max_workers=max_concurrent) as executor:
                future_to_page = {
                    executor.submit(fetch_single_page_worker, page_num): page_num 
                    for page_num in page_numbers
                }
                
                for future in concurrent.futures.as_completed(future_to_page):
                    page_num = future_to_page[future]
                    try:
                        result = future.result()
                        if result.get('success'):
                            visits = result.get('visits', [])
                            if visits:
                                batch_visits.extend(visits)
                                print(f"DEBUG: Page {page_num}: collected {len(visits)} visits")
                            else:
                                empty_pages += 1
                                print(f"DEBUG: Page {page_num}: empty page")
                        else:
                            print(f"DEBUG: Page {page_num}: failed - {result.get('error', 'Unknown error')}")
                            empty_pages += 1
                    except Exception as e:
                        print(f"DEBUG: Page {page_num}: exception - {str(e)}")
                        empty_pages += 1
            
            return batch_visits, empty_pages, len(page_numbers)
        
        # Start collecting all pages
        all_visits = []
        current_page = 0
        batch_size = max_concurrent
        total_pages_processed = 0
        consecutive_empty_batches = 0
        
        print(f"DEBUG: Starting dynamic page discovery with batch_size={batch_size}")
        
        while consecutive_empty_batches < 2:  # Stop after 2 consecutive empty batches
            batch_visits, empty_pages, pages_in_batch = fetch_page_batch(current_page, batch_size)
            
            all_visits.extend(batch_visits)
            total_pages_processed += pages_in_batch
            
            print(f"DEBUG: Processing batch {current_page//batch_size + 1}: pages [{current_page}-{current_page + batch_size - 1}]")
            print(f"DEBUG: Batch results: {len(batch_visits)} visits, {empty_pages} empty pages")
            
            if empty_pages >= batch_size:
                # All pages in this batch were empty
                consecutive_empty_batches += 1
                print(f"DEBUG: All pages empty in batch (consecutive empty batches: {consecutive_empty_batches})")
            else:
                consecutive_empty_batches = 0  # Reset counter
            
            current_page += batch_size
            
            # Safety limit to prevent infinite loops
            if total_pages_processed >= 200:  # Reasonable upper limit
                print("DEBUG: Reached safety limit of 200 pages")
                break
            
            # Small delay between batches to be nice to the API
            time.sleep(0.3)
        
        print(f"DEBUG: Dynamic discovery complete: {len(all_visits)} visits from {total_pages_processed} pages")
        
        return {
            'visits': all_visits,
            'total_pages': total_pages_processed,
            'success': True
        }

    def get_stats_data(self, site_id, start_time, end_time, stats_types=['incap_rules', 'threats', 'incap_rules_timeseries'], granularity=300000):
        """Fetch statistics data from Imperva API"""
        
        # Test connectivity first
        if not self._test_dns_connectivity():
            return {
                'error': 'Connectivity Error',
                'message': 'Unable to establish connection to Imperva API'
            }
        
        headers = {
            'accept': 'application/json',
            'x-API-Key': self.api_key,
            'x-API-Id': self.api_id,
            'User-Agent': 'Imperva-DDoS-Report-Generator/1.0'
        }
        
        all_stats = {}
        
        for stats_type in stats_types:
            params = {
                'account_id': self.account_id,
                'time_range': 'custom',
                'start': start_time,
                'end': end_time,
                'site_id': site_id,
                'stats': stats_type
            }
            
            # Add granularity for timeseries stats
            if 'timeseries' in stats_type:
                params['granularity'] = granularity
            
            try:
                print(f"DEBUG: Fetching {stats_type} stats for site {site_id}")
                
                response = self.session.post(
                    f"{self.current_base_url}/api/stats/v1",
                    headers=headers,
                    params=params,
                    data='',
                    timeout=(15, 60)
                )
                
                if response.status_code == 200:
                    data = response.json()
                    all_stats[stats_type] = data.get(stats_type, [])
                    print(f"DEBUG: Retrieved {len(all_stats[stats_type])} {stats_type} entries")
                    
                elif response.status_code in [401, 403]:
                    return {
                        'error': 'Authentication Error',
                        'message': f'API authentication failed for {stats_type} (HTTP {response.status_code})',
                        'suggestion': 'Please check your API credentials and permissions'
                    }
                else:
                    print(f"DEBUG: Failed to fetch {stats_type}: HTTP {response.status_code}")
                    all_stats[stats_type] = []
                    
            except requests.exceptions.Timeout as e:
                print(f"DEBUG: Timeout fetching {stats_type}: {str(e)}")
                all_stats[stats_type] = []
            except requests.exceptions.RequestException as e:
                print(f"DEBUG: Request error fetching {stats_type}: {str(e)}")
                all_stats[stats_type] = []
            except Exception as e:
                print(f"DEBUG: Unexpected error fetching {stats_type}: {str(e)}")
                all_stats[stats_type] = []
        
        return {
            'success': True,
            'stats': all_stats,
            'base_url_used': self.current_base_url
        }

    def get_sites(self, page_num=0):
        """Fetch sites list from Imperva API"""
        
        # Test connectivity first
        if not self._test_dns_connectivity():
            return {
                'error': 'Connectivity Error',
                'message': 'Unable to establish connection to Imperva API'
            }
        
        headers = {
            'accept': 'application/json',
            'x-API-Key': self.api_key,
            'x-API-Id': self.api_id,
            'User-Agent': 'Imperva-DDoS-Report-Generator/1.0'
        }
        
        params = {
            'account_id': self.account_id,
            'page_size': 100,
            'page_num': page_num
        }
        
        try:
            print(f"DEBUG: Fetching sites list (page {page_num})")
            
            response = self.session.post(
                f"{self.current_base_url}/api/prov/v1/sites/list",
                headers=headers,
                params=params,
                data='',
                timeout=(15, 60)
            )
            
            if response.status_code == 200:
                data = response.json()
                sites = data.get('sites', [])
                
                # Format sites for frontend consumption
                formatted_sites = []
                for site in sites:
                    site_id = site.get('site_id')
                    domain = site.get('domain')
                    account_id = site.get('account_id')
                    
                    if site_id and domain:
                        formatted_sites.append({
                            'site_id': site_id,
                            'domain': domain,
                            'account_id': account_id
                        })
                
                print(f"DEBUG: Retrieved {len(formatted_sites)} sites from page {page_num}")
                
                return {
                    'success': True,
                    'sites': formatted_sites,
                    'total_sites': len(formatted_sites),
                    'page_num': page_num
                }
                
            elif response.status_code in [401, 403]:
                return {
                    'error': 'Authentication Error',
                    'message': f'API authentication failed for sites list (HTTP {response.status_code})',
                    'suggestion': 'Please check your API credentials and permissions'
                }
            else:
                return {
                    'error': 'API Error',
                    'message': f'Failed to fetch sites list (HTTP {response.status_code}): {response.text[:200]}',
                    'suggestion': 'The sites list API may be temporarily unavailable'
                }
                
        except requests.exceptions.Timeout as e:
            return {
                'error': 'Timeout Error',
                'message': f'Timeout while fetching sites list: {str(e)}'
            }
        except requests.exceptions.RequestException as e:
            return {
                'error': 'Connection Error',
                'message': f'Connection error while fetching sites list: {str(e)}'
            }
        except Exception as e:
            return {
                'error': 'Unexpected Error',
                'message': f'Unexpected error while fetching sites list: {str(e)}'
            }

    def get_all_sites(self):
        """Fetch all sites by paginating through all pages"""
        
        all_sites = []
        page_num = 0
        
        while True:
            result = self.get_sites(page_num)
            
            if result.get('error'):
                # If first page fails, return error
                if page_num == 0:
                    return result
                # If later pages fail, return what we have
                break
            
            sites = result.get('sites', [])
            if not sites:
                break
                
            all_sites.extend(sites)
            page_num += 1
            
            # Safety limit to prevent infinite loops
            if page_num >= 50:  # Reasonable upper limit for pages
                print("DEBUG: Reached safety limit of 50 pages for sites")
                break
        
        print(f"DEBUG: Retrieved total of {len(all_sites)} sites across {page_num} pages")
        
        return {
            'success': True,
            'sites': all_sites,
            'total_sites': len(all_sites),
            'total_pages': page_num
        }