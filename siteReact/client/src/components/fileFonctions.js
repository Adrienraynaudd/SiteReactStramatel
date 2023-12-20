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
            console.log('Fichier t�l�charg� avec succ�s');
        } else { 
            console.error('Erreur lors du t�l�chargement du fichier');
        }
    } catch (error) {
        console.error('Erreur lors du t�l�chargement du fichier:', error);
    }
};

export const handleDownload = async (file) => {
    try {
        const response = await axios.get(`http://localhost:5000/download/${file.filename}`, {
            responseType: 'blob',
        });

        const blob = new Blob([response.data]);

        // D�finir le type MIME correct
        const contentType = response.headers['content-type'];

        // Cr�er un objet URL pour le blob
        const fileUrl = URL.createObjectURL(blob);

        // Cr�er un lien virtuel et d�clencher un t�l�chargement
        const link = document.createElement('a');
        link.href = fileUrl;
        link.setAttribute('download', file.originalname);
        link.setAttribute('type', contentType);

        // Ajouter le lien au document
        document.body.appendChild(link);

        // D�clencher le t�l�chargement
        link.click();

        // Retirer le lien du document
        document.body.removeChild(link);

        // R�voquer l'URL de l'objet blob pour lib�rer la m�moire
        URL.revokeObjectURL(fileUrl);
    } catch (error) {
        console.error('Error downloading file:', error);
    }
};

export const handlePreview = async (file) => {
    try {
        const response = await axios.get(`http://localhost:5000/download/${file.filename}`, {
            responseType: 'blob',
        });

        const blob = new Blob([response.data]);
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