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
      // Axios auto-attaches our JWT from AuthContext defaults
      const response = await axios.post(`${API_BASE}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setIsUploading(false);
      if (onUploadSuccess) {
        // Pass the response data back to the Dashboard to trigger a refresh
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
    <div style={{ marginBottom: '30px' }}>
      <div 
        {...getRootProps()} 
        className="glass-panel"
        style={{ 
          padding: '60px 40px', 
          textAlign: 'center', 
          cursor: isUploading ? 'not-allowed' : 'pointer',
          border: isDragActive ? '2px dashed #8b5cf6' : '2px dashed rgba(255,255,255,0.1)',
          backgroundColor: isDragActive ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.3s ease'
        }}
      >
        <input {...getInputProps()} disabled={isUploading} />
        
        {isUploading ? (
          <div>
            <h3 style={{ color: '#8b5cf6', marginBottom: '10px', fontSize: '1.4rem' }}>Analyzing Document...</h3>
            <p style={{ color: '#94a3b8' }}>Extracting text and chunking content for the AI. Please wait.</p>
          </div>
        ) : isDragActive ? (
          <h3 style={{ color: '#8b5cf6', fontSize: '1.4rem' }}>Drop the PDF here...</h3>
        ) : (
          <div>
            <h3 style={{ marginBottom: '15px', fontSize: '1.4rem', fontWeight: '600' }}>Drag & Drop your Legal PDF</h3>
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>or click to browse files</p>
            <div style={{ marginTop: '20px', display: 'inline-block', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '0.85rem', color: '#cbd5e1' }}>
              Max size: 10MB • Format: PDF only
            </div>
          </div>
        )}
      </div>
      
      {error && <div className="error-message" style={{ marginTop: '15px' }}>{error}</div>}
    </div>
  );
};

export default UploadZone;
