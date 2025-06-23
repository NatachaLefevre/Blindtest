// Pour lancer le serveur : npm run start
// Pour lancer le frontend : npm run dev

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());

const tracks = require('./tracks.json');

app.get('/api/tracks', (req, res) => {
  res.json(tracks);
});

app.listen(PORT, () => {
  console.log(`✅ Serveur backend lancé sur http://localhost:${PORT}`);
});
