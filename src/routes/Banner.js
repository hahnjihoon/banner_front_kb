import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { fileUploadSelectedImg, fileUploadAllTag } from "../api/fileUploadToS3";

const apikey = process.env.REACT_APP_APIKEY;

export default function Banner() {
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(100);
  const [padding, setPadding] = useState(10);
  const [alignItems, setalignItems] = useState("center");
  const [title, setTitle] = useState("This is a banner!");
  const [titleFontSize, setTitleFontSize] = useState(16);
  const [subtitle, setSubtitle] = useState("");
  const [subtitleFontSize, setSubtitleFontSize] = useState(12);
  const [backgroundColor, setBackgroundColor] = useState("#ffe157");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [titleColor, setTitleColor] = useState("#000000");
  const [subtitleColor, setSubtitleColor] = useState("#555555");

  const [imageUrl, setImageUrl] = useState(""); //이게 test2의 imageSrc
  const [imageWidth, setImageWidth] = useState(100);
  const [imageHeight, setImageHeight] = useState(100);
  const [imagePositionX, setImagePositionX] = useState(0);
  const [imagePositionY, setImagePositionY] = useState(0);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false); //ai 이미지생성중
  const [imageUrls, setImageUrls] = useState([]); //ai 생성된 이미지들
  const [selectedImageUrl, setSelectedImageUrl] = useState("");

  const [base64Image, setBase64Image] = useState(null);
  // const [imageSrc, setImageSrc] = useState(null);
  const [isCaptured, setIsCaptured] = useState(false); //이기술의핵심 졸라중요
  // 로컬에 저장시키고 그때만 ture로 바꿈

  const bannerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    padding: `${padding}px`,
    justifyContent: "center",
    backgroundColor: backgroundColor,
    display: "flex",
    alignItems: alignItems,
    border: "1px solid #ccc",
    fontFamily: fontFamily,
    flexDirection: "column",
    boxSizing: "border-box",
    position: "relative"
  };

  const titleStyle = {
    fontSize: `${titleFontSize}px`,
    color: titleColor
  };

  const subtitleStyle = {
    fontSize: `${subtitleFontSize}px`,
    color: subtitleColor
  };

  const imageStyle = {
    position: "absolute",
    top: `${imagePositionY}px`,
    left: `${imagePositionX}px`,
    width: `${imageWidth}px`,
    height: `${imageHeight}px`
  };

  const makeImageFromAi = async (e) => {
    e.preventDefault();
    setLoading(true);
    setImageUrls([]);

    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: apikey
          Authorization: apikey
        },
        body: JSON.stringify({
          prompt: prompt,
          n: 3,
          size: "256x256"
        })
      });

      const data = await res.json();
      const urls = data.data.map((imageData) => imageData.url);
      setImageUrls(urls);
    } catch (error) {
      console.error("Error:", error);
      setImageUrls(["Error generating images."]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelection = (url) => {
    setSelectedImageUrl(url);
    setImageUrl(url);
  };

  const saveCustomBanner = async () => {
    try {
      console.log("저장 실행 시작::", selectedImageUrl);

      let width = 0;
      let height = 0;

      // selectedImageUrl이 있을 때만 fileUploadSelectedImg 실행
      if (selectedImageUrl) {
        const response = await fileUploadSelectedImg(selectedImageUrl);

        console.log("서버 응답:", response);
        setBase64Image(response.base64Image);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setIsCaptured(true);

      const element = document.getElementById("customBanner");

      if (!element) {
        console.error("customBanner 요소를 찾을 수 없습니다.");
        return;
      }

      if (element) {
        const rect = element.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기

      const canvas = await html2canvas(element, {
        width: width,
        height: height,
        scale: 1,
        useCORS: true, // CORS 관련 문제 해결
        logging: true,
        backgroundColor: null // 투명 배경 설정
      });

      const dataURL = canvas.toDataURL("image/png");

      // 파일명때문에 현재 시간 시분초
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const fileName = `banner${hours}${minutes}${seconds}.png`;

      await fileUploadAllTag(dataURL, fileName);
      setIsCaptured(false);
    } catch (error) {
      console.error("이미지 업로드 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    if (base64Image) {
      // base64 데이터를 Blob으로 변환
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });

      // Blob을 Object URL로 변환하여 이미지로 표시
      const imageUrlBlob = URL.createObjectURL(blob);
      setImageUrl(imageUrlBlob);

      // 메모리 누수를 방지하기 위해 URL 해제
      return () => URL.revokeObjectURL(imageUrlBlob);
    }
  }, [base64Image]);

  useEffect(() => {
    if (imageUrl) {
      setSelectedImageUrl(imageUrl);
    }
  }, [imageUrl]); //이거하나로 ai생성들중 선택한것도 나오고 , imageurl 인풋에 직접입력한것도 나옴

  // console.log("현재이미지url :: ", imageUrl);
  // console.log("현재isCaptured :: ", isCaptured);

  return (
    <div>
      <form style={{ marginBottom: "20px" }}>
        <div>
          <label>Width (px): </label>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />
        </div>
        <div>
          <label>Height (px): </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>
        <div>
          <label>Padding (px): </label>
          <input
            type="number"
            value={padding}
            onChange={(e) => setPadding(e.target.value)}
          />
        </div>
        <br></br>
        <div>
          <label>Title: </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label>Subtitle: </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>
        <br></br>

        <div>
          <label>Title Font Size (px): </label>
          <input
            type="number"
            value={titleFontSize}
            onChange={(e) => setTitleFontSize(e.target.value)}
          />
        </div>
        <div>
          <label>Title Color: </label>
          <input
            type="color"
            value={titleColor}
            onChange={(e) => setTitleColor(e.target.value)}
          />
        </div>
        <br></br>
        <div>
          <label>Subtitle Font Size (px): </label>
          <input
            type="number"
            value={subtitleFontSize}
            onChange={(e) => setSubtitleFontSize(e.target.value)}
          />
        </div>
        <div>
          <label>Subtitle Color: </label>
          <input
            type="color"
            value={subtitleColor}
            onChange={(e) => setSubtitleColor(e.target.value)}
          />
        </div>
        <br></br>
        <div>
          <label>TEXT Align: </label>
          <select
            value={alignItems}
            onChange={(e) => setalignItems(e.target.value)}
          >
            <option value="start">Left</option>
            <option value="center">Center</option>
            <option value="flex-end">Right</option>
          </select>
        </div>
        <div>
          <label>TEXT Font: </label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          >
            <option value="Arial">Arial</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>
        <br></br>
        <div>
          <label>Background Color: </label>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
        </div>
        <br></br>
        <div>
          <label>Image URL: </label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
        <div>
          <label>Image Width (px): </label>
          <input
            type="number"
            value={imageWidth}
            onChange={(e) => setImageWidth(e.target.value)}
          />
        </div>
        <div>
          <label>Image Height (px): </label>
          <input
            type="number"
            value={imageHeight}
            onChange={(e) => setImageHeight(e.target.value)}
          />
        </div>
        <div>
          <label>Image Position X (px): </label>
          <input
            type="number"
            value={imagePositionX}
            onChange={(e) => setImagePositionX(e.target.value)}
          />
        </div>
        <div>
          <label>Image Position Y (px): </label>
          <input
            type="number"
            value={imagePositionY}
            onChange={(e) => setImagePositionY(e.target.value)}
          />
        </div>
      </form>

      {/* Banner output */}
      <div id="customBanner" style={bannerStyle}>
        <div style={titleStyle}>{title}</div>
        {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
        {imageUrl && (
          <img
            src={isCaptured ? imageUrl : selectedImageUrl}
            alt="wrong img addr"
            style={imageStyle}
          />
        )}
      </div>
      <br />
      <br />
      <br />
      <button onClick={saveCustomBanner}>배너저장</button>
      <br />
      <br />
      <br />
      <form onSubmit={makeImageFromAi}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter prompt for image generation"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Image"}
        </button>
      </form>
      {imageUrls.length > 0 && (
        <div>
          <h3>Generated Images:</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            {imageUrls.map((url, index) => (
              <div key={index}>
                <img
                  src={url}
                  alt={`Generated ${index + 1}`}
                  style={{
                    maxWidth: "150px",
                    maxHeight: "150px",
                    cursor: "pointer",
                    border: selectedImageUrl === url ? "3px solid red" : "none"
                  }}
                  onClick={() => handleImageSelection(url)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
