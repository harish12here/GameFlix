import React, { useState, useEffect } from "react";

// Helper to check for a winner
function calculateWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return null;
}

// AI implementation using minimax algorithm
function findBestMove(board, player) {
  const opponent = player === 'X' ? 'O' : 'X';
  
  function minimax(board, isMaximizing) {
    const result = calculateWinner(board);
    
    // If game is over, return the score
    if (result) {
      return result.winner === player ? 10 : -10;
    }
    if (board.every(cell => cell !== null)) return 0;
    
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = player;
          const score = minimax(board, false);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = opponent;
          const score = minimax(board, true);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }
  
  let bestScore = -Infinity;
  let bestMove = null;
  
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      board[i] = player;
      const score = minimax(board, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  
  return bestMove;
}

function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winningLine, setWinningLine] = useState([]);
  const [celebrate, setCelebrate] = useState(false);
  const [gameMode, setGameMode] = useState('pvp'); // 'pvp' or 'pvc'
  const [difficulty, setDifficulty] = useState('hard'); // 'easy', 'medium', 'hard'
  const [isThinking, setIsThinking] = useState(false);

  const result = calculateWinner(board);
  const winner = result?.winner;
  const isDraw = board.every(Boolean) && !winner;

  useEffect(() => {
    if (result) {
      setWinningLine(result.line);
    }
  }, [result]);

  useEffect(() => {
    if (winner) {
      setCelebrate(true);
      const timer = setTimeout(() => setCelebrate(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [winner]);

  // Handle AI move
  useEffect(() => {
    if (gameMode === 'pvc' && !isXNext && !winner && !isDraw) {
      const timer = setTimeout(() => {
        setIsThinking(true);
        
        setTimeout(() => {
          let move;
          if (difficulty === 'easy') {
            // Easy: random moves
            const emptyCells = board.map((cell, idx) => cell === null ? idx : null).filter(val => val !== null);
            move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
          } else if (difficulty === 'medium') {
            // Medium: sometimes random, sometimes smart
            move = Math.random() > 0.5 ? 
              findBestMove(board, 'O') : 
              board.map((cell, idx) => cell === null ? idx : null).filter(val => val !== null)[
                Math.floor(Math.random() * board.filter(cell => cell === null).length)
              ];
          } else {
            // Hard: always optimal moves
            move = findBestMove(board, 'O');
          }
          
          if (move !== null && board[move] === null) {
            const newBoard = [...board];
            newBoard[move] = 'O';
            setBoard(newBoard);
            setIsXNext(true);
          }
          setIsThinking(false);
        }, 500); // Simulate "thinking" time
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [board, isXNext, gameMode, difficulty, winner, isDraw]);

  const status = winner
    ? `🏆 ${winner} wins!`
    : isDraw
    ? "🤝 It's a Draw!"
    : `${isXNext ? "❌" : "⭕"}'s turn`;

  const handleClick = (index) => {
    if (board[index] || winner || (gameMode === 'pvc' && !isXNext)) return;
    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinningLine([]);
    setCelebrate(false);
  };

  const getCellClass = (index) => {
    let classes = "w-20 h-20 text-4xl font-bold transition-all duration-300 flex items-center justify-center ";
    
    if (winningLine.includes(index)) {
      classes += "bg-green-100 text-green-600 scale-105 shadow-inner ";
    } else {
      classes += "bg-gray-50 hover:bg-gray-100 ";
    }
    
    if (board[index] === "X") {
      classes += "text-red-500 ";
    } else if (board[index] === "O") {
      classes += "text-blue-500 ";
    }
    
    if (isThinking && gameMode === 'pvc' && !isXNext) {
      classes += "opacity-70 cursor-not-allowed ";
    }
    
    return classes;
  };

  return (
    <div className={`p-6 rounded-2xl shadow-xl w-80 mx-auto text-center bg-gradient-to-br from-gray-50 to-gray-100 mt-8 border border-gray-200 transition-all duration-500 ${celebrate ? "animate-bounce" : ""}`}>
      <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
        Tic Tac Toe
      </h2>
      
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => { setGameMode('pvp'); resetGame(); }}
          className={`px-3 py-1 text-sm rounded-full ${gameMode === 'pvp' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
        >
          Player vs Player
        </button>
        <button
          onClick={() => { setGameMode('pvc'); resetGame(); }}
          className={`px-3 py-1 text-sm rounded-full ${gameMode === 'pvc' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
        >
          Player vs AI
        </button>
      </div>
      
      {gameMode === 'pvc' && (
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setDifficulty('easy')}
            className={`px-3 py-1 text-sm rounded-full ${difficulty === 'easy' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Easy
          </button>
          <button
            onClick={() => setDifficulty('medium')}
            className={`px-3 py-1 text-sm rounded-full ${difficulty === 'medium' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Medium
          </button>
          <button
            onClick={() => setDifficulty('hard')}
            className={`px-3 py-1 text-sm rounded-full ${difficulty === 'hard' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Hard
          </button>
        </div>
      )}
      
      <div className="mb-4">
        <p className={`text-lg font-medium py-2 px-4 rounded-full inline-block ${winner ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800" : isDraw ? "bg-gray-200 text-gray-700" : "bg-blue-50 text-blue-600"}`}>
          {isThinking && gameMode === 'pvc' && !isXNext ? "🤖 AI is thinking..." : status}
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-6 bg-white p-2 rounded-lg shadow-inner">
        {board.map((value, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={getCellClass(index)}
            disabled={isThinking && gameMode === 'pvc' && !isXNext}
          >
            {value === "X" ? (
              <span className="animate-pop">❌</span>
            ) : value === "O" ? (
              <span className="animate-pop">⭕</span>
            ) : null}
          </button>
        ))}
      </div>
      
      <button
        onClick={resetGame}
        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium shadow hover:shadow-md transition-all hover:scale-105 active:scale-95"
      >
        New Game
      </button>
      
      <style jsx>{`
        .animate-pop {
          animation: pop 0.3s ease;
        }
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          80% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default TicTacToe;