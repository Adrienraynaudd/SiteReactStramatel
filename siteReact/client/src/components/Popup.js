// Popup.js
import React from 'react';

const Popup = ({ isPopupOpen, setPopupOpen, selectedFolder, folderItems, saveAs, handleDelete }) => {
    return (
        isPopupOpen && (
            <div>
                <div className="overlay" onClick={() => setPopupOpen(false)}></div>
                <div className="popup-container">
                    <div className="popup-content">
                        <div className="popup-header">
                            <h2>Fichier du dossier {selectedFolder && selectedFolder.name}</h2>
                        </div>
                        <div className="popup-body">
                            {Array.isArray(folderItems.folderItems) && folderItems.folderItems.map((item, index) => (
                                <div key={index}>
                                    {item.isDirectory ? (
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <span>📁</span>
                                            <p style={{ marginLeft: '10px', cursor: 'pointer' }} onClick={() => saveAs(item, item.name)}>
                                                {item.name}
                                            </p>
                                            <button style={{ width: '40px', height: '40px' }} onClick={() => handleDelete(item)}>🗑️</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            {item.name && (item.name.endsWith('.png') || (item.name.endsWith('.gif')) ? (
                                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>

                                                    <p style={{ marginLeft: '10px', cursor: 'pointer' }} onClick={() => saveAs(item, item.name)}>
                                                        {item.name}
                                                    </p>
                                                    <button style={{ width: '40px', height: '40px' }} onClick={() => handleDelete(item)}>🗑️</button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                    <p style={{ marginLeft: '10px', cursor: 'pointer' }} onClick={() => saveAs(item, item.name)}>
                                                        {item.name}
                                                    </p>
                                                    <button style={{ width: '40px', height: '40px' }} onClick={() => handleDelete(item)}>🗑️</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="popup-footer">
                            <button className="popup-close-btn" onClick={() => setPopupOpen(false)}>
                                Fermer la pop-up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default Popup;
