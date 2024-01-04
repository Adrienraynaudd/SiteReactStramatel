import axios from 'axios';

export const handleUpload = async (file, selectedCompany) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('selectedCompany', selectedCompany);

        const response = await fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            console.log('Fichier téléchargé avec succès');
        } else { 
            console.error('Erreur lors du téléchargement du fichier');
        }
    } catch (error) {
        console.error('Erreur lors du téléchargement du fichier:', error);
    }
};
export const handleUploadFolder = async (filesWithPreviews, selectedCompany, folderName) => {
    try {
        const formData = new FormData();
        formData.append('selectedCompany', selectedCompany);
        formData.append('folderName', folderName);
        await Promise.all(filesWithPreviews.map(async ({ file, previewUrl }) => {
            formData.append(`files`, file);
            // Ajoutez également les aperçus au formulaire si nécessaire
            if (previewUrl) {
                formData.append(`previews`, previewUrl);
            }
            return file;
        }));
        const response = await fetch('http://localhost:5000/uploadFolder', {
            method: 'POST',
            body: formData,
        });
        if (response.ok) {
            console.log('Dossier téléchargé avec succès');

        } else {
            console.error('Erreur lors du téléchargement du Dossier');
        }
    } catch (error) {
        console.error('Erreur lors du téléchargement du Dossier :', error);
    }
};



export const handleDownload = async (file) => {
    try {
        const response = await axios.get(`http://localhost:5000/download/${file.filename}`, {
            responseType: 'blob',
        });

        const blob = new Blob([response.data]);

        // Définir le type MIME correct
        const contentType = response.headers['content-type'];

        // Créer un objet URL pour le blob
        const fileUrl = URL.createObjectURL(blob);

        // Créer un lien virtuel et déclencher un téléchargement
        const link = document.createElement('a');
        link.href = fileUrl;
        link.setAttribute('download', file.originalname);
        link.setAttribute('type', contentType);

        // Ajouter le lien au document
        document.body.appendChild(link);

        // Déclencher le téléchargement
        link.click();

        // Retirer le lien du document
        document.body.removeChild(link);

        // Révoquer l'URL de l'objet blob pour libérer la mémoire
        URL.revokeObjectURL(fileUrl);
    } catch (error) {
        console.error('Error downloading file:', error);
    }
};

export const handlePreview = async (file,type) => {
    try {
        let name = file.filename ? file.filename : file.name;

        console.log(type);
        const response = await axios.get(`http://localhost:5000/download/${name}/${type}`, {
                responseType: 'blob',
            });
        const blob = new Blob([response.data]);
        console.log(blob);
        const contentType = response.headers['content-type'];

        const dataUrl = URL.createObjectURL(blob);

        if (dataUrl) {
            return dataUrl;
        } else {
            console.error('URL invalide');
            return null;
        }
    } catch (error) {
        console.error('Error preview file:', error);
        return null;
    }
};