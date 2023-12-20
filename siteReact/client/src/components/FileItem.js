// FileItem.js
import React from 'react';
import { saveAs } from 'file-saver';

const FileItem = ({ item, saveAs, handleDelete }) => {
    return (
        <div>
            {item.file.type.startsWith('image/') ? (
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <img src={item.previewUrl} alt={item.file.name} style={{ maxWidth: '100px', maxHeight: '100px' }} />
                    <p style={{ marginLeft: '10px', cursor: 'pointer' }} onClick={() => saveAs(item.file, item.file.name)}>
                        {item.file.name}
                    </p>
                    <button style={{ width: '40px', height: '40px' }} onClick={() => handleDelete(item)}>
                        🗑️
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <p style={{ marginLeft: '10px', cursor: 'pointer' }} onClick={() => saveAs(item.file, item.file.name)}>
                        {item.file.name}
                    </p>
                    <button style={{ width: '40px', height: '40px' }} onClick={() => handleDelete(item)}>
                        🗑️
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileItem;
