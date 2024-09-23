import React from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";

import Home from "./routes/Home";

import "./App.css";

import Banner from "./routes/Banner";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/banner" element={<Banner />} />
      </Routes>
    </Router>
  );
}

export default App;
