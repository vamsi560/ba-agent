import React, { useRef, useState, useEffect } from 'react';
import { 
    UploadCloud, FileText, ListCollapse, Folder, Clock, Settings, CheckCircle, XCircle, 
    ChevronDown, ChevronRight, Search, Send as SendIcon, Copy
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// --- Helper Components ---

function MarkdownRenderer({ markdown }) {
  const sanitizedMarkdown = markdown || 'No content generated.';
  return (
    <div className="prose prose-slate max-w-none p-4 bg-white rounded-lg shadow-inner">
      <ReactMarkdown>{sanitizedMarkdown}</ReactMarkdown>
    </div>
  );
}

function MermaidDiagram({ code, id, showDownloadPng, showPngInline }) {
  const containerRef = useRef(null);
  const [pngUrl, setPngUrl] = useState(null);
  const [loadingPng, setLoadingPng] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function renderMermaid() {
      if (!code) {
        if (containerRef.current) {
          containerRef.current.innerHTML = '<div class="text-red-500">No diagram code provided.</div>';
        }
        return;
      }
      // Dynamically import mermaid if not already loaded
      if (!window.mermaid) {
        const mermaidModule = await import('mermaid');
        window.mermaid = mermaidModule.default || mermaidModule;
      }
      try {
        window.mermaid.initialize({ startOnLoad: false });
        // Use a unique SVG id, not the container id
        window.mermaid.render('svg-' + id, code, (svgCode) => {
          if (isMounted && containerRef.current) {
            containerRef.current.innerHTML = svgCode;
          }
        }, containerRef.current);
      } catch (e) {
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = '<div class="text-red-500">Diagram rendering failed.</div>';
        }
        console.error('Mermaid render error:', e);
      }
    }
    renderMermaid();
    return () => { isMounted = false; };
  }, [code, id]);

  const downloadPng = async () => {
    const response = await fetch('http://127.0.0.1:5000/api/render_mermaid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${id}.png`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert('Failed to generate PNG');
    }
  };

  // Fetch PNG for inline display
  const fetchPng = async () => {
    setLoadingPng(true);
    setPngUrl(null);
    const response = await fetch('http://127.0.0.1:5000/api/render_mermaid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPngUrl(url);
    } else {
      setPngUrl(null);
    }
    setLoadingPng(false);
  };

  useEffect(() => {
    if (showPngInline && code) {
      fetchPng();
    }
    return () => {
      if (pngUrl) window.URL.revokeObjectURL(pngUrl);
    };
    // eslint-disable-next-line
  }, [showPngInline, code]);

  return (
    <div className="w-full flex flex-col items-center">
      <div
        ref={containerRef}
        className="w-full overflow-x-auto bg-gray-50 rounded p-4 min-h-[300px] flex justify-center items-center"
      />
      {showDownloadPng && (
        <button
          className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-semibold"
          onClick={downloadPng}
        >
          Download as PNG
        </button>
      )}
      {showPngInline && (
        <div className="mt-4">
          {loadingPng && <div>Loading PNG...</div>}
          {pngUrl && <img src={pngUrl} alt="Diagram PNG" className="max-w-full max-h-96 border rounded shadow" />}
        </div>
      )}
    </div>
  );
}

function BacklogStats({ backlog }) {
  if (!Array.isArray(backlog) || backlog.length === 0) {
    return null;
  }

  let epics = 0;
  let features = 0;
  let userStories = 0;

  const countItems = (items) => {
    items.forEach(item => {
      if (item.type === 'Epic') epics++;
      else if (item.type === 'Feature') features++;
      else if (item.type === 'User Story') userStories++;

      if (item.children && item.children.length > 0) {
        countItems(item.children);
      }
    });
  };

  countItems(backlog);
  const total = epics + features + userStories;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-blue-600">{total}</div>
        <div className="text-sm text-blue-700 font-medium">Total Items</div>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-purple-600">{epics}</div>
        <div className="text-sm text-purple-700 font-medium">Epics</div>
      </div>
      <div className="bg-sky-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-sky-600">{features}</div>
        <div className="text-sm text-sky-700 font-medium">Features</div>
      </div>
      <div className="bg-emerald-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-emerald-600">{userStories}</div>
        <div className="text-sm text-emerald-700 font-medium">User Stories</div>
      </div>
    </div>
  );
}

function BacklogCards({ backlog }) {
  const [expanded, setExpanded] = useState({});
  if (!Array.isArray(backlog) || backlog.length === 0) {
    return <div className="p-4 text-gray-500 text-center">No backlog items were generated.</div>;
  }

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderTree = (items, level = 0) => (
    <ul className={level > 0 ? "ml-4 pl-4 border-l-2 border-blue-200" : ""}>
      {items.map(item => (
        <li key={item.id} className="mb-2">
          <div className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100">
            {item.children && item.children.length > 0 ? (
              <button onClick={() => toggle(item.id)} className="focus:outline-none">
                {expanded[item.id] ? <ChevronDown className="w-4 h-4 text-blue-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
              </button>
            ) : <span className="w-4 h-4" />}
            <span className={`font-semibold w-20 text-center text-xs py-1 rounded-full ${
                item.type === 'Epic' ? 'bg-purple-100 text-purple-700' :
                item.type === 'Feature' ? 'bg-sky-100 text-sky-700' :
                'bg-emerald-100 text-emerald-700'
            }`}>{item.type}</span>
            <span className="text-gray-800 flex-1">{item.title}</span>
          </div>
          {item.children && item.children.length > 0 && expanded[item.id] && renderTree(item.children, level + 1)}
        </li>
      ))}
    </ul>
  );
  return <div className="bg-blue-50 rounded-lg p-4 shadow-inner">{renderTree(backlog)}</div>;
}

const Sidebar = ({ activeSection, setActiveSection, documents, pastAnalyses, selectedDocument, setSelectedDocument, selectedAnalysis, setSelectedAnalysis }) => (
  <aside className="h-screen w-64 bg-white border-r flex-col justify-between fixed left-0 top-0 z-20 hidden md:flex">
    <div>
      <div className="flex items-center gap-3 px-6 py-6 border-b">
        <FileText className="w-8 h-8 text-blue-600" />
        <span className="font-extrabold text-xl text-gray-800 tracking-tight">BA Agent</span>
      </div>
      <nav className="mt-6 flex flex-col gap-2 px-4">
        <button 
          onClick={() => setActiveSection('new-analysis')}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-base transition-all w-full text-left ${
            activeSection === 'new-analysis' ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="text-lg">＋</span> New Analysis
        </button>
        <button 
          onClick={() => setActiveSection('documents')}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all w-full text-left ${
            activeSection === 'documents' ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Folder className="w-5 h-5" /> Documents ({documents.length})
        </button>
        <button 
          onClick={() => setActiveSection('past-analyses')}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all w-full text-left ${
            activeSection === 'past-analyses' ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-5 h-5" /> Past Analyses ({pastAnalyses.length})
        </button>
      </nav>
    </div>
    <div className="mb-6 px-4">
      <button className="flex items-center gap-2 text-gray-400 text-sm hover:text-blue-600 transition-all w-full text-left">
        <Settings className="w-4 h-4" /> Admin Portal
      </button>
    </div>
  </aside>
);

const Capabilities = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
        <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
        <div className="font-bold text-gray-800 mb-1">Easy Input</div>
        <div className="text-gray-500 text-sm text-center">Upload BRD documents or paste text directly.</div>
      </div>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
        <Search className="w-8 h-8 text-blue-500 mb-2" />
        <div className="font-bold text-gray-800 mb-1">Intelligent Extraction</div>
        <div className="text-gray-500 text-sm text-center">Extracts key text from your documents.</div>
      </div>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
        <ListCollapse className="w-8 h-8 text-blue-500 mb-2" />
        <div className="font-bold text-gray-800 mb-1">Automated TRD</div>
        <div className="text-gray-500 text-sm text-center">Generates Technical Requirements Document.</div>
      </div>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
        <SendIcon className="w-8 h-8 text-blue-500 mb-2" />
        <div className="font-bold text-gray-800 mb-1">Seamless Integration</div>
        <div className="text-gray-500 text-sm text-center">Streamlines TRD approval and DevOps sync.</div>
      </div>
    </div>
  );

const DocumentsSection = ({ documents, selectedDocument, setSelectedDocument, setDocuments, setNotification }) => {
  const [uploading, setUploading] = useState(false);

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://127.0.0.1:5000/api/upload_document', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const newDoc = await response.json();
        setDocuments(prev => [...prev, newDoc]);
        setNotification({ message: 'Document uploaded successfully!', type: 'success' });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setNotification({ message: 'Failed to upload document', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Documents Library</h2>
        <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-all">
          {uploading ? 'Uploading...' : 'Upload Document'}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx"
            onChange={handleDocumentUpload}
            disabled={uploading}
          />
        </label>
      </div>
      
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No documents yet</h3>
          <p className="text-gray-500">Upload your first document to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDocument(doc)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedDocument?.id === doc.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 truncate">{doc.name}</h4>
                  <p className="text-sm text-gray-500">{doc.uploadDate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PastAnalysesSection = ({ pastAnalyses, selectedAnalysis, setSelectedAnalysis }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Past Analyses</h2>
      
      {pastAnalyses.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No past analyses</h3>
          <p className="text-gray-500">Your completed analyses will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pastAnalyses.map((analysis) => (
            <div
              key={analysis.id}
              onClick={() => setSelectedAnalysis(analysis)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedAnalysis?.id === analysis.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">{analysis.title}</h4>
                  <p className="text-sm text-gray-500">{analysis.date}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    analysis.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {analysis.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [requirements, setRequirements] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [step, setStep] = useState('upload'); // 'upload' | 'analyzing' | 'results'
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('TRD');
  // New: Track backend progress step
  const [progressStep, setProgressStep] = useState('Upload'); // 'Upload' | 'Extracting' | 'Planning' | 'Generating Docs' | 'Done'
  const [dragActive, setDragActive] = useState(false); // highlight drop area
  const [fileError, setFileError] = useState(''); // file type error
  const [copyStatus, setCopyStatus] = useState('');
  const [imageModal, setImageModal] = useState({ open: false, src: '', alt: '' });
  const modalRef = useRef(null);
  
  // New: Sidebar navigation state
  const [activeSection, setActiveSection] = useState('new-analysis'); // 'new-analysis' | 'documents' | 'past-analyses'
  const [documents, setDocuments] = useState([]);
  const [pastAnalyses, setPastAnalyses] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  // Modal close handler
  useEffect(() => {
    if (!imageModal.open) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') setImageModal({ open: false, src: '', alt: '' }); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [imageModal.open]);

  // Trap focus in modal when open
  useEffect(() => {
    if (!imageModal.open || !modalRef.current) return;
    const modalElement = modalRef.current; // Copy ref to variable
    const focusable = modalElement.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();
    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    modalElement.addEventListener('keydown', handleTab);
    return () => modalElement && modalElement.removeEventListener('keydown', handleTab);
  }, [imageModal.open]);

  // Load documents and past analyses on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load documents
        const docsResponse = await fetch('http://127.0.0.1:5000/api/documents');
        if (docsResponse.ok) {
          const docsData = await docsResponse.json();
          setDocuments(docsData);
        }
        
        // Load past analyses
        const analysesResponse = await fetch('http://127.0.0.1:5000/api/analyses');
        if (analysesResponse.ok) {
          const analysesData = await analysesResponse.json();
          setPastAnalyses(analysesData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && !/\.(pdf|docx)$/i.test(f.name)) {
      setFileError('Only PDF or DOCX files are supported.');
      setFile(null);
    } else {
      setFileError('');
      setFile(f);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f && !/\.(pdf|docx)$/i.test(f.name)) {
      setFileError('Only PDF or DOCX files are supported.');
      setFile(null);
    } else {
      setFileError('');
      setFile(f);
    }
  };
  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragActive(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !requirements) {
        setNotification({ message: 'Please upload a file or paste requirements.', type: 'error' });
        return;
    }
    setNotification({ message: 'Analysis started!', type: 'success' });
    setStep('analyzing');
    setResults(null);
    setProgressStep('Extracting');
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        const blob = new Blob([requirements], { type: 'text/plain' });
        formData.append('file', blob, 'requirements.txt');
      }
      // Simulate progress for demo (remove in production)
      setProgressStep('Extracting');
      // Wait a moment to show extracting (simulate)
      await new Promise(res => setTimeout(res, 500));
      setProgressStep('Planning');
      await new Promise(res => setTimeout(res, 500));
      setProgressStep('Generating Docs');
      // Actual fetch
      const response = await fetch('http://127.0.0.1:5000/api/generate', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setResults(data);
        setStep('results');
        setProgressStep('Done');
        setNotification({ message: 'Analysis complete!', type: 'success' });
      } else {
        throw new Error(data.error || 'Analysis failed.');
      }
    } catch (err) {
      setNotification({ message: err.message || 'Network or server error.', type: 'error' });
      setStep('upload');
      setProgressStep('Upload');
    }
  };

  const handleDownloadAll = () => {
    if (!results) return;
    // Download TRD as DOCX
    const trdBlob = new Blob([results.trd || ''], { type: 'text/markdown' });
    const trdUrl = URL.createObjectURL(trdBlob);
    const trdLink = document.createElement('a');
    trdLink.href = trdUrl;
    trdLink.download = 'Technical_Requirements_Document.docx';
    trdLink.click();
    URL.revokeObjectURL(trdUrl);

    // Download HLD and LLD as Mermaid
    const hldBlob = new Blob([results.hld || ''], { type: 'text/plain' });
    const hldUrl = URL.createObjectURL(hldBlob);
    const hldLink = document.createElement('a');
    hldLink.href = hldUrl;
    hldLink.download = 'High_Level_Diagram.mmd';
    hldLink.click();
    URL.revokeObjectURL(hldUrl);

    const lldBlob = new Blob([results.lld || ''], { type: 'text/plain' });
    const lldUrl = URL.createObjectURL(lldBlob);
    const lldLink = document.createElement('a');
    lldLink.href = lldUrl;
    lldLink.download = 'Low_Level_Diagram.mmd';
    lldLink.click();
    URL.revokeObjectURL(lldUrl);

    // Download Backlog as JSON
    const backlogBlob = new Blob([JSON.stringify(results.backlog, null, 2)], { type: 'application/json' });
    const backlogUrl = URL.createObjectURL(backlogBlob);
    const backlogLink = document.createElement('a');
    backlogLink.href = backlogUrl;
    backlogLink.download = 'Project_Backlog.json';
    backlogLink.click();
    URL.revokeObjectURL(backlogUrl);
  };

  const handleSendForApproval = async () => {
    if (!results) return;
    try {
      const response = await fetch('http://127.0.0.1:5000/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: results }),
      });
      const data = await response.json();
      if (response.ok) {
        setNotification({ message: 'Approval request sent!', type: 'success' });
      } else {
        throw new Error(data.error || 'Approval request failed.');
      }
    } catch (err) {
      setNotification({ message: err.message || 'Network or server error.', type: 'error' });
    }
  };

  // Helper: Copy to clipboard
  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(`${label} copied!`);
      setTimeout(() => setCopyStatus(''), 1500);
    } catch {
      setCopyStatus('Copy failed');
      setTimeout(() => setCopyStatus(''), 1500);
    }
  };

  // Helper: Download as DOCX
  const downloadAsDocx = async (markdownContent, filename) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/convert_to_docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: markdownContent }),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to convert to DOCX');
      }
    } catch (error) {
      console.error('Error converting to DOCX:', error);
      alert('Failed to convert to DOCX');
    }
  };

  // Enhanced Stepper with progress
  const ProgressStepper = () => {
    const steps = [
      { key: 'Upload', label: 'Upload' },
      { key: 'Extracting', label: 'Extracting' },
      { key: 'Planning', label: 'Planning' },
      { key: 'Generating Docs', label: 'Generating Docs' },
      { key: 'Done', label: 'Done' },
    ];
    const currentIdx = steps.findIndex(s => s.key === progressStep);
    return (
      <div className="flex items-center justify-center gap-4 mb-8">
        {steps.map((s, idx) => (
          <React.Fragment key={s.key}>
            <div className={`flex flex-col items-center ${idx === currentIdx ? 'text-blue-600' : idx < currentIdx ? 'text-green-500' : 'text-gray-400'}`}> 
              <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${idx === currentIdx ? 'border-blue-600 bg-blue-50' : idx < currentIdx ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}`}>{idx + 1}</div>
              <span className="text-xs mt-1 font-semibold">{s.label}</span>
            </div>
            {idx < steps.length - 1 && <div className={`w-8 h-1 rounded ${idx < currentIdx ? 'bg-green-300' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const ResultsTabs = () => {
    if (!results) return null;
    const extractMermaid = (str) => (str || '').replace(/```mermaid\n|```/g, '');
    const download = (data, filename, type) => {
      const blob = new Blob([data], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    };
    const downloadJson = (obj, filename) => download(JSON.stringify(obj, null, 2), filename, 'application/json');
    const tabs = [
      { key: 'TRD', label: 'Tech Docs', content: (
        <div className="w-full">
          <div className="flex gap-2 mb-2">
            <button onClick={() => downloadAsDocx(results.trd, 'Technical_Requirements_Document.docx')} className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-semibold">Download as DOCX</button>
            <button onClick={() => download(results.trd, 'Technical_Requirements_Document.md', 'text/markdown')} className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-semibold">Download as MD</button>
            <button onClick={() => handleCopy(results.trd, 'TRD')} className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-semibold flex items-center gap-1"><Copy className="w-4 h-4" />Copy</button>
          </div>
          <MarkdownRenderer markdown={results.trd} />
        </div>
      ) },
      { key: 'HLD', label: 'HLD', content: (
        <div className="w-full">
          <div className="flex gap-2 mb-2">
            <button onClick={() => download(extractMermaid(results.hld), 'High_Level_Diagram.mmd', 'text/plain')} className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-semibold">Download Mermaid</button>
            <button onClick={() => handleCopy(extractMermaid(results.hld), 'HLD Mermaid')} className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-semibold flex items-center gap-1"><Copy className="w-4 h-4" />Copy</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Mermaid Diagram</h3>
              <MermaidDiagram code={extractMermaid(results.hld)} id="hld-diagram" showDownloadPng={true} showPngInline={false} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">PNG Version</h3>
              <MermaidDiagram code={extractMermaid(results.hld)} id="hld-png" showDownloadPng={false} showPngInline={true} />
            </div>
          </div>
        </div>
      ) },
      { key: 'LLD', label: 'LLD', content: (
        <div className="w-full">
          <div className="flex gap-2 mb-2">
            <button onClick={() => download(extractMermaid(results.lld), 'Low_Level_Diagram.mmd', 'text/plain')} className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-semibold">Download Mermaid</button>
            <button onClick={() => handleCopy(extractMermaid(results.lld), 'LLD Mermaid')} className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-semibold flex items-center gap-1"><Copy className="w-4 h-4" />Copy</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Mermaid Diagram</h3>
              <MermaidDiagram code={extractMermaid(results.lld)} id="lld-diagram" showDownloadPng={true} showPngInline={false} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">PNG Version</h3>
              <MermaidDiagram code={extractMermaid(results.lld)} id="lld-png" showDownloadPng={false} showPngInline={true} />
            </div>
          </div>
        </div>
      ) },
      { key: 'Backlog', label: 'Backlog', content: (
        <div className="w-full">
          <div className="flex gap-2 mb-2">
            <button onClick={() => downloadJson(results.backlog, 'Project_Backlog.json')} className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-semibold">Download</button>
            <button onClick={() => handleCopy(JSON.stringify(results.backlog, null, 2), 'Backlog JSON')} className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-semibold flex items-center gap-1"><Copy className="w-4 h-4" />Copy</button>
          </div>
          <BacklogStats backlog={results.backlog} />
          <BacklogCards backlog={results.backlog} />
        </div>
      ) },
      { key: 'Images', label: 'Images', content: (
        <div className="flex flex-wrap gap-4 p-4">
          {results.images && results.images.length > 0 ? results.images.map((img, idx) => (
            <img
              key={idx}
              src={`data:${img.mime_type};base64,${img.data}`}
              alt={`doc-img-${idx}`}
              className="max-w-xs max-h-48 rounded shadow cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setImageModal({ open: true, src: `data:${img.mime_type};base64,${img.data}`, alt: `doc-img-${idx}` })}
            />
          )) : <div className="text-gray-500">No images extracted.</div>}
        </div>
      ) },
    ];
    return (
      <div className="w-full flex flex-col items-center">
        <div className="flex gap-2 mb-4" role="tablist" aria-label="Results Tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              aria-controls={`tabpanel-${tab.key}`}
              id={`tab-${tab.key}`}
              tabIndex={0}
              className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-all ${activeTab === tab.key ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setActiveTab(tab.key)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setActiveTab(tab.key); }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-b-xl shadow p-6 min-h-[200px] w-full max-w-4xl flex flex-col items-center" role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}> 
          {tabs.find(tab => tab.key === activeTab)?.content}
        </div>
        {copyStatus && (
          <div className="fixed bottom-8 right-8 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50 text-sm font-semibold animate-bounce" role="status" aria-live="polite">{copyStatus}</div>
        )}
      </div>
    );
  };

  // Notification component
  const Notification = () => (
    notification.message && (
      <div
        className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-lg shadow-lg text-base font-medium transition-all
          ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-300' : 'bg-red-50 text-red-800 border border-red-300'}`}
        role="alert"
        aria-live="assertive"
      >
        {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        <span>{notification.message}</span>
        <button
          className="ml-2 text-lg font-bold text-gray-400 hover:text-gray-700 focus:outline-none"
          aria-label="Dismiss notification"
          onClick={() => setNotification({ message: '', type: '' })}
        >
          ×
        </button>
      </div>
    )
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Notification />
      {/* Image Preview Modal */}
      {imageModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
          onClick={() => setImageModal({ open: false, src: '', alt: '' })}
          aria-modal="true"
          role="dialog"
        >
          <div className="relative" onClick={e => e.stopPropagation()} ref={modalRef} tabIndex={-1}>
            <img src={imageModal.src} alt={imageModal.alt} className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-2xl border-4 border-white" />
            <button
              className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 focus:outline-none"
              onClick={() => setImageModal({ open: false, src: '', alt: '' })}
              aria-label="Close image preview"
            >
              <XCircle className="w-7 h-7 text-gray-700" />
            </button>
          </div>
        </div>
      )}
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        documents={documents}
        pastAnalyses={pastAnalyses}
        selectedDocument={selectedDocument}
        setSelectedDocument={setSelectedDocument}
        selectedAnalysis={selectedAnalysis}
        setSelectedAnalysis={setSelectedAnalysis}
      />
      <div className="ml-0 md:ml-64">
        <header className="flex items-center justify-between px-8 py-6 border-b bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-600" />
            <span className="font-extrabold text-2xl text-gray-800 tracking-tight">Business Analyst Agent Workspace</span>
          </div>
          <div className="flex items-center gap-4">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-blue-200 object-cover" />
            <span className="text-gray-700 font-medium">User Avatar</span>
          </div>
        </header>
        <main className="flex flex-col md:flex-row gap-8 px-8 py-10 max-w-7xl mx-auto">
          {activeSection === 'new-analysis' && (
            <section className={`flex-1 flex flex-col gap-6 ${step === 'results' ? 'w-full' : ''}`}>
              {/* Use new ProgressStepper instead of Stepper */}
              <ProgressStepper />
              {step === 'upload' && (
                <form onSubmit={handleSubmit} className="max-w-xl bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6" aria-label="Requirements Upload Form">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <span className="font-bold text-lg text-gray-800">Business Analyst Agent<sup className="ml-1 text-xs font-normal">TM</sup></span>
                  </div>
                  <label className="font-semibold text-gray-700 text-sm" htmlFor="requirements-textarea">Paste Business Requirements (BRD)</label>
                  <textarea
                    id="requirements-textarea"
                    className="w-full min-h-[120px] border border-gray-200 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-vertical"
                    placeholder="Or paste your requirements here..."
                    value={requirements}
                    onChange={e => setRequirements(e.target.value)}
                    aria-label="Paste requirements"
                  />
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                    <span className="flex-1 border-t" />
                    OR
                    <span className="flex-1 border-t" />
                  </div>
                  <div
                    className={`w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${dragActive ? 'border-blue-500 bg-blue-100' : 'border-blue-200 bg-blue-50 hover:bg-blue-100'}`}
                    onClick={() => fileInputRef.current.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    tabIndex={0}
                    aria-label="Upload Requirements Document"
                    role="button"
                  >
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.docx" aria-label="File input" />
                    <div className="flex flex-col items-center justify-center">
                      <UploadCloud className={`mx-auto h-10 w-10 mb-2 ${dragActive ? 'text-blue-500' : 'text-blue-400'}`} />
                      <div className="text-blue-700 font-semibold">Upload Requirements Document</div>
                      {file && (
                        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-green-700 font-medium">
                          {file.name.endsWith('.pdf') ? <FileText className="w-4 h-4 text-red-500" /> : <FileText className="w-4 h-4 text-blue-700" />} {file.name} <span className="ml-2 text-gray-400">({file.type || 'Unknown type'})</span>
                        </div>
                      )}
                      {fileError && <div className="mt-2 text-xs text-red-600 font-semibold" role="alert">{fileError}</div>}
                    </div>
                  </div>
                  <label className="font-semibold text-gray-700 text-sm" htmlFor="approver-email">Approver Email Address(es)</label>
                  <input
                    id="approver-email"
                    type="email"
                    className="w-full border border-gray-200 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    placeholder="e.g., approver1@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    aria-label="Approver Email Address"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 mt-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-lg"
                    aria-label="Execute Analysis"
                  >
                    Execute Analysis
                  </button>
                  {notification.message && (
                    <div className={`mt-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow ${notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`} role="alert" aria-live="assertive">
                      {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} {notification.message}
                    </div>
                  )}
                </form>
              )}
              {step === 'analyzing' && (
                <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-2xl shadow-xl p-8">
                  <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  <div className="font-bold text-lg text-blue-700 mb-2">Analyzing your requirements...</div>
                  <div className="text-gray-500">Please wait while we process your document.</div>
                </div>
              )}
              {step === 'results' && (
                <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-2xl shadow-xl p-8 w-full">
                  <div className="w-full flex justify-end gap-4 mb-4">
                    <button
                      className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg shadow hover:bg-gray-700 transition-all"
                      onClick={handleDownloadAll}
                    >
                      Download All
                    </button>
                    <button
                      className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 transition-all"
                      onClick={handleSendForApproval}
                    >
                      Send for Approval
                    </button>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                  <div className="font-bold text-lg text-green-700 mb-2">Analysis Complete!</div>
                  <div className="text-gray-500 mb-4">Your business requirements have been analyzed. See the generated artifacts below.</div>
                  <ResultsTabs />
                  <button
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-all"
                    onClick={() => { setStep('upload'); setResults(null); setActiveTab('TRD'); setFile(null); }}
                  >
                    Start New Analysis
                  </button>
                </div>
              )}
            </section>
          )}
          
          {activeSection === 'documents' && (
            <section className="flex-1">
              <DocumentsSection 
                documents={documents} 
                selectedDocument={selectedDocument} 
                setSelectedDocument={setSelectedDocument}
                setDocuments={setDocuments}
                setNotification={setNotification}
              />
            </section>
          )}
          
          {activeSection === 'past-analyses' && (
            <section className="flex-1">
              <PastAnalysesSection 
                pastAnalyses={pastAnalyses} 
                selectedAnalysis={selectedAnalysis} 
                setSelectedAnalysis={setSelectedAnalysis} 
              />
            </section>
          )}
          
          {activeSection === 'new-analysis' && step !== 'results' && (
            <section className="flex-1 flex flex-col gap-6">
              <div className="mb-4">
                <div className="font-bold text-xl text-gray-800 mb-2">Business Analyst Agent Capabilities</div>
                <Capabilities />
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
