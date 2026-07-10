import React, { useState } from 'react';
import { storage, APPWRITE_STORAGE_BUCKET_ID } from '../../lib/appwrite';
import { Loader2, FileText, CheckCircle, Upload } from 'lucide-react';

import './ManageCV.css';

export default function ManageCV() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const CV_FILE_ID = 'my-cv-pdf';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== 'application/pdf') {
                setErrorMessage('Please select a valid PDF file.');
                setFile(null);
            } else {
                setFile(selectedFile);
                setErrorMessage(null);
                setSuccessMessage(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setErrorMessage('Please select a file to upload.');
            return;
        }

        setUploading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            // Check if file already exists and delete it
            try {
                await storage.getFile(APPWRITE_STORAGE_BUCKET_ID, CV_FILE_ID);
                await storage.deleteFile(APPWRITE_STORAGE_BUCKET_ID, CV_FILE_ID);
            } catch (err: any) {
                // Ignore error if file doesn't exist yet (404)
                if (err.code !== 404) {
                    throw err;
                }
            }

            // Upload new file with fixed ID
            await storage.createFile(
                APPWRITE_STORAGE_BUCKET_ID,
                CV_FILE_ID,
                file
            );

            setSuccessMessage('CV successfully updated!');
            setFile(null);
            // Reset file input
            const fileInput = document.getElementById('cv-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (err: any) {
            console.error('Error uploading CV:', err);
            setErrorMessage(err?.message || 'An error occurred while uploading the CV.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="manage-cv-page">
            <div className="page-header-actions" style={{ marginBottom: '24px' }}>
                <p className="page-subtitle">Upload and manage your Resume/CV shown on the public site.</p>
            </div>

            {errorMessage && <div className="error-banner">{errorMessage}</div>}
            {successMessage && (
                <div className="error-banner" style={{ background: 'rgba(34, 197, 94, 0.08)', borderColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={18} />
                        {successMessage}
                    </div>
                </div>
            )}

            <div className="cv-upload-card">
                <h2>Update Resume (PDF)</h2>
                
                <div className="cv-current-status">
                    <FileText size={24} className="status-icon" />
                    <div className="status-text">
                        Current CV ID: <strong>{CV_FILE_ID}</strong><br />
                        <span style={{ fontSize: '12px', opacity: 0.8 }}>This is the file that users will download from your Resume page.</span>
                    </div>
                </div>

                <div className="upload-form-group">
                    <label htmlFor="cv-upload">Select New CV (.pdf)</label>
                    <input
                        type="file"
                        id="cv-upload"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </div>

                <div className="action-footer">
                    <button
                        className="btn-submit"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="btn-spinner" size={16} />
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Upload size={16} />
                                <span>Upload & Replace CV</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
