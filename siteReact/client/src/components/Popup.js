// Popup.js
import React from 'react';

const Popup = ({ isOpen, onClose, folderItems, selectedFolder, handleSaveAs, handleDelete }) => {
    return (
        <div>
            {isOpen && (
                <div>
                    {/* ... Votre contenu de la popup */}
                    <div className="popup-body">
                        {folderItems.map((item, index) => (
                            <div key={index}>
                                {/* ... Affichage des éléments du dossier */}
                            </div>
                        ))}
                    </div>
                    {/* ... Autres parties de la popup */}
                </div>
            )}
        </div>
    );
};

export default Popup;
