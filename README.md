# Business Analyst Agent

A comprehensive AI-powered Business Analyst Agent that automates the generation of Technical Requirements Documents (TRD), High-Level Designs (HLD), Low-Level Designs (LLD), and project backlogs from business requirements.

## 🚀 Features

### Core Functionality
- **Document Processing**: Upload PDF/DOCX files or paste requirements text
- **AI-Powered Analysis**: Uses Gemini AI to extract and analyze requirements
- **Automated Generation**: Creates TRD, HLD, LLD, and project backlogs
- **Multiple Export Formats**: Download as DOCX, Markdown, Mermaid diagrams, or PNG
- **Approval Workflow**: Send generated documents for approval via email
- **Azure DevOps Integration**: Automatically create work items upon approval

### Enhanced Features
- **Document Library**: Store and manage uploaded documents
- **Past Analyses**: View and access previous analysis results
- **Vector Database**: Semantic search using Qdrant vector database
- **Database Storage**: Persistent storage using SQLAlchemy
- **Responsive UI**: Modern, accessible interface with Tailwind CSS

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- Docker and Docker Compose (for containerized setup)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ba_agent
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ACS_CONNECTION_STRING=your_azure_connection_string
   ACS_SENDER_ADDRESS=your_sender_email
   APPROVAL_RECIPIENT_EMAIL=approver@example.com
   ```

3. **Start all services**:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Qdrant Dashboard: http://localhost:6333

### Option 2: Local Development Setup

#### Backend Setup

1. **Install Qdrant**:
   ```bash
   # Using Docker (recommended)
   docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant:latest
   
   # Or download from https://qdrant.tech/documentation/guides/installation/
   ```

2. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

3. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables** (optional):
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=sqlite:///ba_agent.db
   QDRANT_HOST=localhost
   QDRANT_PORT=6333
   GEMINI_API_KEY=your_gemini_api_key
   ACS_CONNECTION_STRING=your_azure_connection_string
   ACS_SENDER_ADDRESS=your_sender_email
   APPROVAL_RECIPIENT_EMAIL=approver@example.com
   ```

6. **Run the backend**:
   ```bash
   python main.py
   ```

#### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

## 📁 Project Structure

```
ba_agent/
├── backend/
│   ├── main.py              # Main Flask application
│   ├── database.py          # Database models and Qdrant operations
│   ├── config.py            # Configuration settings
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Backend Docker configuration
│   └── venv/                # Virtual environment
├── frontend/
│   ├── src/
│   │   ├── App.js           # Main React component
│   │   └── ...
│   ├── package.json         # Node.js dependencies
│   ├── Dockerfile           # Frontend Docker configuration
│   └── ...
├── docker-compose.yml       # Multi-service Docker setup
└── README.md
```

## 🔧 API Endpoints

### Core Endpoints
- `POST /api/generate` - Generate TRD, HLD, LLD, and backlog
- `POST /api/convert_to_docx` - Convert markdown to DOCX
- `POST /api/render_mermaid` - Convert Mermaid to PNG
- `POST /api/approve` - Send for approval

### Document Management
- `POST /api/upload_document` - Upload document
- `GET /api/documents` - Get all documents
- `GET /api/documents/<id>` - Get specific document

### Analysis Management
- `GET /api/analyses` - Get all past analyses
- `GET /api/analyses/<id>` - Get specific analysis

### Vector Search (Qdrant)
- `POST /api/search` - Semantic search across documents and analyses
- `GET /api/vector/collections` - Get all Qdrant collections
- `GET /api/vector/collections/<name>/info` - Get collection information
- `GET /api/vector/collections/<name>/points` - Get collection points
- `DELETE /api/vector/collections/<name>/points/<id>` - Delete a point

## 🗄️ Database Schema

### SQL Database (SQLAlchemy)
- **Documents Table**: Store document metadata and content
- **Analyses Table**: Store analysis results and metadata

### Vector Database (Qdrant)
- **Collections**: `documents`, `analyses`
- **Vector Size**: 384 dimensions (all-MiniLM-L6-v2 model)
- **Distance Metric**: Cosine similarity
- **Payload**: Content and metadata for each vector

## 🔍 Vector Database Features

### Qdrant Integration
- **High Performance**: Optimized for production vector search
- **Scalability**: Horizontal scaling capabilities
- **Persistence**: Data persistence across restarts
- **Filtering**: Advanced filtering and search capabilities
- **Real-time Updates**: Immediate vector updates and deletions

### Semantic Search Capabilities
- **Document Embeddings**: All uploaded documents are embedded
- **Analysis Embeddings**: Analysis results are embedded for similarity
- **Natural Language Queries**: Find similar content using natural language
- **Similarity Scoring**: Cosine similarity scores for ranking results

## 🎨 UI Features

### Main Interface
- **Upload Section**: Drag-and-drop file upload or text input
- **Progress Tracking**: Real-time progress indicators
- **Results Tabs**: Organized view of generated artifacts
- **Download Options**: Multiple format downloads

### Sidebar Navigation
- **New Analysis**: Start fresh analysis
- **Documents**: Manage document library
- **Past Analyses**: View previous results

### Enhanced Diagrams
- **Dual View**: Mermaid diagram and PNG version side-by-side
- **Interactive**: Expandable/collapsible backlog items
- **Statistics**: Visual backlog item counts

## 🔐 Security Features

- **Environment Variables**: Sensitive data stored in environment variables
- **File Validation**: Strict file type validation
- **Error Handling**: Comprehensive error handling and user feedback
- **Database Security**: SQLAlchemy ORM for safe database operations

## 🚀 Deployment

### Production Considerations
1. **Database**: Use PostgreSQL or MySQL instead of SQLite
2. **Vector Database**: Use cloud-hosted Qdrant or self-hosted cluster
3. **File Storage**: Use cloud storage (AWS S3, Azure Blob)
4. **Environment Variables**: Set all required environment variables
5. **HTTPS**: Enable HTTPS for production
6. **CORS**: Configure CORS for your domain

### Docker Production Deployment
```bash
# Build and start all services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services as needed
docker-compose up -d --scale backend=3
```

### Qdrant Production Setup
```bash
# Standalone Qdrant
docker run -p 6333:6333 -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant:latest

# Qdrant with custom configuration
docker run -p 6333:6333 -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  -v $(pwd)/qdrant_config.yaml:/qdrant/config/qdrant.yaml \
  qdrant/qdrant:latest
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔄 Changelog

### Latest Updates
- ✅ DOCX download functionality
- ✅ Enhanced HLD/LLD diagram display
- ✅ Removed confetti animation
- ✅ Backlog statistics display
- ✅ Document library management
- ✅ Past analyses tracking
- ✅ **Qdrant vector database integration**
- ✅ Database persistence
- ✅ Semantic search capabilities
- ✅ Docker containerization
- ✅ Production-ready vector search 