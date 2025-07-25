import React, { useState, useEffect, useCallback } from "react";

// Initial board setup
const initialBoard = () => {
  const board = Array(8).fill().map(() => Array(8).fill(null));
  
  // Set up white pieces
  board[0][0] = { type: "rook", color: "white", symbol: "♖", hasMoved: false };
  board[0][1] = { type: "knight", color: "white", symbol: "♘", hasMoved: false };
  board[0][2] = { type: "bishop", color: "white", symbol: "♗", hasMoved: false };
  board[0][3] = { type: "queen", color: "white", symbol: "♕", hasMoved: false };
  board[0][4] = { type: "king", color: "white", symbol: "♔", hasMoved: false };
  board[0][5] = { type: "bishop", color: "white", symbol: "♗", hasMoved: false };
  board[0][6] = { type: "knight", color: "white", symbol: "♘", hasMoved: false };
  board[0][7] = { type: "rook", color: "white", symbol: "♖", hasMoved: false };
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: "pawn", color: "white", symbol: "♙", hasMoved: false, enPassant: false };
  }

  // Set up black pieces
  board[7][0] = { type: "rook", color: "black", symbol: "♜", hasMoved: false };
  board[7][1] = { type: "knight", color: "black", symbol: "♞", hasMoved: false };
  board[7][2] = { type: "bishop", color: "black", symbol: "♝", hasMoved: false };
  board[7][3] = { type: "queen", color: "black", symbol: "♛", hasMoved: false };
  board[7][4] = { type: "king", color: "black", symbol: "♚", hasMoved: false };
  board[7][5] = { type: "bishop", color: "black", symbol: "♝", hasMoved: false };
  board[7][6] = { type: "knight", color: "black", symbol: "♞", hasMoved: false };
  board[7][7] = { type: "rook", color: "black", symbol: "♜", hasMoved: false };
  for (let i = 0; i < 8; i++) {
    board[6][i] = { type: "pawn", color: "black", symbol: "♟", hasMoved: false, enPassant: false };
  }

  return board;
};

// Piece values for AI
const PIECE_VALUES = {
  pawn: 10,
  knight: 30,
  bishop: 30,
  rook: 50,
  queen: 90,
  king: 900
};

// AI difficulty levels
const AI_LEVELS = {
  easy: { depth: 1, randomness: 0.3 },
  medium: { depth: 2, randomness: 0.2 },
  hard: { depth: 3, randomness: 0.1 }
};

// Check if a square is under attack
const isSquareAttacked = (board, position, color) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color !== color) {
        // Temporarily remove the king to prevent infinite recursion
        const targetPiece = board[position.row][position.col];
        if (targetPiece?.type === "king") {
          board[position.row][position.col] = null;
        }
        
        const isValid = isValidMove(board, { row, col }, position, true);
        
        // Restore the king
        if (targetPiece?.type === "king") {
          board[position.row][position.col] = targetPiece;
        }
        
        if (isValid) return true;
      }
    }
  }
  return false;
};

// Check if king is in check
const isKingInCheck = (board, color) => {
  let kingPosition = null;
  
  // Find the king
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === "king" && piece.color === color) {
        kingPosition = { row, col };
        break;
      }
    }
    if (kingPosition) break;
  }
  
  if (!kingPosition) return true; // King is captured
  
  return isSquareAttacked(board, kingPosition, color);
};

// Check if move puts king in check
const doesMoveExposeKing = (board, from, to, color) => {
  const newBoard = board.map(r => [...r]);
  newBoard[to.row][to.col] = newBoard[from.row][from.col];
  newBoard[from.row][from.col] = null;
  
  return isKingInCheck(newBoard, color);
};

// Check if player has any valid moves (for checkmate/stalemate)
const hasValidMoves = (board, color) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        for (let targetRow = 0; targetRow < 8; targetRow++) {
          for (let targetCol = 0; targetCol < 8; targetCol++) {
            if (isValidMove(board, { row, col }, { row: targetRow, col: targetCol }) &&
                !doesMoveExposeKing(board, { row, col }, { row: targetRow, col: targetCol }, color)) {
              return true;
            }
          }
        }
      }
    }
  }
  return false;
};

// Check for checkmate or stalemate
const checkGameEnd = (board, color) => {
  const inCheck = isKingInCheck(board, color);
  const hasMoves = hasValidMoves(board, color);
  
  if (inCheck && !hasMoves) return "checkmate";
  if (!inCheck && !hasMoves) return "stalemate";
  return null;
};

// Movement validation functions
const isValidMove = (board, from, to, ignoreCheck = false) => {
  const piece = board[from.row][from.col];
  if (!piece) return false;

  const targetPiece = board[to.row][to.col];
  if (targetPiece && targetPiece.color === piece.color) return false;

  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);

  switch (piece.type) {
    case "pawn":
      const direction = piece.color === "white" ? 1 : -1;
      const startRow = piece.color === "white" ? 1 : 6;
      
      // Basic move
      if (from.col === to.col && !targetPiece) {
        // Single move forward
        if (to.row === from.row + direction) return true;
        // Double move from starting position
        if (from.row === startRow && to.row === from.row + 2 * direction && 
            !board[from.row + direction][from.col]) {
          return true;
        }
      }
      // Capture diagonally
      if (colDiff === 1 && rowDiff === 1) {
        // Normal capture
        if (targetPiece && targetPiece.color !== piece.color) return true;
        // En passant
        const adjacentPawn = board[from.row][to.col];
        if (adjacentPawn && adjacentPawn.type === "pawn" && adjacentPawn.color !== piece.color && adjacentPawn.enPassant) {
          return true;
        }
      }
      return false;

    case "knight":
      return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

    case "bishop":
      return rowDiff === colDiff && !hasPiecesBetween(board, from, to);

    case "rook":
      return (rowDiff === 0 || colDiff === 0) && !hasPiecesBetween(board, from, to);

    case "queen":
      return (rowDiff === colDiff || rowDiff === 0 || colDiff === 0) && !hasPiecesBetween(board, from, to);

    case "king":
      // Normal king move
      if (rowDiff <= 1 && colDiff <= 1) return true;
      
      // Castling
      if (rowDiff === 0 && colDiff === 2 && !piece.hasMoved) {
        const rookCol = to.col > from.col ? 7 : 0;
        const rook = board[from.row][rookCol];
        
        if (rook && !rook.hasMoved && rook.type === "rook" && rook.color === piece.color) {
          // Check if path is clear and not under attack
          const step = to.col > from.col ? 1 : -1;
          let col = from.col + step;
          while (col !== rookCol) {
            if (board[from.row][col]) return false;
            if (!ignoreCheck && isSquareAttacked(board, { row: from.row, col }, piece.color)) return false;
            col += step;
          }
          return true;
        }
      }
      return false;

    default:
      return false;
  }
};

const hasPiecesBetween = (board, from, to) => {
  const rowStep = Math.sign(to.row - from.row);
  const colStep = Math.sign(to.col - from.col);
  let row = from.row + rowStep;
  let col = from.col + colStep;

  while (row !== to.row || col !== to.col) {
    if (board[row][col]) return true;
    row += rowStep;
    col += colStep;
  }
  return false;
};

// AI move generation
const generateAllMoves = (board, color) => {
  const moves = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        for (let targetRow = 0; targetRow < 8; targetRow++) {
          for (let targetCol = 0; targetCol < 8; targetCol++) {
            if (isValidMove(board, { row, col }, { row: targetRow, col: targetCol }) &&
                !doesMoveExposeKing(board, { row, col }, { row: targetRow, col: targetCol }, color)) {
              moves.push({
                from: { row, col },
                to: { row: targetRow, col: targetCol }
              });
            }
          }
        }
      }
    }
  }
  return moves;
};

// Evaluate board position for AI
const evaluateBoard = (board) => {
  let score = 0;
  let whiteKingExists = false;
  let blackKingExists = false;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        if (piece.type === "king") {
          if (piece.color === "white") whiteKingExists = true;
          else blackKingExists = true;
        }
        const value = PIECE_VALUES[piece.type];
        score += piece.color === "white" ? value : -value;
      }
    }
  }
  
  // If king is missing, game is over
  if (!whiteKingExists) return -10000;
  if (!blackKingExists) return 10000;
  
  // Add bonus for check
  if (isKingInCheck(board, "black")) score += 5;
  if (isKingInCheck(board, "white")) score -= 5;
  
  return score;
};

// Minimax algorithm for AI
const minimax = (board, depth, isMaximizing, aiLevel, alpha = -Infinity, beta = Infinity) => {
  // Check for terminal state (checkmate/stalemate)
  const gameEnd = checkGameEnd(board, isMaximizing ? "black" : "white");
  if (gameEnd === "checkmate") {
    return { score: isMaximizing ? 10000 : -10000 };
  } else if (gameEnd === "stalemate") {
    return { score: 0 };
  }
  
  // Check if king is captured
  const whiteKingExists = board.some(row => row.some(p => p?.type === "king" && p.color === "white"));
  const blackKingExists = board.some(row => row.some(p => p?.type === "king" && p.color === "black"));
  
  if (!whiteKingExists) return { score: -10000 };
  if (!blackKingExists) return { score: 10000 };
  
  if (depth === 0) {
    return { score: evaluateBoard(board) };
  }

  const color = isMaximizing ? "black" : "white";
  const moves = generateAllMoves(board, color);

  // Add some randomness based on difficulty
  if (Math.random() < aiLevel.randomness && depth === aiLevel.depth) {
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    return { ...randomMove, score: evaluateBoard(board) };
  }

  let bestMove;
  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (const move of moves) {
    const newBoard = board.map(r => [...r]);
    newBoard[move.to.row][move.to.col] = { ...newBoard[move.from.row][move.from.col], hasMoved: true };
    newBoard[move.from.row][move.from.col] = null;

    // Handle en passant
    if (newBoard[move.to.row][move.to.col].type === "pawn") {
      // Clear en passant flags
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (newBoard[r][c]?.type === "pawn") {
            newBoard[r][c].enPassant = false;
          }
        }
      }
      
      // Set en passant if pawn moved 2 squares
      if (Math.abs(move.to.row - move.from.row) === 2) {
        newBoard[move.to.row][move.to.col].enPassant = true;
      }
      
      // Handle en passant capture
      if (Math.abs(move.to.col - move.from.col) === 1 && !board[move.to.row][move.to.col]) {
        newBoard[move.from.row][move.to.col] = null; // Capture the pawn
      }
      
      // Handle promotion (always to queen for simplicity)
      if (move.to.row === 0 || move.to.row === 7) {
        newBoard[move.to.row][move.to.col] = { 
          type: "queen", 
          color: newBoard[move.to.row][move.to.col].color,
          symbol: newBoard[move.to.row][move.to.col].color === "white" ? "♕" : "♛",
          hasMoved: true
        };
      }
    }

    const result = minimax(newBoard, depth - 1, !isMaximizing, aiLevel, alpha, beta);
    const currentScore = result.score;

    if (isMaximizing) {
      if (currentScore > bestScore) {
        bestScore = currentScore;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestScore);
    } else {
      if (currentScore < bestScore) {
        bestScore = currentScore;
        bestMove = move;
      }
      beta = Math.min(beta, bestScore);
    }
    
    if (beta <= alpha) break; // Alpha-beta pruning
  }

  return { ...bestMove, score: bestScore };
};

function ChessBoard() {
  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState("white");
  const [status, setStatus] = useState("White's turn");
  const [gameMode, setGameMode] = useState("human"); // 'human' or 'ai'
  const [aiLevel, setAiLevel] = useState("medium");
  const [whiteTime, setWhiteTime] = useState(0);
  const [blackTime, setBlackTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [checkStatus, setCheckStatus] = useState(null);
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
  const [moveHistory, setMoveHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Timer effect
  useEffect(() => {
    if (!gameStarted || gameEnded || (gameMode === "ai" && currentPlayer === "black")) return;

    const timer = setInterval(() => {
      if (currentPlayer === "white") {
        setWhiteTime(prev => prev + 0.1);
      } else {
        setBlackTime(prev => prev + 0.1);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [currentPlayer, gameStarted, gameMode, gameEnded]);

  // AI move effect
  useEffect(() => {
    if (gameMode === "ai" && currentPlayer === "black" && gameStarted && !gameEnded) {
      const timer = setTimeout(() => {
        const aiMove = minimax(board, AI_LEVELS[aiLevel].depth, true, AI_LEVELS[aiLevel]);
        
        if (aiMove) {
          makeMove(aiMove.from, aiMove.to, "black");
        }
      }, 500); // AI "thinking" time

      return () => clearTimeout(timer);
    }
  }, [board, currentPlayer, gameMode, gameStarted, aiLevel, gameEnded]);

  // Check for check/checkmate after each move
  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    
    const opponentColor = currentPlayer === "white" ? "black" : "white";
    const gameEnd = checkGameEnd(board, opponentColor);
    
    if (gameEnd === "checkmate") {
      endGame(`${currentPlayer === "white" ? "White" : "Black"} wins by checkmate!`);
    } else if (gameEnd === "stalemate") {
      endGame("Game ended in stalemate!");
    } else if (isKingInCheck(board, opponentColor)) {
      setCheckStatus(`${opponentColor === "white" ? "White" : "Black"} king is in check!`);
    } else {
      setCheckStatus(null);
    }
  }, [board, currentPlayer, gameStarted, gameEnded]);

  // Check if king is captured
  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    
    const whiteKingExists = board.some(row => row.some(p => p?.type === "king" && p.color === "white"));
    const blackKingExists = board.some(row => row.some(p => p?.type === "king" && p.color === "black"));
    
    if (!whiteKingExists) {
      endGame("Black wins by capturing the king!");
    } else if (!blackKingExists) {
      endGame("White wins by capturing the king!");
    }
  }, [board, gameStarted, gameEnded]);

  const endGame = (message) => {
    setStatus(message);
    setGameEnded(true);
  };

  const makeMove = (from, to, playerColor) => {
    const newBoard = board.map(r => [...r]);
    const piece = newBoard[from.row][from.col];
    let capturedPiece = newBoard[to.row][to.col];
    let newCapturedPieces = { ...capturedPieces };
    
    // Handle castling
    if (piece.type === "king" && Math.abs(from.col - to.col) === 2) {
      // Move rook
      const rookCol = to.col > from.col ? 7 : 0;
      const newRookCol = to.col > from.col ? 5 : 3;
      newBoard[from.row][newRookCol] = { ...newBoard[from.row][rookCol], hasMoved: true };
      newBoard[from.row][rookCol] = null;
    }
    
    // Handle en passant
    if (piece.type === "pawn" && Math.abs(to.col - from.col) === 1 && !capturedPiece) {
      // En passant capture
      capturedPiece = newBoard[from.row][to.col];
      newBoard[from.row][to.col] = null;
    }
    
    // Move the piece
    newBoard[to.row][to.col] = { ...piece, hasMoved: true };
    newBoard[from.row][from.col] = null;
    
    // Handle pawn promotion (always to queen for simplicity)
    if (piece.type === "pawn" && (to.row === 0 || to.row === 7)) {
      newBoard[to.row][to.col] = { 
        type: "queen", 
        color: piece.color,
        symbol: piece.color === "white" ? "♕" : "♛",
        hasMoved: true
      };
    }
    
    // Clear en passant flags
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (newBoard[r][c]?.type === "pawn") {
          newBoard[r][c].enPassant = false;
        }
      }
    }
    
    // Set en passant if pawn moved 2 squares
    if (piece.type === "pawn" && Math.abs(to.row - from.row) === 2) {
      newBoard[to.row][to.col].enPassant = true;
    }
    
    // Add captured piece to list
    if (capturedPiece) {
      newCapturedPieces = {
        ...capturedPieces,
        [playerColor]: [...capturedPieces[playerColor], capturedPiece]
      };
    }
    
    // Update move history
    const newMoveHistory = [...moveHistory.slice(0, historyIndex + 1), {
      board: board.map(r => [...r]),
      capturedPieces,
      currentPlayer,
      status,
      checkStatus
    }];
    
    setBoard(newBoard);
    setCapturedPieces(newCapturedPieces);
    setLastMove({ from, to });
    setSelected(null);
    setMoveHistory(newMoveHistory);
    setHistoryIndex(newMoveHistory.length - 1);
    
    const nextPlayer = playerColor === "white" ? "black" : "white";
    setCurrentPlayer(nextPlayer);
    setStatus(`${nextPlayer.charAt(0).toUpperCase() + nextPlayer.slice(1)}'s turn`);
  };

  const handleClick = (row, col) => {
    if (!gameStarted || gameEnded) return;
    if (gameMode === "ai" && currentPlayer === "black") return;

    const piece = board[row][col];

    // If no piece is selected and clicked square has current player's piece
    if (!selected && piece && piece.color === currentPlayer) {
      setSelected({ row, col });
      return;
    }

    // If same square is clicked again
    if (selected && selected.row === row && selected.col === col) {
      setSelected(null);
      return;
    }

    // If a piece is already selected
    if (selected) {
      const moveValid = isValidMove(board, selected, { row, col });

      if (moveValid) {
        if (doesMoveExposeKing(board, selected, { row, col }, currentPlayer)) {
          setSelected(null);
          return;
        }
        
        makeMove(selected, { row, col }, currentPlayer);
      } else {
        // If clicked on another piece of current player, select that instead
        if (piece && piece.color === currentPlayer) {
          setSelected({ row, col });
        } else {
          setSelected(null);
        }
      }
    }
  };

  const startGame = (mode) => {
    setGameMode(mode);
    setBoard(initialBoard());
    setSelected(null);
    setCurrentPlayer("white");
    setStatus("White's turn");
    setWhiteTime(0);
    setBlackTime(0);
    setGameStarted(true);
    setGameEnded(false);
    setLastMove(null);
    setCheckStatus(null);
    setCapturedPieces({ white: [], black: [] });
    setMoveHistory([]);
    setHistoryIndex(-1);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}.${tenths}`;
  };

  const undoMove = () => {
    if (historyIndex < 0) return;
    
    const historyState = moveHistory[historyIndex];
    setBoard(historyState.board.map(r => [...r]));
    setCapturedPieces(historyState.capturedPieces);
    setCurrentPlayer(historyState.currentPlayer);
    setStatus(historyState.status);
    setCheckStatus(historyState.checkStatus);
    setSelected(null);
    setHistoryIndex(historyIndex - 1);
    setGameEnded(false);
  };

  const redoMove = () => {
    if (historyIndex >= moveHistory.length - 1) return;
    
    const historyState = moveHistory[historyIndex + 1];
    setBoard(historyState.board.map(r => [...r]));
    setCapturedPieces(historyState.capturedPieces);
    setCurrentPlayer(historyState.currentPlayer);
    setStatus(historyState.status);
    setCheckStatus(historyState.checkStatus);
    setSelected(null);
    setHistoryIndex(historyIndex + 1);
    setGameEnded(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 text-white">
      <h1 className="text-4xl font-bold mb-6 text-yellow-400">Chess Master</h1>
      
      {!gameStarted ? (
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Select Game Mode</h2>
          <div className="space-y-4">
            <button
              onClick={() => startGame("human")}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
            >
              Player vs Player
            </button>
            <button
              onClick={() => startGame("ai")}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
            >
              Play vs AI
            </button>
          </div>
          
          {gameMode === "ai" && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">AI Difficulty:</h3>
              <div className="flex justify-between gap-2">
                {Object.keys(AI_LEVELS).map(level => (
                  <button
                    key={level}
                    onClick={() => setAiLevel(level)}
                    className={`flex-1 py-2 rounded-lg font-medium ${
                      aiLevel === level 
                        ? 'bg-yellow-500 text-gray-900' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl">
          <div className="flex-1">
            <div className="flex justify-between w-full mb-4">
              <div className={`p-3 rounded-lg ${currentPlayer === "white" ? 'bg-blue-700' : 'bg-gray-700'}`}>
                <div className="font-bold">White</div>
                <div className="text-2xl font-mono">{formatTime(whiteTime)}</div>
              </div>
              
              <div className="bg-gray-800 px-6 py-3 rounded-lg flex items-center">
                <div className="text-xl font-bold text-center">
                  <div>{status}</div>
                  {checkStatus && <div className="text-red-400 text-sm">{checkStatus}</div>}
                </div>
              </div>
              
              <div className={`p-3 rounded-lg ${currentPlayer === "black" ? 'bg-blue-700' : 'bg-gray-700'}`}>
                <div className="font-bold">Black</div>
                <div className="text-2xl font-mono">{formatTime(blackTime)}</div>
              </div>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-8 border-4 border-yellow-600 rounded-lg overflow-hidden shadow-2xl">
                {board.map((row, rowIndex) =>
                  row.map((piece, colIndex) => {
                    const isDark = (rowIndex + colIndex) % 2 === 1;
                    const isSelected = selected && selected.row === rowIndex && selected.col === colIndex;
                    const isValidTarget = selected && isValidMove(board, selected, { row: rowIndex, col: colIndex }) &&
                      !doesMoveExposeKing(board, selected, { row: rowIndex, col: colIndex }, currentPlayer);
                    const isLastMoveFrom = lastMove && lastMove.from.row === rowIndex && lastMove.from.col === colIndex;
                    const isLastMoveTo = lastMove && lastMove.to.row === rowIndex && lastMove.to.col === colIndex;

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleClick(rowIndex, colIndex)}
                        className={`w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center text-2xl select-none cursor-pointer transition-all ${
                          isDark ? "bg-gray-700" : "bg-gray-400"
                        } ${
                          isSelected ? "bg-yellow-500" : 
                          isValidTarget ? (piece ? "bg-red-500" : "bg-yellow-300") : ""
                        } ${
                          isLastMoveFrom ? "bg-blue-400" : isLastMoveTo ? "bg-green-400" : ""
                        }`}
                      >
                        {piece && (
                          <div className={`${piece.color === "white" ? "text-white" : "text-gray-900"} transition-transform hover:scale-125`}>
                            {piece.symbol}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Coordinates */}
              <div className="absolute -left-6 top-0 h-full flex flex-col justify-between text-gray-400">
                {[8,7,6,5,4,3,2,1].map(num => (
                  <div key={`row-${num}`} className="h-[calc(12.5%-1px)] flex items-center">
                    {num}
                  </div>
                ))}
              </div>
              <div className="absolute -bottom-8 left-0 w-full flex justify-between px-1 text-gray-400">
                {['a','b','c','d','e','f','g','h'].map(letter => (
                  <div key={`col-${letter}`} className="w-[calc(12.5%-1px)] text-center">
                    {letter}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 flex gap-4 justify-center">
              <button 
                onClick={undoMove}
                disabled={historyIndex < 0}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  historyIndex < 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Undo
              </button>
              <button 
                onClick={redoMove}
                disabled={historyIndex >= moveHistory.length - 1}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  historyIndex >= moveHistory.length - 1 ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Redo
              </button>
              <button 
                onClick={() => startGame(gameMode)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all"
              >
                New Game
              </button>
              <button 
                onClick={() => setGameStarted(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-bold transition-all"
              >
                Main Menu
              </button>
            </div>
          </div>
          
          <div className="lg:w-64">
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <h3 className="font-bold text-lg mb-2">Game Info</h3>
              <p className="text-sm text-gray-300">
                {gameMode === "ai" ? 
                  `Playing against ${aiLevel} AI` : 
                  "Player vs Player mode"}
              </p>
              <p className="text-sm text-gray-300 mt-1">
                {currentPlayer === "white" ? "White to move" : "Black to move"}
              </p>
              {gameEnded && (
                <p className="text-yellow-400 font-bold mt-2">
                  Game Over: {status}
                </p>
              )}
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <h3 className="font-bold text-lg mb-2">Captured by White</h3>
              <div className="flex flex-wrap gap-1 min-h-8">
                {capturedPieces.white.map((piece, i) => (
                  <div key={`white-captured-${i}`} className="text-xl">
                    {piece.symbol}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Captured by Black</h3>
              <div className="flex flex-wrap gap-1 min-h-8">
                {capturedPieces.black.map((piece, i) => (
                  <div key={`black-captured-${i}`} className="text-xl">
                    {piece.symbol}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChessBoard;