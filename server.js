const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews',  require('./routes/reviews'));

app.get('/', (req, res) => res.json({ message: 'LocalDeal API en ligne' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connecté');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Serveur démarré sur le port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error('Erreur MongoDB :', err));