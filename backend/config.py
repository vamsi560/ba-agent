# config.py
# Configuration settings for the BA Agent

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database Configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///ba_agent.db')

# Qdrant Vector Database Configuration
QDRANT_HOST = os.getenv('QDRANT_HOST', 'localhost')
QDRANT_PORT = int(os.getenv('QDRANT_PORT', 6333))

# Azure Configuration
ACS_CONNECTION_STRING = os.getenv('ACS_CONNECTION_STRING', '')
ACS_SENDER_ADDRESS = os.getenv('ACS_SENDER_ADDRESS', '')
APPROVAL_RECIPIENT_EMAIL = os.getenv('APPROVAL_RECIPIENT_EMAIL', '')
BACKEND_BASE_URL = os.getenv('BACKEND_BASE_URL', 'http://127.0.0.1:5000')
ADO_ORGANIZATION_URL = os.getenv('ADO_ORGANIZATION_URL', '')
ADO_PROJECT_NAME = os.getenv('ADO_PROJECT_NAME', '')
ADO_PAT = os.getenv('ADO_PERSONAL_ACCESS_TOKEN', '')

# Gemini API Key
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyBcerxr7f1mwXyjZlTKZ3LpsGrK8BFC1Hc')
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}" 