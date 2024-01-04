const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


const utilisateurSchema = new mongoose.Schema({
    utilisateurs: [
        {
            utilisateur: String,
            mot_de_passe: String,
            roles: [String],
        }
    ]
}, { collection: 'CollectionUser' });

const Users = mongoose.model('Users', utilisateurSchema);

module.exports = Users;

const fileSchema = new mongoose.Schema({
    filename: String,
    originalname: String,
    mimetype: String,
    previewUrl : String,
    size: Number,
    data: Buffer,
    visibility: { type: String, default: 'All' },
    folderName: { type: String, default: 'file' },
}, { collection: 'Files' });

const File = mongoose.model('File', fileSchema);

module.exports = File;

const clientSchema = new mongoose.Schema({
    ID: { type: String, required: true },
    Name: { type: String, required: true },
});

const Client = mongoose.model('clients', clientSchema);

module.exports = Client;

mongoose.connect('mongodb://localhost:27017/Users', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connexion a la base de donnees reussie');
    })
    .catch((error) => {
        console.error('Erreur lors de la connexion à la base de données :', error);
    });


app.get('/getUserRole/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await Users.findOne(
            { 'utilisateurs.utilisateur': username },
            { 'utilisateurs.$': 1 }
        );

        if (user) {
            console.log('Role recupere pour', username, ':', user.utilisateurs[0].roles);
            res.json({ roles: user.utilisateurs[0].roles });
        } else {
            console.log('Rôle: Utilisateur non trouvé pour', username);
            res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
    } catch (error) {
        console.error('Rôle: Erreur lors de la recuperation du role :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/getFiles', async (req, res) => {
    try {
        const files = await File.find({}, 'filename previewUrl originalname mimetype visibility folderName');
        res.json({ files });
    } catch (error) {
        console.error('Erreur lors de la récupération des fichiers :', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des fichiers' });
    }
});

app.get('/getFileByOriginalname/:originalname', async (req, res) => {
    try {
        const { originalname } = req.params;

        const result = await File.findOne({ originalname }, 'filename');

        if (result && result.filename) {
            res.json({ filename: result.filename });
        } else {
            res.status(404).json({ error: 'Fichier non trouvé pour l\'originalname spécifié' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des fichiers :', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des fichiers' });
    }
});



app.post('/login', async (req, res) => {
    try {
        const { Username, Password } = req.body;

        const user = await Users.findOne(
            { 'utilisateurs.utilisateur': Username },
            { 'utilisateurs.$': 1 }
        );

        if (user && user.utilisateurs[0].mot_de_passe === Password) {
            console.log('Mot de passe correct');
            res.json({ success: true });
        } else {
            console.log('Mot de passe incorrect ou utilisateur non trouvé');
            res.status(401).json({ error: 'Mot de passe incorrect ou utilisateur non trouvé' });
        }
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const companies = req.body.selectedCompany; 
        const savedFile = await File.create({
            filename: `${file.filename}`,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            data: file.buffer,
            previewUrl: file.previewUrl,
            visibility: companies,
        });
        savedFile.previewUrl = `/uploads/${savedFile.filename}`;
        await savedFile.save();
        res.json({ message: 'Fichier téléchargé avec succès', file: savedFile });
    } catch (error) {
        console.error('Erreur lors du téléchargement du fichier :', error);
        res.status(500).json({ error: 'Erreur serveur lors du téléchargement du fichier' });
    }
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderName = req.body.folderName || '';
        const folderPath = `./uploads/${folderName}`;
        fs.mkdir(folderPath, { recursive: true }, (err) => {
            if (err) {
                console.error('Erreur lors de la création du dossier :', err);
                cb(err, null);
            } else {
                cb(null, folderPath);
            }
        });
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
    encoding: 'utf-8',
});

const uploadFolder = multer({ encoding: 'utf-8', storage: storage });
app.post('/uploadFolder', uploadFolder.array('files'), async (req, res) => {
    try {
        const files = req.files;
        const companies = req.body.selectedCompany;
        const folderName = req.body.folderName;
        for (const file of files) {
            const savedFile = await File.create({
                filename: file.filename,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                data: file.buffer,
                previewUrl: file.previewUrl,
                visibility: companies,
                folderName: folderName,
                
            });
            savedFile.previewUrl = `/uploads/${folderName}/${savedFile.filename}`;
            await savedFile.save();
            
        }
        res.json({ message: 'Dossier téléchargés avec succès', files });
    } catch (error) {
        console.error('Erreur lors du téléchargement du Dossier :', error);
        res.status(500).json({ error: 'Erreur serveur lors du téléchargement du Dossier' });
    }
});



app.post('/AddDico', async (req, res) => {
    try {
        const { ID, Name } = req.body;
        const dico = new Client({ ID, Name });

        await dico.save();

        res.status(201).json({ message: 'Couple ajouté avec succès' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de l\'ajout du couple' });
    }
});

app.get('/download/:name/:type', async (req, res) => {
    try {
        const { name, type } = req.params;
        let filePath;
        if (type == "file") {
            filePath = path.join(__dirname, '/uploads/', name);
        } else {
            filePath = path.join(__dirname, `/uploads/${type}`, name);
        }
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).send('File not found');
        }
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.delete('/deleteFile/:filename', async (req, res) => {
    const filename = req.params.filename;
    console.log('Delete file request received for filename:', filename);
    const filePath = path.join(__dirname, 'uploads', filename);

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        const deletedFile = await File.findOneAndDelete({ filename });

        if (deletedFile) {
            res.json({ message: 'Fichier supprimé avec succès.' });
        } else {
            res.status(404).json({ error: 'Le fichier n\'existe pas.' });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du fichier :', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du fichier.' });
    }
});
app.delete('/deleteFolder/:folderName', async (req, res) => {
    const folderName = req.params.folderName;
    console.log('Delete folder request received for folderName:', folderName);
    const folderPath = path.join(__dirname, 'uploads', folderName);
    const relativeFolderPath = path.relative(__dirname, folderPath);
    try {
        const searchPattern = `/uploads/${folderName}`;
        const deletedFiles = await File.deleteMany({ previewUrl: { $regex: searchPattern } });
        console.log(deletedFiles);
        if (fs.existsSync(folderPath)) {
            fs.readdirSync(folderPath).forEach(file => {
                const filePath = path.join(folderPath, file);
                fs.unlinkSync(filePath);
            });

            fs.rmdirSync(folderPath);

            res.json({ message: 'Dossier et fichiers associés supprimés avec succès.' });
        } else {
            res.status(404).json({ error: 'Le dossier n\'existe pas.' });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du dossier :', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du dossier.' });
    }
});

app.get('/getCompanies', async (req, res) => {
    try {
        const Clients = await Client.find({}, 'Name');
        res.json({ companies: Clients.map(client => client.Name) });
    } catch (error) {
        console.error('Error get Companies file:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.use('/uploads', express.static('uploads'));
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
