const express = require('express');
const mongoose = require('mongoose');

// Create Express app
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/guessing-game', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });

// Define a schema for the game records
const gameSchema = new mongoose.Schema({
  name: String,
  number: String,
  guesses: [{
    guess: String,
    plus: Number,
    minus: Number,
  }],
  score: Number,
  time: Number,
});

// Create a model based on the schema
const Game = mongoose.model('Game', gameSchema);

// API route to start a new game
app.post('/new-game', (req, res) => {
  const { name } = req.body;

  // Generate a random number with four unique digits
  let number = '';
  while (number.length < 4) {
    const digit = Math.floor(Math.random() * 10);
    if (!number.includes(digit.toString())) {
      number += digit;
    }
  }

  // Create a new game record
  const game = new Game({
    name,
    number,
    guesses: [],
    score: 0,
    time: Date.now(),
  });

  // Save the game record to the database
  game.save()
    .then((savedGame) => {
      res.json(savedGame);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to start a new game' });
    });
});

// API route to check a guess
app.post('/check-guess', (req, res) => {
  const { guess, id } = req.body;

  // Retrieve the game record from the database
  Game.findById(id)
    .then((game) => {
      const number = game.number;
      let plus = 0;
      let minus = 0;

      // Compare the guess with the actual number
      for (let i = 0; i < 4; i++) {
        if (guess[i] === number[i]) {
          plus++;
        } else if (number.includes(guess[i])) {
          minus++;
        }
      }

      // Update the game record with the new guess
      game.guesses.push({ guess, plus, minus });
      game.score++;
      game.save()
        .then(() => {
          res.json({ plus, minus, score: game.score });
        })
        .catch((error) => {
          res.status(500).json({ error: 'Failed to check the guess' });
        });
    })
    .catch((error) => {
      res.status(404).json({ error: 'Game not found' });
    });
});

// API route to fetch the top scores
app.get('/top-scores', (req, res) => {
  // Fetch the top 10 scores sorted by score and time
  Game.find({})
    .sort({ score: 1, time: 1 })
    .limit(10)
    .then((games) => {
      res.json(games);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to fetch top scores' });
    });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
