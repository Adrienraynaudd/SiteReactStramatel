import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { handleUpload, handleDownload, handlePreview } from '../fileFunctions';
import axios from 'axios';
import '../styles/PopUp.css';
import Popup from '../Popup';
const Home = () => {
    const [userRoles, setUserRoles] = useState([]);
    const [draggedItems, setDraggedItems] = useState([]);
    const [files, setFiles] = useState([]);
    const [ID, setID] = useState('');
    const [Name, setName] = useState('');
    const [previewUrls, setPreviewUrls] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('All');
    const [companyOptions, setCompanyOptions] = useState([]);
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [folderItems, setFolderItems] = useState([]);
    useEffect(() => {
        const username = localStorage.getItem('loggedInUser');

        fetch(`http://localhost:5000/getUserRole/${username}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Reponse non OK: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setUserRoles(data.roles);
            })
            .catch(error => console.error('Erreur lors de la recuperation du role :', error));

        fetch('http://localhost:5000/getFiles')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Réponse non OK: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setFiles(data.files);
            })
            .catch(error => console.error('Erreur lors de la recuperation des fichiers:', error));
        fetch('http://localhost:5000/getCompanies')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Réponse non OK: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setCompanyOptions(data.companies);
            })
            .catch(error => console.error('Erreur lors de la récupération des entreprises:', error));
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (isPopupOpen && selectedFolder && selectedFolder.isDirectory) {
                try {
                    const folderReader = selectedFolder.createReader();
                    const items = await readFolder(folderReader);
                    setFolderItems(items);;
                } catch (error) {
                    console.error("Erreur lors de la récupération des données du dossier :", error);
                }
            }
        };

        fetchData();
    }, [isPopupOpen, selectedFolder]);

    const handleDragOver = event => {
        event.preventDefault();
    };

    const handleDrop = async (event) => {
        event.preventDefault();

        const items = event.dataTransfer.items;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item.kind === 'file' && item.webkitGetAsEntry) {
                const entry = item.webkitGetAsEntry();

                if (entry.isDirectory) {
                    const folderReader = entry.createReader();
                    const  folderItems  = await readFolder(folderReader);

                    console.log('Folder Items:', folderItems); 
                    setDraggedItems((prevItems) => [...prevItems, entry]);
                    console.log(draggedItems);

                } else {
                    const file = item.getAsFile();
                    console.log('Dropped File:', file);

                    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
                    setDraggedItems((prevItems) => [...prevItems, { file, previewUrl }]);
                    handleUpload(file, selectedCompany);
                    //window.location.reload();
                }
            }
        }
    };

    const readFolder = async (folderReader) => {
        return new Promise((resolve) => {
            const folderItems = [];

            const readEntries = () => {
                folderReader.readEntries((entries) => {
                    if (entries.length > 0) {
                        folderItems.push(...entries);
                        readEntries();
                    } else {
                        resolve({ folderItems });
                    }
                });
            };

            readEntries();
        });
    };


     const AddDico = async () => {
        try {
            const response = await axios.post('http://localhost:5000/AddDico', {
                ID: ID,
                Name: Name,
            });
            setID('');
            setName('');
            window.location.reload();
            alert('Client ajouté avec succès!');
        } catch (error) {
            console.error('Erreur lors de l\'ajout au dictionnaire:', error);
            alert('Erreur lors de l\'ajout du client');
        }
    };
    const handleDelete = async (file) => {
        try {
            if (file && file.filename) {
                await axios.delete(`http://localhost:5000/deleteFile/${file.filename}`);
                setFiles((prevFiles) => prevFiles.filter((f) => f.filename !== file.filename));
            } else if (file && file.file.name) {
                try {
                    const response = await fetch(`http://localhost:5000/getFileByOriginalname/${file.file.name}`);
                    if (!response.ok) {
                        throw new Error(`Reponse non OK: ${response.status}`);
                    }
                    const data = await response.json();

                    console.log(data);

                    await axios.delete(`http://localhost:5000/deleteFile/${data.filename}`);
                    setDraggedItems((prevItems) => prevItems.filter((item) => item.file.name !== file.file.name));
                } catch (error) {
                    console.error('Erreur lors de la récupération du fichier par originalname :', error);
                }
            } else {
                console.error('Le fichier ou le nom du fichier est undefined');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du fichier :', error);
        }
    };

    const handleSelectChange = (e) => {
        setSelectedCompany((prevValue) => {
            return e.target.value;
        });
    };

    useEffect(() => {
        (async () => {
            const previews = await Promise.all(files.map(file => handlePreview(file)));
            setPreviewUrls(previews);
        })();
    }, [files]); 

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                {(userRoles.includes('bruno') || userRoles.includes('admin')) && (
                    <div>
                        <label htmlFor="ID">ID:</label>
                        <input
                            type="text"
                            id="ID"
                            value={ID}
                            onChange={(e) => setID(e.target.value)}
                        />

                        <label htmlFor="Name">Entreprise:</label>
                        <input
                            type="text"
                            id="Name"
                            value={Name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <button onClick={AddDico}>Ajouter un client</button>
                    </div>
                )}
            </div>
            <label htmlFor="companySelect">Entreprise:</label>
            <select
                id="companySelect"
                value={selectedCompany}
                onChange={handleSelectChange}
                style={{ marginRight: '10px' }}
            >
                <option value="All">All</option>
                {companyOptions && companyOptions.map((company, index) => (
                    <option key={index} value={company}>
                        {company}
                    </option>
                ))}
            </select>
            <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px', height: '50vh' }}
            >
                <h2>Drop Zone</h2>
                <ul>
                    {files.map((file, index) => (
                        ((file.visibility === selectedCompany || file.visibility === 'All' || selectedCompany === 'All') && (
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
                                    <button style={{ width: '40px', height: '40px' }} onClick={() => handleDelete(file)}>🗑️</button>
                                </div>
                            </li>
                        ))
                    ))}
                    {draggedItems.map((item, index) => (
                        <li key={index}>
                            {item && item.file && (
                                <div>
                                    {item.file.type.startsWith('image/') ? (
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <img src={item.previewUrl} alt={item.file.name} style={{ maxWidth: '100px', maxHeight: '100px' }} />
                                            <p style={{ marginLeft: '10px', cursor: 'pointer' }} onClick={() => saveAs(item.file, item.file.name)}>
                                                {item.file.name}
                                            </p>
                                            <button style={{ width: '40px', height: '40px' }} onClick={() => handleDelete(item)}>🗑️</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                <p style={{ marginLeft: '10px', cursor: 'pointer' }} onClick={() => saveAs(item.file, item.file.name)}>
                                                    {item.file.name}
                                                </p>
                                            <button style={{ width: '40px', height: '40px' }} onClick={() => handleDelete(item)}>🗑️</button>
                                        </div>
                                        
                                    )}
                                </div>
                            )}
                            {item && item.isDirectory && (
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
                                    <p style={{ marginLeft: '10px', cursor: 'pointer' }}>
                                        {item.name}
                                    </p>
                                    <button style={{ width: '40px', height: '40px' }} onClick={() => handleDelete(item)}>
                                        🗑️
                                    </button>
                                </div>
                            )}

                            {isPopupOpen && (
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
                                                                    {item.name && (item.name.endsWith('.png') || (item.name.endsWith('.gif') ) ? (
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
                            )}

                        </li>
                    ))}
                </ul>

            </div>
        </div>
    );
};

export default Home;