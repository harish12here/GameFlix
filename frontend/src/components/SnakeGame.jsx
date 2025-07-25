import React, { useState, useEffect, useRef } from "react";

// Board size
const BOARD_SIZE = 15;
const CELL_SIZE = 24;
const BOARD_PADDING = 2;

const getRandomPosition = () => ({
  x: Math.floor(Math.random() * BOARD_SIZE),
  y: Math.floor(Math.random() * BOARD_SIZE),
});

// Speed presets
const SPEED_LEVELS = {
  easy: 200,
  medium: 150,
  fast: 100,
  insane: 70
};

// Snake skins
const SNAKE_SKINS = {
  classic: {
    head: "bg-green-700",
    body: "bg-green-600",
    name: "Classic Green"
  },
  fire: {
    head: "bg-red-700",
    body: "bg-orange-500",
    name: "Fire Snake"
  },
  ice: {
    head: "bg-blue-400",
    body: "bg-cyan-300",
    name: "Ice Snake"
  },
  venom: {
    head: "bg-purple-700",
    body: "bg-purple-500",
    name: "Venom Snake"
  },
  gold: {
    head: "bg-yellow-500",
    body: "bg-yellow-300",
    name: "Golden Snake"
  }
};

function SnakeGame() {
  const [snake, setSnake] = useState([{ x: 7, y: 7 }]);
  const [food, setFood] = useState(getRandomPosition());
  const [superFood, setSuperFood] = useState(null);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speedLevel, setSpeedLevel] = useState("medium");
  const [gameStarted, setGameStarted] = useState(false);
  const [foodCount, setFoodCount] = useState(0);
  const [selectedSkin, setSelectedSkin] = useState("classic");
  const [highlightReplay, setHighlightReplay] = useState([]);
  const [showHighlight, setShowHighlight] = useState(false);
  const boardRef = useRef(null);

  // Get current speed based on level
  const speed = SPEED_LEVELS[speedLevel];
  const skin = SNAKE_SKINS[selectedSkin];

  // Generate food that doesn't overlap with snake
  const generateFood = () => {
    let newFood;
    do {
      newFood = getRandomPosition();
    } while (
      snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
      (superFood && superFood.x === newFood.x && superFood.y === newFood.y)
    );
    return newFood;
  };

  // Generate super food
  const generateSuperFood = () => {
    let newSuperFood;
    do {
      newSuperFood = getRandomPosition();
    } while (
      snake.some(segment => segment.x === newSuperFood.x && segment.y === newSuperFood.y) ||
      (food.x === newSuperFood.x && food.y === newSuperFood.y)
    );
    
    setSuperFood(newSuperFood);
    
    // Super food disappears after 5 seconds
    setTimeout(() => {
      setSuperFood(prev => (prev && prev.x === newSuperFood.x && prev.y === newSuperFood.y) ? null : prev);
    }, 5000);
  };

  // Record game highlight
  const recordHighlight = (action) => {
    setHighlightReplay(prev => [
      ...prev,
      {
        snake: [...snake],
        food: {...food},
        superFood: superFood ? {...superFood} : null,
        action,
        timestamp: Date.now()
      }
    ]);
  };

  // Move snake
  const moveSnake = () => {
    if (!gameStarted || isPaused || gameOver) return;
    
    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      head.x += direction.x;
      head.y += direction.y;

      // Check collision with wall
      if (head.x < 0 || head.y < 0 || head.x >= BOARD_SIZE || head.y >= BOARD_SIZE) {
        recordHighlight("game-over-wall");
        setGameOver(true);
        return prevSnake;
      }

      // Check collision with self (skip the tail during movement)
      for (let i = 1; i < newSnake.length - 1; i++) {
        if (newSnake[i].x === head.x && newSnake[i].y === head.y) {
          recordHighlight("game-over-self");
          setGameOver(true);
          return prevSnake;
        }
      }

      newSnake.unshift(head);

      // Check if eating normal food
      if (head.x === food.x && head.y === food.y) {
        recordHighlight("eat-food");
        setFood(generateFood());
        setScore(prev => prev + 10);
        setFoodCount(prev => prev + 1);
        
        // Every 5 foods, spawn super food
        if ((foodCount + 1) % 5 === 0) {
          generateSuperFood();
        }
      } 
      // Check if eating super food
      else if (superFood && head.x === superFood.x && head.y === superFood.y) {
        recordHighlight("eat-super-food");
        setSuperFood(null);
        setScore(prev => prev + 30); // Super food worth 3x normal food
        setFoodCount(prev => prev + 1);
      } 
      else {
        newSnake.pop();
      }

      return newSnake;
    });
  };

  // Game loop
  useEffect(() => {
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [direction, food, superFood, gameOver, isPaused, gameStarted, speed]);

  // Update high score when game ends
  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
    }
  }, [gameOver, score, highScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted && e.key === " ") {
        setGameStarted(true);
        return;
      }
      
      if (gameOver || !gameStarted) return;
      
      switch (e.key) {
        case "ArrowUp":
          if (direction.y === 1) break;
          recordHighlight("move-up");
          setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (direction.y === -1) break;
          recordHighlight("move-down");
          setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (direction.x === 1) break;
          recordHighlight("move-left");
          setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (direction.x === -1) break;
          recordHighlight("move-right");
          setDirection({ x: 1, y: 0 });
          break;
        case " ":
          setIsPaused(prev => !prev);
          break;
        default:
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, gameOver, gameStarted]);

  // Touch controls for mobile
  const handleTouchStart = (e) => {
    if (!gameStarted) {
      setGameStarted(true);
      return;
    }
    
    if (gameOver) return;
    
    const touch = e.touches[0];
    const boardRect = boardRef.current.getBoundingClientRect();
    const touchX = touch.clientX - boardRect.left;
    const touchY = touch.clientY - boardRect.top;
    const head = snake[0];
    
    // Get relative position to head
    const headX = head.x * CELL_SIZE + CELL_SIZE / 2;
    const headY = head.y * CELL_SIZE + CELL_SIZE / 2;
    
    const diffX = touchX - headX;
    const diffY = touchY - headY;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (diffX > 0 && direction.x !== -1) {
        recordHighlight("move-right");
        setDirection({ x: 1, y: 0 });
      } else if (diffX < 0 && direction.x !== 1) {
        recordHighlight("move-left");
        setDirection({ x: -1, y: 0 });
      }
    } else {
      // Vertical swipe
      if (diffY > 0 && direction.y !== -1) {
        recordHighlight("move-down");
        setDirection({ x: 0, y: 1 });
      } else if (diffY < 0 && direction.y !== 1) {
        recordHighlight("move-up");
        setDirection({ x: 0, y: -1 });
      }
    }
  };

  const resetGame = () => {
    setSnake([{ x: 7, y: 7 }]);
    setFood(generateFood());
    setSuperFood(null);
    setDirection({ x: 1, y: 0 });
    setGameOver(false);
    setScore(0);
    setFoodCount(0);
    setGameStarted(false);
    setIsPaused(false);
    setHighlightReplay([]);
    setShowHighlight(false);
  };

  const playHighlight = () => {
    setShowHighlight(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < highlightReplay.length) {
        const frame = highlightReplay[i];
        setSnake(frame.snake);
        setFood(frame.food);
        setSuperFood(frame.superFood);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowHighlight(false), 1000);
      }
    }, 200); // Playback speed
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-green-700 flex items-center">
            <span className="mr-2">🐍</span> Snake Game
          </h1>
          <div className="flex flex-col items-end">
            <div className="bg-green-100 px-3 py-1 rounded-full text-green-800 font-semibold mb-1">
              Score: {score}
            </div>
            <div className="bg-purple-100 px-3 py-1 rounded-full text-purple-800 font-semibold text-sm">
              High Score: {highScore}
            </div>
          </div>
        </div>
        
        {/* Snake skin selector */}
        {!gameStarted && (
          <div className="mb-4">
            <p className="text-gray-600 mb-2 text-center">Choose Your Snake:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {Object.entries(SNAKE_SKINS).map(([key, skin]) => (
                <button
                  key={key}
                  onClick={() => setSelectedSkin(key)}
                  className={`px-3 py-1 rounded-full text-sm flex items-center ${
                    selectedSkin === key 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <span 
                    className={`w-3 h-3 rounded-full mr-2 ${skin.head}`}
                  ></span>
                  {skin.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Speed selector */}
        {!gameStarted && (
          <div className="mb-4">
            <p className="text-gray-600 mb-2 text-center">Select Speed:</p>
            <div className="flex justify-center gap-2">
              {Object.keys(SPEED_LEVELS).map(level => (
                <button
                  key={level}
                  onClick={() => setSpeedLevel(level)}
                  className={`px-3 py-1 rounded-full text-sm capitalize ${
                    speedLevel === level 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div 
          ref={boardRef}
          className={`relative mx-auto mb-4 overflow-hidden rounded-lg shadow-inner bg-green-50 border-2 ${
            showHighlight ? "border-yellow-400" : "border-green-200"
          }`}
          style={{
            width: BOARD_SIZE * CELL_SIZE + BOARD_PADDING * 2,
            height: BOARD_SIZE * CELL_SIZE + BOARD_PADDING * 2,
          }}
          onTouchStart={handleTouchStart}
        >
          {/* Normal food */}
          <div
            className="absolute rounded-full bg-red-500 shadow-md"
            style={{
              width: CELL_SIZE - 4,
              height: CELL_SIZE - 4,
              left: food.x * CELL_SIZE + BOARD_PADDING + 2,
              top: food.y * CELL_SIZE + BOARD_PADDING + 2,
              transition: "all 0.1s ease",
            }}
          />
          
          {/* Super food */}
          {superFood && (
            <div
              className="absolute rounded-full bg-yellow-500 shadow-md animate-ping"
              style={{
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                left: superFood.x * CELL_SIZE + BOARD_PADDING + 1,
                top: superFood.y * CELL_SIZE + BOARD_PADDING + 1,
                transition: "all 0.1s ease",
              }}
            />
          )}
          
          {/* Snake segments */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className={`absolute rounded-md ${
                index === 0 ? skin.head : skin.body
              }`}
              style={{
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                left: segment.x * CELL_SIZE + BOARD_PADDING + 1,
                top: segment.y * CELL_SIZE + BOARD_PADDING + 1,
                transition: "all 0.1s ease",
                zIndex: snake.length - index,
                transform: index === 0 ? 'scale(1.1)' : 'scale(1)',
                boxShadow: index === 0 ? '0 0 8px rgba(0,0,0,0.3)' : 'none',
              }}
            />
          ))}
        </div>
        
        {/* Food counter */}
        {gameStarted && !gameOver && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-blue-700 font-medium mr-2">Next Super Food:</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 mx-1 rounded-full ${i < foodCount % 5 ? 'bg-blue-500' : 'bg-blue-200'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {!gameStarted && !gameOver && (
          <div className="text-center mb-4">
            <p className="text-gray-600 mb-2">Press SPACE or tap the board to start</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setGameStarted(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
              >
                Start Game
              </button>
            </div>
          </div>
        )}
        
        {gameOver && (
          <div className="text-center mb-4">
            <p className="text-red-600 font-bold text-xl mb-2">Game Over!</p>
            <p className="text-gray-700 mb-4">Final Score: {score}</p>
            
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
              >
                Play Again
              </button>
              
              {highlightReplay.length > 0 && (
                <button
                  onClick={playHighlight}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition"
                >
                  Watch Highlight
                </button>
              )}
            </div>
            
            {highlightReplay.length > 0 && showHighlight && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm text-yellow-800 mb-2">
                Playing your last game highlight...
              </div>
            )}
          </div>
        )}
        
        {gameStarted && !gameOver && (
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsPaused(prev => !prev)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
            >
              Restart
            </button>
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-500">
          <p className="text-center">Controls: Arrow Keys or Swipe</p>
          <p className="text-center">Space to pause/resume</p>
          <p className="text-center text-xs mt-2">
            Super Food (yellow) appears every 5 foods and gives 3x points!
          </p>
        </div>
      </div>
    </div>
  );
}
export default SnakeGame;