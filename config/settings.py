import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration class."""
    
    # Flask settings
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # API settings
    API_KEY = os.getenv('API_KEY')
    API_ID = os.getenv('API_ID')
    ACCOUNT_ID = os.getenv('ACCOUNT_ID')
    
    # Server settings
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    
    # Imperva API settings
    BASE_URLS = [
        "https://my.imperva.com",
        "https://my.incapsula.com",  # Fallback URL
    ]
    
    # Request settings
    MAX_RETRIES = int(os.getenv('MAX_RETRIES', 5))
    BACKOFF_FACTOR = float(os.getenv('BACKOFF_FACTOR', 2.0))
    TIMEOUT_CONNECT = int(os.getenv('TIMEOUT_CONNECT', 10))
    TIMEOUT_READ = int(os.getenv('TIMEOUT_READ', 30))
    
    # Data processing settings
    PAGE_SIZE = int(os.getenv('PAGE_SIZE', 100))
    MAX_CONSECUTIVE_FAILURES = int(os.getenv('MAX_CONSECUTIVE_FAILURES', 3))
    
    # Concurrent requests settings
    MAX_CONCURRENT_REQUESTS = int(os.getenv('MAX_CONCURRENT_REQUESTS', 5))
    ENABLE_CONCURRENT_REQUESTS = os.getenv('ENABLE_CONCURRENT_REQUESTS', 'true').lower() == 'true'
    
    @classmethod
    def validate_config(cls):
        """Validate that required configuration is present."""
        required_vars = ['API_KEY', 'API_ID', 'ACCOUNT_ID']
        missing_vars = []
        
        for var in required_vars:
            if not getattr(cls, var):
                missing_vars.append(var)
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        return True

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False

class TestingConfig(Config):
    """Testing configuration."""
    DEBUG = True
    TESTING = True

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}