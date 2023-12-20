// FolderItem.js
import React from 'react';

const FolderItem = ({ item, setPopupOpen, setSelectedFolder, handleDelete }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <span
                role="img"
                aria-label="Folder"
                style={{ cursor: 'pointer', marginRight: '10px' }}
                onClick={() => {
                    setPopupOpen(true);
                    setSelectedFolder(item);
                }}
            >
                📁
            </span>
            <p style={{ marginLeft: '10px', cursor: 'pointer' }}>{item.name}</p>
            <button style={{ width: '40px', height: '40px' }} onClick={() => handleDelete(item)}>
                🗑️
            </button>
        </div>
    );
};

export default FolderItem;
