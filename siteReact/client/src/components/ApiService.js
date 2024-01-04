// ApiService.js
const BASE_URL = 'http://localhost:5000';

export const getUserRoles = async (username) => {
    try {
        const response = await fetch(`${BASE_URL}/getUserRole/${username}`);
        if (!response.ok) {
            throw new Error(`Reponse non OK: ${response.status}`);
        }
        const data = await response.json();
        return data.roles;
    } catch (error) {
        console.error('Erreur lors de la recuperation du role :', error);
        throw error;
    }
};

export const getFiles = async () => {
    try {
        const response = await fetch(`${BASE_URL}/getFiles`);
        if (!response.ok) {
            throw new Error(`Réponse non OK: ${response.status}`);
        }
        const data = await response.json();
        const filesByFolder = data.files.reduce((acc, file) => {
            const { folderName } = file;
            const folderKey = folderName || 'Default';

            if (!acc[folderKey]) {
                acc[folderKey] = [];
            }
            acc[folderKey].push(file);
            return acc;
        }, {});
        /*for (const folderKey in filesByFolder) {
            if (Object.hasOwnProperty.call(filesByFolder, folderKey)) {
                console.log(`Dossier : ${folderKey}`);

                // Accéder au tableau de fichiers pour ce dossier
                const filesInFolder = filesByFolder[folderKey];

                // Boucle à travers les fichiers dans ce dossier
                for (const file of filesInFolder) {
                    console.log(`Nom du fichier : ${file.originalname}`);
                    console.log(`Chemin du fichier : ${file.previewUrl}`);
                }
            }
        }*/
        return filesByFolder;
    } catch (error) {
        console.error('Erreur lors de la recuperation des fichiers:', error);
        throw error;
    }
};

export const getCompanies = async () => {
    try {
        const response = await fetch(`${BASE_URL}/getCompanies`);
        if (!response.ok) {
            throw new Error(`Réponse non OK: ${response.status}`);
        }
        const data = await response.json();
        return data.companies;
    } catch (error) {
        console.error('Erreur lors de la récupération des entreprises:', error);
        throw error;
    }
};
