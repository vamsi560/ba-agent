# database.py
# Database and Vector Database Configuration

import os
from sqlalchemy import create_engine, Column, String, DateTime, Text, Integer, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
import json
from datetime import datetime
import uuid

# Database Configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///ba_agent.db')
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Vector Database Configuration
QDRANT_HOST = os.getenv('QDRANT_HOST', 'localhost')
QDRANT_PORT = int(os.getenv('QDRANT_PORT', 6333))
qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

# Sentence Transformer for embeddings
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
VECTOR_SIZE = 384  # Dimension of the embedding model

# Database Models
class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    file_path = Column(String, nullable=False)
    content = Column(Text)
    metadata = Column(JSON)
    status = Column(String, default="uploaded")

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="completed")
    original_text = Column(Text)
    results = Column(JSON)
    document_id = Column(String)
    user_email = Column(String)

class VectorEmbedding(Base):
    __tablename__ = "vector_embeddings"
    
    id = Column(String, primary_key=True)
    content = Column(Text, nullable=False)
    embedding = Column(Text, nullable=False)  # JSON string of embedding
    metadata = Column(JSON)
    source_type = Column(String)  # 'document', 'analysis', 'requirement'
    source_id = Column(String)

# Database Operations
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    init_qdrant_collections()

# Qdrant Vector Database Operations
def init_qdrant_collections():
    """Initialize Qdrant collections"""
    collections = ['documents', 'analyses']
    
    for collection_name in collections:
        try:
            # Check if collection exists
            qdrant_client.get_collection(collection_name)
        except:
            # Create collection if it doesn't exist
            qdrant_client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE)
            )

def get_or_create_collection(collection_name):
    """Get or create a Qdrant collection"""
    try:
        # Check if collection exists
        qdrant_client.get_collection(collection_name)
    except:
        # Create collection if it doesn't exist
        qdrant_client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE)
        )
    return collection_name

def add_to_vector_db(content, metadata, collection_name="documents"):
    """Add content to Qdrant vector database"""
    # Ensure collection exists
    get_or_create_collection(collection_name)
    
    # Generate embedding
    embedding = embedding_model.encode(content).tolist()
    
    # Create point ID from metadata or generate new one
    point_id = metadata.get('id', str(uuid.uuid4()))
    
    # Add to collection
    qdrant_client.upsert(
        collection_name=collection_name,
        points=[
            PointStruct(
                id=point_id,
                vector=embedding,
                payload={
                    "content": content,
                    "metadata": metadata
                }
            )
        ]
    )

def search_vector_db(query, collection_name="documents", n_results=5):
    """Search Qdrant vector database"""
    # Ensure collection exists
    get_or_create_collection(collection_name)
    
    # Generate query embedding
    query_embedding = embedding_model.encode(query).tolist()
    
    # Search
    search_result = qdrant_client.search(
        collection_name=collection_name,
        query_vector=query_embedding,
        limit=n_results
    )
    
    # Format results to match expected structure
    results = {
        "documents": [],
        "metadatas": [],
        "distances": [],
        "ids": []
    }
    
    for point in search_result:
        results["documents"].append(point.payload.get("content", ""))
        results["metadatas"].append(point.payload.get("metadata", {}))
        results["distances"].append(point.score)
        results["ids"].append(point.id)
    
    return results

def delete_from_vector_db(point_id, collection_name="documents"):
    """Delete a point from Qdrant vector database"""
    try:
        qdrant_client.delete(
            collection_name=collection_name,
            points_selector=[point_id]
        )
        return True
    except Exception as e:
        print(f"Error deleting from vector db: {e}")
        return False

def update_vector_db(point_id, content, metadata, collection_name="documents"):
    """Update a point in Qdrant vector database"""
    # Generate new embedding
    embedding = embedding_model.encode(content).tolist()
    
    # Update point
    qdrant_client.upsert(
        collection_name=collection_name,
        points=[
            PointStruct(
                id=point_id,
                vector=embedding,
                payload={
                    "content": content,
                    "metadata": metadata
                }
            )
        ]
    )

# Utility Functions
def save_document_to_db(db, document_data, file_path, content):
    """Save document to database"""
    document = Document(
        id=document_data['id'],
        name=document_data['name'],
        file_type=document_data['fileType'],
        file_path=file_path,
        content=content,
        metadata=document_data
    )
    db.add(document)
    db.commit()
    return document

def save_analysis_to_db(db, analysis_data):
    """Save analysis to database"""
    analysis = Analysis(
        id=analysis_data['id'],
        title=analysis_data['title'],
        original_text=analysis_data['originalText'],
        results=analysis_data['results'],
        document_id=analysis_data.get('document_id'),
        user_email=analysis_data.get('user_email')
    )
    db.add(analysis)
    db.commit()
    return analysis 