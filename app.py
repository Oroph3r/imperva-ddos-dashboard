from flask import Flask, render_template, request, jsonify
from datetime import datetime
import traceback
import threading
import time

# Import modular components
from config.settings import config, Config
from api.imperva_client import ImpervaAPI

# Global variables for sites cache
sites_cache = {
    'data': [],
    'status': 'loading',  # loading, ready, error
    'last_updated': None,
    'error_message': None,
    'total_sites': 0
}

def load_sites_cache():
    """Load sites from Imperva API into global cache."""
    global sites_cache
    
    print("DEBUG: Starting sites cache loading...")
    sites_cache['status'] = 'loading'
    sites_cache['error_message'] = None
    
    try:
        # Initialize API client
        imperva_api = ImpervaAPI()
        
        print("DEBUG: Fetching all sites from Imperva API...")
        result = imperva_api.get_all_sites()
        
        if result.get('error'):
            print(f"ERROR: Failed to load sites: {result.get('error')} - {result.get('message')}")
            sites_cache['status'] = 'error'
            sites_cache['error_message'] = f"{result.get('error')}: {result.get('message')}"
            return False
        
        # Update cache with successful result
        sites_cache['data'] = result.get('sites', [])
        sites_cache['total_sites'] = len(sites_cache['data'])
        sites_cache['status'] = 'ready'
        sites_cache['last_updated'] = datetime.now()
        sites_cache['error_message'] = None
        
        print(f"SUCCESS: Loaded {sites_cache['total_sites']} sites into cache")
        return True
        
    except Exception as e:
        error_msg = f"Unexpected error loading sites: {str(e)}"
        print(f"ERROR: {error_msg}")
        print(f"DEBUG: Full traceback: {traceback.format_exc()}")
        
        sites_cache['status'] = 'error'
        sites_cache['error_message'] = error_msg
        return False

def load_sites_background():
    """Load sites in background thread."""
    print("DEBUG: Starting background sites loading thread...")
    load_sites_cache()

def refresh_sites_cache():
    """Refresh sites cache (can be called periodically or on demand)."""
    print("DEBUG: Refreshing sites cache...")
    thread = threading.Thread(target=load_sites_background, daemon=True)
    thread.start()
    return thread

def create_app(config_name='default'):
    """Application factory pattern."""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Validate configuration
    try:
        Config.validate_config()
    except ValueError as e:
        app.logger.error(f"Configuration error: {e}")
        raise
    
    # Register routes
    register_routes(app)
    
    # Start loading sites cache in background
    print("INFO: Starting sites cache loading in background...")
    refresh_sites_cache()
    
    return app

def register_routes(app):
    """Register application routes."""
    
    @app.route('/')
    def index():
        """Main dashboard page."""
        return render_template('index.html')

    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint."""
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'version': '1.0'
        }), 200

    @app.route('/api/sites', methods=['GET'])
    def get_sites():
        """Get all available sites from cache."""
        app.logger.info("/api/sites endpoint called")
        
        global sites_cache
        
        try:
            # Check refresh parameter
            refresh_requested = request.args.get('refresh', '').lower() == 'true'
            
            if refresh_requested:
                app.logger.info("Refresh requested - triggering cache reload")
                refresh_sites_cache()
                # Wait a bit for the refresh to start
                time.sleep(0.5)
            
            # Return current cache status and data
            response_data = {
                'status': sites_cache['status'],
                'sites': sites_cache['data'],
                'total_sites': sites_cache['total_sites'],
                'last_updated': sites_cache['last_updated'].isoformat() if sites_cache['last_updated'] else None,
                'error_message': sites_cache['error_message'],
                'timestamp': datetime.now().isoformat(),
                'success': sites_cache['status'] == 'ready'
            }
            
            # Set appropriate HTTP status code based on cache status
            if sites_cache['status'] == 'loading':
                app.logger.info(f"Sites cache still loading...")
                http_status = 202  # Accepted - processing
            elif sites_cache['status'] == 'error':
                app.logger.error(f"Sites cache in error state: {sites_cache['error_message']}")
                http_status = 503  # Service Unavailable
            else:  # ready
                app.logger.info(f"Successfully serving {sites_cache['total_sites']} sites from cache")
                http_status = 200  # OK
            
            response = jsonify(response_data)
            response.headers['Content-Type'] = 'application/json'
            return response, http_status
            
        except Exception as e:
            # Handle unexpected errors
            error_msg = str(e)
            app.logger.error(f"Unexpected error in get_sites: {error_msg}")
            app.logger.error(f"Full traceback: {traceback.format_exc()}")
            
            response = jsonify({
                'error': 'Unexpected Error',
                'message': f'An unexpected error occurred while fetching sites: {error_msg}',
                'suggestion': 'Please try again. If the problem persists, check the server logs.',
                'timestamp': datetime.now().isoformat(),
                'success': False
            })
            response.headers['Content-Type'] = 'application/json'
            return response, 500

    @app.route('/api/ddos-report', methods=['POST'])
    def get_ddos_report():
        """Main API endpoint for DDoS report generation."""
        app.logger.info("/api/ddos-report endpoint called")
        
        try:
            # Parse request data
            data = request.get_json()
            app.logger.info(f"Received request data: {data}")
            
            if not data:
                app.logger.warning("No JSON data received")
                return jsonify({
                    'error': 'No data received', 
                    'message': 'Request body is empty'
                }), 400
            
            # Extract and validate parameters
            site_id = data.get('site_id')
            start_date = data.get('start_date')
            end_date = data.get('end_date')
            country_filter = data.get('country_filter')
            
            app.logger.info(f"Parsed parameters - site_id: {site_id}, start_date: {start_date}, end_date: {end_date}, country_filter: '{country_filter}'")
            
            # Validate required parameters
            if not all([site_id, start_date, end_date]):
                missing_params = []
                if not site_id: missing_params.append('site_id')
                if not start_date: missing_params.append('start_date')
                if not end_date: missing_params.append('end_date')
                
                app.logger.warning(f"Missing required parameters: {missing_params}")
                return jsonify({
                    'error': 'Missing required parameters', 
                    'missing': missing_params
                }), 400
                
        except Exception as e:
            app.logger.error(f"Error parsing request: {str(e)}")
            return jsonify({
                'error': 'Request parsing error', 
                'message': str(e)
            }), 400
        
        try:
            # Convert dates to timestamps
            start_timestamp = int(datetime.fromisoformat(start_date).timestamp() * 1000)
            end_timestamp = int(datetime.fromisoformat(end_date).timestamp() * 1000)
        except ValueError as e:
            app.logger.error(f"Invalid date format: {e}")
            return jsonify({'error': 'Invalid date format'}), 400
        
        try:
            # Initialize API client
            imperva_api = ImpervaAPI()
            
            # Fetch security rules for attack code correlation (names only)
            app.logger.info(f"Fetching security rules for attack code correlation for site {site_id}")
            security_rules_result = imperva_api.get_security_rules(site_id)
            
            if security_rules_result.get('error'):
                app.logger.warning(f"Failed to fetch security rules: {security_rules_result.get('error')}")
                # Continue without security rules
                rules_map = {}
            else:
                rules_map = security_rules_result.get('rules_map', {})
            
            # Fetch DDoS visits - use concurrent requests if enabled
            if app.config.get('ENABLE_CONCURRENT_REQUESTS', True):
                app.logger.info("Fetching DDoS visits using concurrent requests")
                max_concurrent = app.config.get('MAX_CONCURRENT_REQUESTS', 5)
                try:
                    result = imperva_api.get_ddos_visits_concurrent(
                        site_id, start_timestamp, end_timestamp, None, max_concurrent=max_concurrent
                    )
                except Exception as e:
                    app.logger.warning(f"Concurrent fetch failed, falling back to sequential: {str(e)}")
                    result = imperva_api.get_ddos_visits(site_id, start_timestamp, end_timestamp, None)
            else:
                app.logger.info("Fetching DDoS visits using sequential requests")
                result = imperva_api.get_ddos_visits(site_id, start_timestamp, end_timestamp, None)
            
            # Fetch statistics data (incap_rules, threats, incap_rules_timeseries)
            app.logger.info("Fetching statistics data from Imperva")
            stats_result = imperva_api.get_stats_data(site_id, start_timestamp, end_timestamp)
            
            # Include stats in the response even if there's an error
            stats_data = {}
            if stats_result.get('error'):
                app.logger.warning(f"Failed to fetch stats: {stats_result.get('error')}")
                # Set empty stats data
                stats_data = {
                    'incap_rules': [],
                    'threats': [],
                    'incap_rules_timeseries': []
                }
            else:
                stats_data = stats_result.get('stats', {})
            
            # Check for API errors
            if result.get('error'):
                app.logger.error(f"API Error: {result.get('error')} - {result.get('message')}")
                
                return jsonify({
                    'error': result.get('error'),
                    'message': result.get('message'),
                    'suggestion': result.get('suggestion'),
                    'partial_data': result.get('partial_data'),
                    'retry_recommended': True,
                    'timestamp': datetime.now().isoformat()
                }), 503 if 'Connectivity' in result.get('error', '') else 500
            
            # Build successful response
            response_data = {
                **result,
                'request_info': {
                    'site_id': site_id,
                    'date_range': f"{datetime.fromtimestamp(start_timestamp/1000).strftime('%Y-%m-%d %H:%M')} to {datetime.fromtimestamp(end_timestamp/1000).strftime('%Y-%m-%d %H:%M')}",
                    'country_filter': country_filter,
                    'timestamp': datetime.now().isoformat()
                },
                'rules_map': rules_map,  # Include rules map for frontend correlation
                'stats': stats_data  # Include statistics data for new charts
            }
            
            app.logger.info(f"Sending successful response with {result.get('total_visits', 0)} visits")
            
            response = jsonify(response_data)
            response.headers['Content-Type'] = 'application/json'
            return response
            
        except Exception as e:
            # Handle unexpected errors
            error_msg = str(e)
            app.logger.error(f"Unexpected error in get_ddos_report: {error_msg}")
            app.logger.error(f"Full traceback: {traceback.format_exc()}")
            
            response = jsonify({
                'error': 'Unexpected Error',
                'message': f'An unexpected error occurred: {error_msg}',
                'suggestion': 'Please try again. If the problem persists, check the server logs.',
                'retry_recommended': True,
                'timestamp': datetime.now().isoformat()
            })
            response.headers['Content-Type'] = 'application/json'
            return response, 500


if __name__ == '__main__':
    # Create and run the application
    app = create_app('development')
    
    # Get configuration
    host = app.config.get('HOST', '0.0.0.0')
    port = app.config.get('PORT', 5000)
    debug = app.config.get('DEBUG', True)
    
    app.run(debug=debug, host=host, port=port)