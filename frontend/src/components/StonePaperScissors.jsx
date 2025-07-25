import React, { useState, useEffect, useCallback } from "react";
import Stone from "../assets/RockPaperScissor/Rock.png";
import Scissors from "../assets/RockPaperScissor/Scissor.png";
import Paper from "../assets/RockPaperScissor/Paper.png";

const CHOICES = [
  { name: "Stone", image: Stone, beats: "Scissors" },
  { name: "Paper", image: Paper, beats: "Stone" },
  { name: "Scissors", image: Scissors, beats: "Paper" }
];

const TIMER_DURATION = 5;

function StonePaperScissors() {
  const [userChoice, setUserChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [gameActive, setGameActive] = useState(true);
  const [score, setScore] = useState({ user: 0, computer: 0, draws: 0 });
  const [gameHistory, setGameHistory] = useState([]);

  const generateComputerChoice = useCallback(() => {
    return CHOICES[Math.floor(Math.random() * CHOICES.length)];
  }, []);

  useEffect(() => {
    if (!gameActive) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive]);

  const handleTimeOut = useCallback(() => {
    const compChoice = generateComputerChoice();
    setComputerChoice(compChoice);
    setResult("Time's Up! You Lose.");
    setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
    setGameActive(false);
    addToHistory(null, compChoice, "timeout");
  }, [generateComputerChoice]);

  const determineWinner = useCallback((user, computer) => {
    if (user === computer) return "draw";
    if (user.beats === computer.name) return "win";
    return "lose";
  }, []);

  const playGame = useCallback((choice) => {
    if (!gameActive) return;
    
    const userSelection = CHOICES.find(c => c.name === choice);
    const compSelection = generateComputerChoice();
    
    setUserChoice(userSelection);
    setComputerChoice(compSelection);
    
    const gameResult = determineWinner(userSelection, compSelection);
    
    setResult(
      gameResult === "draw" ? "Draw" : 
      gameResult === "win" ? "You Win!" : "You Lose."
    );
    
    setScore(prev => ({
      ...prev,
      user: gameResult === "win" ? prev.user + 1 : prev.user,
      computer: gameResult === "lose" ? prev.computer + 1 : prev.computer,
      draws: gameResult === "draw" ? prev.draws + 1 : prev.draws
    }));
    
    setGameActive(false);
    addToHistory(userSelection, compSelection, gameResult);
  }, [gameActive, generateComputerChoice, determineWinner]);

  const addToHistory = (user, computer, result) => {
    setGameHistory(prev => [
      {
        userChoice: user?.name || "None",
        computerChoice: computer.name,
        result: result === "draw" ? "Draw" : 
               result === "win" ? "Win" : 
               result === "lose" ? "Lose" : "Timeout",
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev.slice(0, 9)
    ]);
  };

  const resetGame = useCallback(() => {
    setUserChoice(null);
    setComputerChoice(null);
    setResult("");
    setTimeLeft(TIMER_DURATION);
    setGameActive(true);
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md overflow-hidden">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Stone Paper Scissors</h2>
      
      <div className="flex justify-between mb-6 text-center">
        <div className="px-4 py-2 bg-blue-100 rounded-lg">
          <div className="font-semibold text-blue-800">Wins</div>
          <div className="text-xl font-bold">{score.user}</div>
        </div>
        <div className="px-4 py-2 bg-red-100 rounded-lg">
          <div className="font-semibold text-red-800">Losses</div>
          <div className="text-xl font-bold">{score.computer}</div>
        </div>
        <div className="px-4 py-2 bg-yellow-100 rounded-lg">
          <div className="font-semibold text-yellow-800">Draws</div>
          <div className="text-xl font-bold">{score.draws}</div>
        </div>
      </div>
      
      {gameActive && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-red-500 h-2.5 rounded-full" 
              style={{ width: `${(timeLeft / TIMER_DURATION) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">Time Left: {timeLeft} sec</p>
        </div>
      )}
      
      <div className="flex justify-between mb-6">
        {CHOICES.map((choice) => (
          <button
            key={choice.name}
            onClick={() => playGame(choice.name)}
            disabled={!gameActive}
            className={`flex flex-col items-center p-3 rounded-lg transition-all ${
              gameActive 
                ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-1" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            aria-label={`Choose ${choice.name}`}
          >
            <img 
              src={choice.image} 
              alt={choice.name} 
              className="w-16 h-16 object-contain mb-2"
            />
            <span>{choice.name}</span>
          </button>
        ))}
      </div>
      
      <div className="mb-6">
        <p className={`text-xl font-bold text-center mb-4 ${
          result.includes("Win") ? "text-green-600" : 
          result.includes("Lose") ? "text-red-600" : 
          result === "Draw" ? "text-yellow-600" : "text-gray-800"
        }`}>
          {result}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center w-1/3">
            <p className="font-medium text-gray-700 mb-2">You</p>
            {userChoice ? (
              <img 
                src={userChoice.image} 
                alt={userChoice.name} 
                className="w-24 h-24 object-contain"
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-full text-gray-400 text-4xl">?</div>
            )}
            <p className="mt-2 font-medium">{userChoice?.name || "-"}</p>
          </div>
          
          <div className="w-1/6 flex justify-center">
            <div className="bg-gray-800 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">VS</div>
          </div>
          
          <div className="flex flex-col items-center w-1/3">
            <p className="font-medium text-gray-700 mb-2">Computer</p>
            {computerChoice ? (
              <img 
                src={computerChoice.image} 
                alt={computerChoice.name} 
                className="w-24 h-24 object-contain"
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-full text-gray-400 text-4xl">?</div>
            )}
            <p className="mt-2 font-medium">{computerChoice?.name || "-"}</p>
          </div>
        </div>
      </div>
      
      {!gameActive && (
        <button
          onClick={resetGame}
          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
          aria-label="Play again"
        >
          Play Again
        </button>
      )}
      
      {gameHistory.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Recent Games</h3>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {gameHistory.map((game, index) => (
              <li 
                key={index} 
                className={`p-2 rounded text-sm ${
                  game.result === "Win" ? "bg-green-50 text-green-800" :
                  game.result === "Lose" ? "bg-red-50 text-red-800" :
                  game.result === "Timeout" ? "bg-gray-100 text-gray-800" :
                  "bg-yellow-50 text-yellow-800"
                }`}
              >
                <span className="font-medium">{game.timestamp}</span>: {game.userChoice} vs {game.computerChoice} - {game.result}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default StonePaperScissors;