import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";
// import { fileUploadToS3 } from "../api/fileUploadToS3";
import { fileUploadSelectedImg, fileUploadAllTag } from "../api/fileUploadToS3";

const apikey = process.env.REACT_APP_APIKEY;

export default function Test1() {
  const [prompt, setPrompt] = useState(""); // 이미지 생성을 위한 프롬프트
  const [imageUrls, setImageUrls] = useState([]); // 생성된 이미지의 URL
  const [loading, setLoading] = useState(false); // 로딩 상태

  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [base64Image, setBase64Image] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);

  const [isCaptured, setIsCaptured] = useState(false); //이기술의핵심 졸라중요

  const makeImageFromAi = async (e) => {
    e.preventDefault();
    setLoading(true);
    setImageUrls([]); // 초기화
    console.log("프롬프트:: ", prompt);

    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apikey
        },
        body: JSON.stringify({
          prompt: prompt, // 사용자 프롬프트
          n: 3, // 생성할 이미지 수
          size: "256x256" // 이미지 크기
        })
      });

      const data = await res.json();
      console.log("ddddd", data);
      const urls = data.data.map((imageData) => imageData.url); // 3개의 이미지 URL 추출
      setImageUrls(urls); // 이미지 URL 설정
    } catch (error) {
      console.error("Error:", error);
      setImageUrls(["Error generating images."]);
    } finally {
      setLoading(false);
    }
  };

  const saveSelecteAndAllTag = async () => {
    try {
      console.log("저장 실행 시작::", selectedImageUrl);

      // selectedImageUrl을 fileUploadSelectedImg 함수에 전달
      const response = await fileUploadSelectedImg(selectedImageUrl);

      console.log("서버 응답:", response);
      setBase64Image(response.base64Image);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsCaptured(true);

      const element = document.getElementById("innerView");
      const { width, height } = element.getBoundingClientRect();

      await new Promise((resolve) => setTimeout(resolve, 1000)); // 0.5초 대기

      const canvas = await html2canvas(element, {
        width: width,
        height: height,
        scale: 1,
        useCORS: true, // CORS 관련 문제 해결
        logging: true,
        backgroundColor: null // 투명 배경 설정
      });
      const dataURL = canvas.toDataURL("image/png");
      await fileUploadAllTag(dataURL, "finalSaveImage.png");
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
      const imageUrl = URL.createObjectURL(blob);
      setImageSrc(imageUrl);

      // 메모리 누수를 방지하기 위해 URL 해제
      return () => URL.revokeObjectURL(imageUrl);
    }
  }, [base64Image]);

  return (
    <div>
      <div
        id="capture"
        style={{
          padding: "20px",
          backgroundColor: "#fff",
          fontFamily: "PTBandocheB",
          width: "460px",
          height: "160px",
          position: "relative"
        }}
      >
        <div
          id="innerView"
          style={{
            position: "relative",
            width: "460px",
            height: "150px",
            backgroundColor: "#ffe157"
          }}
        >
          <div
            style={{
              width: "300px",
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              left: "30px",
              zIndex: 1
            }}
          >
            <p
              style={{
                margin: "0",
                fontSize: "22px",
                fontWeight: "700",
                letterSpacing: "-1px"
              }}
            >
              KB 100세만족 연금보험 무배당
            </p>
            <p
              style={{
                margin: "0",
                fontSize: "22px",
                fontWeight: "700",
                letterSpacing: "-1px"
              }}
            >
              (100세보증형)
            </p>
          </div>
          {selectedImageUrl && (
            <img
              id="selectImgBox"
              src={isCaptured ? imageSrc : selectedImageUrl} // 캡처 후 imageSrc로 전환
              alt="이미지"
              style={{
                width: "120px",
                position: "absolute",
                right: "10px",
                bottom: "10px"
              }}
            />
          )}
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
      <br />
      <button onClick={saveSelecteAndAllTag}>Capture and Download</button>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <div>
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
                      border:
                        selectedImageUrl === url ? "3px solid red" : "none" // 선택된 이미지에 테두리 추가
                    }}
                    onClick={() => setSelectedImageUrl(url)} // 이미지 선택
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>

        {imageSrc ? (
          <div>
            <h3>저장된 이미지:</h3>
            <img
              // src={`data:image/png;base64,${base64Image}`}
              src={imageSrc}
              alt="저장된 이미지"
              style={{ maxWidth: "100%" }}
            />
            {/* 또는 이미지 경로를 텍스트로 표시하려면 아래 줄을 사용하세요 */}
            {/* <p>{saveImageLocation}</p> */}
          </div>
        ) : (
          <p>이미지가 아직 저장되지 않았습니다.</p>
        )}
      </div>
    </div>
  );
}
