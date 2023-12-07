const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

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











app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
