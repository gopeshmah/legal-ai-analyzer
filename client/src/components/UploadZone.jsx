import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import API_BASE from '../config/api';

const UploadZone = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      setError('Please upload a valid PDF document under 10MB.');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setError('');
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000 // 5 minute timeout for large PDFs (embedding can take a while)
      });
      
      setIsUploading(false);
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      setError(err.response?.data?.error || 'Failed to upload document');
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  return (
    <div className="mb-7">
      <div 
        {...getRootProps()} 
        className={`relative glass-panel py-16 px-10 text-center transition-all duration-300 border-2 overflow-hidden group
          ${isUploading ? 'cursor-not-allowed border-violet-primary/30' : 'cursor-pointer border-dashed'}
          ${isDragActive ? 'border-violet-primary bg-violet-primary/10 shadow-[0_0_30px_rgba(139,92,246,0.2)]' : 'dark:border-white/10 border-slate-300 dark:bg-white/[0.01] bg-slate-100/50 hover:border-violet-primary/50 dark:hover:bg-violet-primary/[0.04] hover:bg-violet-primary/[0.08]'}
        `}
      >
        <input {...getInputProps()} disabled={isUploading} />
        
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r from-violet-primary/0 via-violet-primary/5 to-violet-primary/0 transition-opacity duration-700 ${isUploading || isDragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ animation: 'gradient-shift 3s ease infinite', backgroundSize: '200% 200%' }}></div>

        <div className="relative z-10 flex flex-col items-center justify-center">
          {isUploading ? (
            <>
              <div className="w-16 h-16 rounded-full bg-violet-primary/20 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(139,92,246,0.4)] animate-pulse">
                <svg className="w-8 h-8 text-violet-600 dark:text-violet-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
              </div>
              <h3 className="text-violet-600 dark:text-violet-300 mb-2.5 text-xl font-bold tracking-wide">Analyzing Document...</h3>
              <p className="dark:text-slate-400 text-slate-500 text-[0.95rem]">Extracting text and chunking content for the AI. Please wait.</p>
            </>
          ) : isDragActive ? (
            <>
              <div className="w-20 h-20 rounded-full bg-violet-primary/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(139,92,246,0.6)] transform scale-110 transition-transform">
                <svg className="w-10 h-10 text-violet-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              </div>
              <h3 className="dark:text-white text-slate-800 text-2xl font-bold">Drop the PDF here!</h3>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full dark:bg-white/[0.05] bg-slate-200 border dark:border-white/10 border-slate-300 group-hover:bg-violet-primary/20 group-hover:border-violet-primary/30 flex items-center justify-center mb-5 transition-all duration-300 group-hover:-translate-y-2">
                <svg className="w-8 h-8 dark:text-slate-400 text-slate-500 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              </div>
              <h3 className="mb-3 text-2xl font-bold dark:text-slate-100 text-slate-800 tracking-tight">Drag & Drop your Legal PDF</h3>
              <p className="dark:text-slate-400 text-slate-500 text-base mb-6">or click to browse files</p>
              <div className="inline-flex items-center gap-2 py-2 px-5 dark:bg-black/40 bg-white border dark:border-white/5 border-slate-200 rounded-full text-[0.85rem] dark:text-slate-300 text-slate-600 font-medium shadow-sm">
                <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Max size: 10MB <span className="dark:text-white/20 text-slate-300 mx-1">|</span> Format: PDF only
              </div>
            </>
          )}
        </div>
      </div>
      
      {error && <div className="error-message mt-4">{error}</div>}
    </div>
  );
};

export default UploadZone;
