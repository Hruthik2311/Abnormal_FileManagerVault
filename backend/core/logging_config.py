import os

# Get the environment
ENVIRONMENT = os.environ.get('DJANGO_ENV', 'development')

# Base logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'files': {
            'handlers': ['console'],
            'level': 'INFO' if ENVIRONMENT == 'development' else 'WARNING',
            'propagate': True,
        },
    },
} 