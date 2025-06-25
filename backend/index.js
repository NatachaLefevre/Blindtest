// Pour lancer le serveur : npm run start
// Pour lancer le frontend : npm run dev

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/api/tracks', (req, res) => {
  res.json(tracks);
});

app.listen(PORT, () => {
  console.log(`✅ Serveur backend lancé sur http://localhost:${PORT}`);
});
