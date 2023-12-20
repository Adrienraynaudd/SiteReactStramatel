import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { handleUpload, handleDownload, handlePreview } from '../fileFonctions';
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
                    const  folderItems  = await readFolder(folderReader);

                    console.log('Folder Items:', folderItems);
                    setFolderItems(folderItems);
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
                    {files.map((file, index) => (
                        ((file.visibility === selectedCompany || file.visibility === 'All' || selectedCompany === 'All') && (
                            <FileFromDb file={file} index={index} previewUrls={previewUrls} handleDownload={handleDownload} handleDelete={handleDelete} />
                        ))
                    ))}
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