// FileFromDb.js
import React from 'react';

const FileFromDb = ({ userRoles,files, index, previewUrls, handleDownload, handleDelete, selectedCompany }) => {
    if (!files || !files.length) {
        return null;
    }

    return (
        <li key={index}>
            {(selectedCompany === files[0].visibility || selectedCompany === "All") && (
                <div>
                    {files[0].folderName && files[0].folderName !== "file" && (
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <span role="img" aria-label="Folder" style={{ marginRight: '8px' }}>
                                📁
                            </span>
                            <p>{files[0].folderName}</p>
                        </div>
                    )}

                    {files.map((file, fileIndex) => (
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} key={fileIndex}>
                            {file.mimetype.startsWith('image/') && previewUrls[fileIndex] && (
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <img
                                        src={previewUrls[fileIndex]}
                                        alt={file.filename}
                                        style={{ maxWidth: '100px', maxHeight: '100px' }}
                                        onError={(e) => console.log('Erreur de chargement de l\'image :', file.originalname, e)}
                                    />
                                </div>
                            )}
                            <p style={{ cursor: 'pointer' }} onClick={() => handleDownload(file)}>
                                {file.originalname}
                            </p>
                            {(userRoles.includes('Stramatel') || userRoles.includes('admin')) && (
                            <button style={{ width: '40px', height: '40px' }} onClick={() => { handleDelete(file); }}>
                                🗑️
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </li>

    );
};


export default FileFromDb;
