import React from "react";
import  StonePaperScissors  from "./components/StonePaperScissors";
import  TicTacToe   from "./components/TicTacToe ";
import  SnakeGame from "./components/SnakeGame";
import ChessBoard from "./components/ChessBoard"
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";

function App() {
  return (
    <div className="">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home  />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/games/stone_paper_scissor" element={<StonePaperScissors />} />
          <Route path="/games/tic_tac_toe" element={<TicTacToe  />} />
          <Route path="/games/SnakeGame" element={<SnakeGame  />} />
          <Route path="/games/ChessBoard" element={<ChessBoard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
