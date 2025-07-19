import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, ListCollapse, User, Folder, Clock, Settings, ArrowUpTray, UserCircle, CheckCircle, XCircle } from 'lucide-react';

const Sidebar = () => (
  <aside className="h-screen w-64 bg-white border-r flex flex-col justify-between fixed left-0 top-0 z-20">
    <div>
      <div className="flex items-center gap-3 px-6 py-6 border-b">
        <FileText className="w-8 h-8 text-blue-600" />
        <span className="font-extrabold text-xl text-gray-800 tracking-tight">BA Agent</span>
      </div>
      <nav className="mt-6 flex flex-col gap-2 px-4">
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-700 bg-blue-50 font-semibold text-base hover:bg-blue-100 transition-all">
          <span className="text-lg">＋</span> New Analysis
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 font-medium text-base hover:bg-gray-100 transition-all">
          <Folder className="w-5 h-5" /> Documents
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 font-medium text-base hover:bg-gray-100 transition-all">
          <Clock className="w-5 h-5" /> Past Analyses
        </a>
      </nav>
    </div>
    <div className="mb-6 px-4">
      <a href="#" className="flex items-center gap-2 text-gray-400 text-sm hover:text-blue-600 transition-all">
        <Settings className="w-4 h-4" /> Admin Portal
      </a>
    </div>
  </aside>
);

const Capabilities = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
      <ArrowUpTray className="w-8 h-8 text-blue-500 mb-2" />
      <div className="font-bold text-gray-800 mb-1">Easy Input</div>
      <div className="text-gray-500 text-sm text-center">Upload BRD documents or paste text directly.</div>
    </div>
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
      <SearchIcon className="w-8 h-8 text-blue-500 mb-2" />
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

function SearchIcon(props) {
  return <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
}
function SendIcon(props) {
  return <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;
}

export default function App() {
  const [requirements, setRequirements] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleSubmit = (e) => {
    e.preventDefault();
    setNotification({ message: 'Analysis started!', type: 'success' });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-0 md:ml-64">
        {/* Header */}
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
        {/* Main Content */}
        <main className="flex flex-col md:flex-row gap-8 px-8 py-10 max-w-7xl mx-auto">
          {/* Input Card */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-xl bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-lg text-gray-800">Business Analyst Agent<sup className="ml-1 text-xs font-normal">TM</sup></span>
            </div>
            <label className="font-semibold text-gray-700 text-sm">Paste Business Requirements (BRD)</label>
            <textarea
              className="w-full min-h-[120px] border border-gray-200 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-vertical"
              placeholder="Or paste your requirements here..."
              value={requirements}
              onChange={e => setRequirements(e.target.value)}
            />
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
              <span className="flex-1 border-t" />
              OR
              <span className="flex-1 border-t" />
            </div>
            <div
              className="w-full border-2 border-dashed border-blue-200 rounded-lg p-6 text-center cursor-pointer bg-blue-50 hover:bg-blue-100 transition-all"
              onClick={() => fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.docx"
              />
              <UploadCloud className="mx-auto h-10 w-10 text-blue-400 mb-2" />
              <div className="text-blue-700 font-semibold">Upload Requirements Document</div>
              {file && <div className="mt-2 text-xs text-green-600">{file.name}</div>}
            </div>
            <label className="font-semibold text-gray-700 text-sm">Approver Email Address(es)</label>
            <input
              type="email"
              className="w-full border border-gray-200 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="e.g., approver1@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full py-3 mt-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-lg"
            >
              Execute Analysis
            </button>
            {notification.message && (
              <div className={`mt-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow ${notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} {notification.message}
              </div>
            )}
          </form>
          {/* Capabilities Cards */}
          <section className="flex-1 flex flex-col gap-6">
            <div className="mb-4">
              <div className="font-bold text-xl text-gray-800 mb-2">Business Analyst Agent Capabilities</div>
              <Capabilities />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
