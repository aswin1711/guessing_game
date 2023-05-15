import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [number, setNumber] = useState('');
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState('');
  const [score, setScore] = useState(0);
  const [topScores, setTopScores] = useState([]);

  useEffect(() => {
    // Fetch the top scores when the component mounts
    axios.get('/top-scores')
      .then(res => setTopScores(res.data))
      .catch(err => console.log(err));
  }, []);

  function startNewGame() {
    // Call the API to start a new game
    axios.post('/new-game', { name: name })
      .then(res => {
        setId(res.data._id);
        setNumber(res.data.number);
        setGuess('');
        setResult('');
        setScore(0);
      })
      .catch(err => console.log(err));
  }

  function checkGuess() {
    // Call the API to check a guess
    axios.post('/check-guess', { guess: guess, id: id })
      .then(res => {
        setResult(`${res.data.plus}+${res.data.minus}-`);
        setScore(res.data.score);
        setGuess('');
      })
      .catch(err => console.log(err));
  }

  return (
    <div>
      <h1>Guessing Number Game</h1>
      <div>
        <label>Enter your name:</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} />
        <button onClick={startNewGame}>Start New Game</button>
      </div>
      {number &&
        <div>
          <p>The computer has chosen a 4-digit number with no duplicate digits. Try to guess it!</p>
          <p>Guess #{score + 1}</p>
          <div>
            <input type="text" maxLength="4" value={guess} onChange={e => setGuess(e.target.value)} />
            <button onClick={checkGuess}>Check</button>
          </div>
          {result &&
            <p>Your guess: {guess} - Result: {result}</p>
          }
        </div>
      }
      {topScores.length > 0 &&
        <div>
          <h2>Top Scores</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Score</th>
                <th>Guesses</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {topScores.map((score, index) => (
                <tr key={score._id}>
                  <td>{score.name}</td>
                  <td>{score.score}</td>
                  <td>{score.guesses}</td>
                  <td>{(score.time / 1000).toFixed(2)} seconds</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    </div>
  );
}

export default App;
