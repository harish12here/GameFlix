import React from "react";
import { Link } from "react-router-dom";

function Home() {
  const games = [
    { name: "Stone Paper Scissors", path: "/games/stone_paper_scissor" },
    { name: "Tic Tac Toe", path: "/games/tic_tac_toe" },
    { name: "Snake Game", path: "/games/SnakeGame" },
    { name: "Chess Board", path: "/games/ChessBoard" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-300 to-purple-300 p-4">
      <h2 className="text-3xl font-bold mb-8">🎮 Welcome to My Gaming App 🎮</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {games.map((game, index) => (
          <Link
            key={index}
            to={game.path}
            className="bg-white rounded-2xl shadow-lg p-6 w-48 h-48 flex flex-col items-center justify-center text-center hover:scale-105 transform transition cursor-pointer"
          >
            <div className="text-2xl font-semibold mb-2">{game.name}</div>
            <div className="text-sm text-gray-500">Click to Play</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
