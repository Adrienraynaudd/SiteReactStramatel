// FileFromDb.js
import React from 'react';

const FileFromDb = ({ file, index, previewUrls, handleDownload, handleDelete }) => {
    return (
        <li key={index}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                {file.mimetype.startsWith('image/') && previewUrls[index] && (
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <img
                            src={previewUrls[index]}
                            alt={file.filename}
                            style={{ maxWidth: '100px', maxHeight: '100px' }}
                            onError={(e) => console.log('Erreur de chargement de l\'image :', file.originalname, e)}
                        />
                    </div>
                )}
                <p style={{ cursor: 'pointer' }} onClick={() => handleDownload(file)}>
                    {file.originalname}
                </p>
                <button style={{ width: '40px', height: '40px' }} onClick={() => handleDelete(file)}>
                    🗑️
                </button>
            </div>
        </li>
    );
};

export default FileFromDb;
