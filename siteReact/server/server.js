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
}, { collection: 'Files' });

const File = mongoose.model('File', fileSchema);

module.exports = File;

const clientSchema = new mongoose.Schema({
    ID: { type: String, required: true },
    Name: { type: String, required: true },
});

const Client = mongoose.model('client', clientSchema);

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
        const files = await File.find({}, 'filename previewUrl originalname mimetype');
        res.json({ files });
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

        console.log('Nom du fichier avant création :', `${file.filename}${path.extname(file.originalname)}`);

        const savedFile = await File.create({
            filename: `${file.filename}`,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            data: file.buffer,
        });

        console.log('Nom du fichier après création :', savedFile.filename);

        savedFile.previewUrl = `/uploads/${savedFile.filename}`;

        await savedFile.save();
        console.log(savedFile)
        res.json({ message: 'Fichier téléchargé avec succès', file: savedFile });
    } catch (error) {
        console.error('Erreur lors du téléchargement du fichier :', error);
        res.status(500).json({ error: 'Erreur serveur lors du téléchargement du fichier' });
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

app.get('/download/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'uploads', filename);

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

app.use('/uploads', express.static('uploads'));
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
