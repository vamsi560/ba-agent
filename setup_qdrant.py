#!/usr/bin/env python3
"""
Qdrant Setup Script for BA Agent
This script helps initialize Qdrant collections and test the connection.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import Distance, VectorParams
    from sentence_transformers import SentenceTransformer
except ImportError as e:
    print(f"Error: Missing required packages. Please install them first:")
    print(f"pip install qdrant-client sentence-transformers python-dotenv")
    sys.exit(1)

def test_qdrant_connection():
    """Test connection to Qdrant"""
    host = os.getenv('QDRANT_HOST', 'localhost')
    port = int(os.getenv('QDRANT_PORT', 6333))
    
    try:
        client = QdrantClient(host=host, port=port)
        collections = client.get_collections()
        print(f"✅ Successfully connected to Qdrant at {host}:{port}")
        print(f"📊 Found {len(collections.collections)} collections")
        return client
    except Exception as e:
        print(f"❌ Failed to connect to Qdrant at {host}:{port}")
        print(f"Error: {e}")
        print("\n💡 Make sure Qdrant is running:")
        print("   docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant:latest")
        return None

def create_collections(client):
    """Create required collections"""
    collections = ['documents', 'analyses']
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    vector_size = 384  # Dimension of the embedding model
    
    for collection_name in collections:
        try:
            # Check if collection exists
            client.get_collection(collection_name)
            print(f"✅ Collection '{collection_name}' already exists")
        except:
            # Create collection
            client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE)
            )
            print(f"✅ Created collection '{collection_name}'")

def test_embedding_model():
    """Test the embedding model"""
    try:
        model = SentenceTransformer('all-MiniLM-L6-v2')
        test_text = "This is a test sentence for embedding generation."
        embedding = model.encode(test_text)
        print(f"✅ Embedding model working (vector size: {len(embedding)})")
        return True
    except Exception as e:
        print(f"❌ Failed to load embedding model: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 BA Agent Qdrant Setup")
    print("=" * 40)
    
    # Test embedding model
    if not test_embedding_model():
        sys.exit(1)
    
    # Test Qdrant connection
    client = test_qdrant_connection()
    if not client:
        sys.exit(1)
    
    # Create collections
    print("\n📁 Creating collections...")
    create_collections(client)
    
    print("\n✅ Setup complete!")
    print("\n🎯 Next steps:")
    print("1. Start the backend: python backend/main.py")
    print("2. Start the frontend: npm start (in frontend directory)")
    print("3. Or use Docker: docker-compose up -d")

if __name__ == "__main__":
    main() 