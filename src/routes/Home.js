// Home.js
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>

      <div>배너 생성</div>
      <div>
        <button onClick={() => handleNavigate("/banner")}>bannerpage go</button>
      </div>
    </div>
  );
}
