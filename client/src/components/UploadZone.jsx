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
        headers: { 'Content-Type': 'multipart/form-data' }
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
        className={`glass-panel py-15 px-10 text-center transition-all duration-300 border-2 border-dashed
          ${isUploading ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${isDragActive ? 'border-violet-primary bg-violet-primary/10' : 'border-white/10 bg-white/[0.02] hover:border-violet-primary/40 hover:bg-violet-primary/[0.03]'}
        `}
      >
        <input {...getInputProps()} disabled={isUploading} />
        
        {isUploading ? (
          <div>
            <h3 className="text-violet-primary mb-2.5 text-xl font-semibold">Analyzing Document...</h3>
            <p className="text-slate-400">Extracting text and chunking content for the AI. Please wait.</p>
          </div>
        ) : isDragActive ? (
          <h3 className="text-violet-primary text-xl font-semibold">Drop the PDF here...</h3>
        ) : (
          <div>
            <h3 className="mb-4 text-xl font-semibold text-slate-100">Drag & Drop your Legal PDF</h3>
            <p className="text-slate-400 text-base">or click to browse files</p>
            <div className="mt-5 inline-block py-2 px-4 bg-white/[0.05] rounded-full text-[0.85rem] text-slate-300">
              Max size: 10MB • Format: PDF only
            </div>
          </div>
        )}
      </div>
      
      {error && <div className="error-message mt-4">{error}</div>}
    </div>
  );
};

export default UploadZone;
