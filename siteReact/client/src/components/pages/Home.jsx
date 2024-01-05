import React,{ useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { handleUpload, handleDownload, handlePreview, handleUploadFolder } from '../fileFonctions';
import axios from 'axios';
import '../styles/PopUp.css';
import Popup from '../Popup';
import ClientForm from '../ClientForm';
import FileItem from '../FileItem';
import FolderItem from '../FolderItem';
import FileFromDb from '../FileFromDb';
import { getUserRoles, getFiles, getCompanies } from '../ApiService';
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
        const fetchData = async () => {
            const username = localStorage.getItem('loggedInUser');

            try {
                const roles = await getUserRoles(username);
                setUserRoles(roles);

                const filesData = await getFiles();
                setFiles(filesData);

                const companies = await getCompanies();
                setCompanyOptions(companies);
            } catch (error) {
                console.error('Error during data fetching:', error);
            }
        };

        fetchData();
    }, []);
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
                    const folderItems = await readFolder(folderReader);
                    const filesWithPreviews = await Promise.all(Array.from(folderItems.folderItems).map(async (fileEntry) => {
                        const file = await getFileFromEntry(fileEntry);
                        const types = entry.name;
                        const previewUrl = file ? (file.type.startsWith('image/') ? await handlePreview(file, types) : null) : null;
                        return { file, previewUrl, types };
                    }));
                    setFolderItems(folderItems);
                    setDraggedItems((prevItems) => [...prevItems, ...filesWithPreviews]);
                    handleUploadFolder(filesWithPreviews, selectedCompany, entry.name)
                        .then(() => {
                            window.location.reload();
                        })
                } else {
                    const file = item.getAsFile();
                    console.log('Dropped File:', file);
                    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
                    setDraggedItems((prevItems) => [...prevItems, { file, previewUrl }]);
                    handleUpload(file, selectedCompany)
                    .then(() => {
                        window.location.reload();
                    })
                }
            }
        }
    };
    const getFileFromEntry = async (fileEntry) => {
        return new Promise((resolve, reject) => {
            fileEntry.file(resolve, reject);
        });
    }

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
            if (file) {
                if (file.isDirectory) {
                    await axios.delete(`http://localhost:5000/deleteFolder/${file.name}`);
                } else if (file.filename) {
                    if (file.folderName === "file") {
                        await axios.delete(`http://localhost:5000/deleteFile/${file.filename}/${file.folderName}`);
                    }
                    else {
                        await axios.delete(`http://localhost:5000/deleteFile/${file.originalname}/${file.folderName}`);
                    }
                } else if (file.file && file.file.name) {
                    const response = await fetch(`http://localhost:5000/getFileByOriginalname/${file.file.name}`);
                    if (response.ok) {
                        const data = await response.json();
                        await axios.delete(`http://localhost:5000/deleteFile/${data.filename}`);
                        setDraggedItems((prevItems) => prevItems.filter((item) => item.file.name !== file.file.name));
                    } else {
                        console.error(`Réponse non OK: ${response.status}`);
                    }
                } else {
                    console.error('Le fichier ou le nom du fichier est undefined');
                }

                setFiles((prevFiles) => {
                    if (prevFiles && prevFiles.file && prevFiles.file.length > 0) {
                        
                        const updatedFiles = prevFiles.file.filter((f) => f.filename !== file.filename);
                        //window.location.reload();
                        return { ...prevFiles, file: updatedFiles };
                    } else if (prevFiles && Object.keys(prevFiles).length > 0) {
                        const updatedFiles = { ...prevFiles };

                        // Si c'est un dossier, filtrer les fichiers qui ne sont pas dans ce dossier
                        if (file.folderName) {
                            updatedFiles[file.folderName] = updatedFiles[file.folderName].filter((f) => f.filename !== file.filename);

                            // Supprimer le dossier s'il ne contient plus de fichiers
                            if (updatedFiles[file.folderName].length === 0) {
                                delete updatedFiles[file.folderName];
                            }
                        } else {
                            // Si c'est un fichier, simplement le retirer de la liste
                            console.error('Le fichier ou le nom du fichier est undefined');
                        }

                        return updatedFiles;
                    } else {
                        console.warn('PrevFiles est undefined ou vide');
                        return { file: [] };
                    }
                });
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
            try {
                const filesData = await getFiles();
                if (filesData) {
                    const previewsByFolder = {};
                    for (const folderName in filesData) {
                        const folderFiles = filesData[folderName];
                        const types = folderName
                        const previews = await Promise.all(folderFiles.map(file => handlePreview(file, types)));
                        previewsByFolder[folderName] = previews;
                    }


                    setFiles(filesData);
                    setPreviewUrls(previewsByFolder);
                } else {
                    console.warn('No files data received.');
                }
            } catch (error) {
                console.error('Error fetching files data:', error);
            }
        })();
    }, []);




    return (
        <div>
            <ClientForm
                userRoles={userRoles}
                ID={ID}
                Name={Name}
                setID={setID}
                setName={setName}
                AddDico={AddDico}
                selectedCompany={selectedCompany}
                handleSelectChange={handleSelectChange}
                companyOptions={companyOptions}
            />
            <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px', height: '50vh' }}
            >
                <h2>Drop Zone</h2>
                <ul>
                    {Object.keys(files).map(folderName => (
                        <FileFromDb
                            key={folderName}
                            files={files[folderName]}
                            previewUrls={previewUrls[folderName] || []}
                            handleDownload={handleDownload}
                            handleDelete={handleDelete}
                        />
                    ))}
                    {draggedItems.length > 0 && draggedItems[0].types !== undefined && draggedItems[0].types !== 'file' && (
                        <div>
                            <span role="img" aria-label="Folder" style={{ marginRight: '8px' }}>
                                📁
                                {draggedItems[0].types}
                            </span>
                            
                        </div>
                    )}
                    {draggedItems.map((item, index) => (
                        <li key={index}>
                            {item && item.file && (
                                <div>
                                    {item && item.file && <FileItem item={item} saveAs={saveAs} handleDelete={handleDelete} />}
                                </div>
                            )}
                            {item && item.isDirectory && (
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    {item.isDirectory && <FolderItem item={item} setPopupOpen={setPopupOpen} setSelectedFolder={setSelectedFolder} handleDelete={handleDelete} />}
                                </div>
                            )}

                            <Popup
                                isPopupOpen={isPopupOpen}
                                setPopupOpen={setPopupOpen}
                                selectedFolder={selectedFolder}
                                folderItems={folderItems}
                                saveAs={saveAs}
                                handleDelete={handleDelete}
                            />

                        </li>
                    ))}
                </ul>

            </div>
        </div>
    );
};

export default Home;