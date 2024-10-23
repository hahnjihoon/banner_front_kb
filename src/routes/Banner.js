import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { fileUploadSelectedImg } from "../api/fileUploadToS3";
import Draggable from "react-draggable";
// import { ResizableBox } from "react-resizable";

const apikey = process.env.REACT_APP_APIKEY;

const imagePaths = [
  "/image6.png",
  "/image20.png",
  "/image30.png",
  "/image39.png",
  "/image41.png",
  "/image48.png",
  "/image49.png",
  "/image60.png",
  "/image67.png"
  // 이 배열에 public 폴더에 있는 이미지 경로를 모두 추가하세요
];

const logoPaths = [
  "/logo1.png",
  "/logo2.png",
  "/logo3.png",
  "/logo4.png",
  "/logo5.png"
];

export default function Banner() {
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(150);
  const [padding, setPadding] = useState(10);
  const [alignItems, setalignItems] = useState("center");
  const [title, setTitle] = useState("This is a banner!");
  const [titleFontSize, setTitleFontSize] = useState(16);
  const [subtitle, setSubtitle] = useState("");
  const [subtitleFontSize, setSubtitleFontSize] = useState(12);
  const [backgroundColor, setBackgroundColor] = useState("#ffe157");
  const [fontFamily, setFontFamily] = useState("KBFGDisplay");
  const [titleColor, setTitleColor] = useState("#000000");
  const [subtitleColor, setSubtitleColor] = useState("#555555");

  const [imageUrl, setImageUrl] = useState(""); //이게 test2의 imageSrc
  const [imageWidth, setImageWidth] = useState(100);
  const [imageHeight, setImageHeight] = useState(100);
  const [imagePositionX, setImagePositionX] = useState(500);
  const [imagePositionY, setImagePositionY] = useState(25);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false); //ai 이미지생성중
  const [saving, setSaving] = useState(false); // 배너완성 저장중
  const [imageUrls, setImageUrls] = useState([]); //ai 생성된 이미지들
  const [selectedImageUrl, setSelectedImageUrl] = useState("");

  const [base64Image, setBase64Image] = useState(null);
  // const [imageSrc, setImageSrc] = useState(null);
  const [isCaptured, setIsCaptured] = useState(false); //이기술의핵심 졸라중요
  // 로컬에 저장시키고 그때만 ture로 바꿈

  const [imageFile, setImageFile] = useState(null);
  const [prompt2, setPrompt2] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [editedImageUrl, setEditedImageUrl] = useState(null);
  const [editGenerating, setEditGenerating] = useState(false);

  const [characterImg, setcharacterImg] = useState("");
  const [logoImg, setLogoImg] = useState("");
  const [characterUrl, setcharacterUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const [characterWidth, setCharacterWidth] = useState(130);
  const [characterHeight, setCharacterHeight] = useState(130);
  const [characterPositionX, setCharacterPositionX] = useState(450);
  const [characterPositionY, setCharacterPositionY] = useState(22);

  const [logoWidth, setLogoWidth] = useState(120);
  const [logoHeight, setLogoHeight] = useState(120);
  const [logoPositionX, setLogoPositionX] = useState(0);
  const [logoPositionY, setLogoPositionY] = useState(0);

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
    color: titleColor,
    fontWeight: "bold"
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

  const characterStyle = {
    position: "absolute",
    top: `${characterPositionY}px`,
    left: `${characterPositionX}px`,
    width: `${characterWidth}px`,
    height: `${characterHeight}px`
  };

  const logoStyle = {
    position: "absolute",
    top: `${logoPositionY}px`,
    left: `${logoPositionX}px`,
    width: `${logoWidth}px`,
    height: `${logoHeight}px`
  };

  const changeKoreanToEnglish = async (param) => {
    const prom = param;
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: apikey
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo", // 최신 모델 사용
            messages: [
              {
                role: "system",
                content: "Translate the following Korean text to English."
              },
              {
                role: "user",
                content: prom // 한글 프롬프트 전달
              }
            ],
            max_tokens: 60,
            temperature: 0.3
          })
        }
      );
      const data = await response.json();
      console.log("번역리턴:: ", data);
      const translatedText = data.choices[0].message.content.trim();
      console.log("Translated Text:", translatedText);
      if (translatedText) {
        // setPromptEng(translatedText); // 번역 결과를 promptEng에 저장
        return translatedText; // 번역된 텍스트 반환
      } else {
        throw new Error("번역 실패");
      }
    } catch (error) {
      console.error("Error translating prompt:", error);
    }
  };

  const makeImageFromAi = async (e) => {
    e.preventDefault();
    setLoading(true);
    setImageUrls([]);

    try {
      const translatedPrompt = await changeKoreanToEnglish(prompt);
      // console.log("넘어간거 찍혀야지 :: ", translatedPrompt);

      if (!translatedPrompt) {
        throw new Error("번역된 프롬프트가 없습니다.");
      }

      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: apikey
          Authorization: apikey
        },
        body: JSON.stringify({
          prompt: translatedPrompt,
          n: 3,
          size: "256x256"
        })
      });

      const data = await res.json();
      const urls = data.data.map((imageData) => imageData.url);
      setImageUrls(urls);
    } catch (error) {
      console.error("Error:", error);
      setImageUrls([]);
      alert("이미지 생성 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelection = (url) => {
    setSelectedImageUrl(url);
    setImageUrl(url);
  };

  const selecteCharacter = (url) => {
    console.log("선택한url:: ", url);
    // setSelectedImageUrl(url);
    // setImageUrl(url);
    // setImageHeight("300");
    // setImageWidth("150");
    setcharacterImg(url);
    setcharacterUrl(url);
  };

  const selectLogo = (url) => {
    console.log("로고:: ", url);
    setLogoImg(url);
    setLogoUrl(url);
  };

  //이미지 경로가 로컬인지 파악하는함수
  const isLocalUrl = (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.origin === window.location.origin; // 현재 페이지와 동일한 origin인지 확인
    } catch (e) {
      // 상대 경로일 경우 URL 생성 실패하므로 로컬로 간주
      return true;
    }
  };

  const saveCustomBanner = async () => {
    try {
      console.log("저장 실행 시작::", selectedImageUrl);
      setSaving(true);

      let width = 0;
      let height = 0;

      if (selectedImageUrl && isLocalUrl(selectedImageUrl)) {
        console.log("이거타냐");
        setIsCaptured(true);
        // 로컬 이미지일 때 파일로 변환
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

        const link = document.createElement("a");
        link.href = dataURL; // dataURL을 href로 설정
        link.download = fileName; // 다운로드할 파일명
        document.body.appendChild(link);
        link.click(); // 링크 클릭하여 다운로드 실행
        document.body.removeChild(link); // 링크 제거

        setIsCaptured(false);
        setSaving(false);
        return;
      } else {
        console.log("로컬이미지아님 다음로직으로 넘어감");
      }

      // selectedImageUrl이 있을 때만 fileUploadSelectedImg 실행
      if (selectedImageUrl && selectedImageUrl.startsWith("blob:")) {
        const response = await fileUploadSelectedImg(selectedImageUrl);

        console.log("서버 응답:", response);
        setBase64Image(response.base64Image);
        console.log("이미저장됨");
      } else if (selectedImageUrl) {
        // Blob URL이 아닌 정상 URL 처리
        const response = await fileUploadSelectedImg(selectedImageUrl);

        console.log("서버 응답:", response);
        setBase64Image(response.base64Image); // 서버에서 반환된 Base64 이미지 설정
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

      // await fileUploadAllTag(dataURL, fileName);

      //서버저장후 다시불러오지않고 바로 data로 로컬에 저장 = 서버에 저장로직 지워도됨
      const link = document.createElement("a");
      link.href = dataURL; // dataURL을 href로 설정
      link.download = fileName; // 다운로드할 파일명
      document.body.appendChild(link);
      link.click(); // 링크 클릭하여 다운로드 실행
      document.body.removeChild(link); // 링크 제거

      setIsCaptured(false);
      setSaving(false);
    } catch (error) {
      console.error("이미지 업로드 중 오류 발생:", error);
      setSaving(false);
    }
  };

  const resetbutton = async () => {
    setWidth(600);
    setHeight(150);
    setPadding(10);
    setBackgroundColor("#ffe157");
    setTitle("This is a banner!");
    setSubtitle("This is a subtitle!");
    setTitleFontSize(16);
    setSubtitleFontSize(12);
    setTitleColor("#000000");
    setSubtitleColor("#000000");
    setalignItems("center");
    setFontFamily("KBFGDisplay");
    setPrompt("");

    setImageUrl("");
    setSelectedImageUrl("");
    setcharacterUrl("");
    setcharacterImg("");
    setLogoUrl("");
    setLogoImg("");
    setImageWidth(100);
    setImageHeight(100);
    setImagePositionX(0);
    setImagePositionY(0);
  };

  const example0set = async () => {
    setWidth(460);
    setHeight(150);
    setPadding(30);
    setBackgroundColor("#ffe157");
    setTitle("KB 100세만족 연금보험 무배당");
    setSubtitle("(100세보증형)");
    setTitleFontSize(18);
    setSubtitleFontSize(14);
    setTitleColor("#000000");
    setSubtitleColor("#000000");
    setalignItems("start");
    setFontFamily("Arial");
    setPrompt("일러스트 형식으로 할아버지 할머니가 안고있는 모습");

    setImageUrl("");
    setSelectedImageUrl("");
    setcharacterUrl("");
    setcharacterImg("");
    setLogoUrl("");
    setLogoImg("");
    setImageWidth(130);
    setImageHeight(130);
    setImagePositionX(310);
    setImagePositionY(18);
    setCharacterWidth(100);
    setCharacterHeight(100);
    setCharacterPositionX(300);
    setCharacterPositionY(10);
    setLogoWidth(80);
    setLogoHeight(80);
    setLogoPositionX(0);
    setLogoPositionY(0);
  };

  const example1set = async () => {
    console.log("mo.main.bottom");
    setWidth(960);
    setHeight(450);
    setPadding(75);
    setBackgroundColor("#FDEFF4");
    setTitle("내 보험 찾기");
    setSubtitle("잊고 있던 내 보험 찾고\n이마트 상품권도 받자");
    setTitleFontSize(45);
    setSubtitleFontSize(44);
    setTitleColor("#F63D57");
    setSubtitleColor("#000000");
    setalignItems("start");
    setFontFamily("KBFGDisplay");
    setPrompt("");

    setImageUrl();
    setcharacterUrl(process.env.PUBLIC_URL + "/image48.png");
    setcharacterImg(process.env.PUBLIC_URL + "/image48.png");
    setLogoUrl(process.env.PUBLIC_URL + "/logo4.png");
    setLogoImg(process.env.PUBLIC_URL + "/logo4.png");
    setCharacterWidth(150);
    setCharacterHeight(270);
    setCharacterPositionX(590);
    setCharacterPositionY(125);
    setImageWidth(130);
    setImageHeight(130);
    setImagePositionX(310);
    setImagePositionY(18);
    setLogoWidth(120);
    setLogoHeight(120);
    setLogoPositionX(0);
    setLogoPositionY(0);
  };

  const example2set = async () => {
    console.log("mo.online.main");
    setWidth(950);
    setHeight(600);
    setPadding(75);
    setBackgroundColor("#FFCC00");
    setTitle("내 보험 찾기");
    setSubtitle("잊고 있던 내 보험 찾고\n이마트 상품권도 받자");
    setTitleFontSize(62);
    setSubtitleFontSize(56);
    setTitleColor("#F63D57");
    setSubtitleColor("#000000");
    setalignItems("start");
    setFontFamily("KBFGDisplay");
    setPrompt("");

    setImageUrl("");
    setcharacterUrl(process.env.PUBLIC_URL + "/image48.png");
    setcharacterImg(process.env.PUBLIC_URL + "/image48.png");
    setLogoUrl(process.env.PUBLIC_URL + "/logo4.png");
    setLogoImg(process.env.PUBLIC_URL + "/logo4.png");
    setImageWidth(200);
    setImageHeight(200);
    setImagePositionX(400);
    setImagePositionY(10);
    setCharacterWidth(145);
    setCharacterHeight(257);
    setCharacterPositionX(667);
    setCharacterPositionY(305);
    setLogoWidth(120);
    setLogoHeight(120);
    setLogoPositionX(60);
    setLogoPositionY(85);
  };

  const example3set = async () => {
    setWidth(460);
    setHeight(150);
    setPadding(35);
    setBackgroundColor("#FDEFF4");
    setTitle("내 보험 찾기");
    setSubtitle("잊고 있던 내 보험 찾고\n이마트 상품권도 받자");
    setTitleFontSize(18);
    setSubtitleFontSize(14);
    setTitleColor("#F63D57");
    setSubtitleColor("#000000");
    setalignItems("start");
    setFontFamily("KBFGDisplay");
    setPrompt("");

    setImageUrl("");
    setcharacterUrl(process.env.PUBLIC_URL + "/image48.png");
    setcharacterImg(process.env.PUBLIC_URL + "/image48.png");
    setLogoUrl(process.env.PUBLIC_URL + "/logo5.png");
    setLogoImg(process.env.PUBLIC_URL + "/logo5.png");
    setImageWidth(100);
    setImageHeight(100);
    setImagePositionX(0);
    setImagePositionY(0);
    setCharacterWidth(70);
    setCharacterHeight(110);
    setCharacterPositionX(245);
    setCharacterPositionY(30);
    setLogoWidth(100);
    setLogoHeight(70);
    setLogoPositionX(320);
    setLogoPositionY(45);
  };

  const example4set = async () => {
    setWidth(960);
    setHeight(256);
    setPadding(35);
    setBackgroundColor("#FDEFF4");
    setTitle("내 보험 찾기");
    setSubtitle("잊고 있던 내 보험 찾고 이마트 상품권도 받자");
    setTitleFontSize(40);
    setSubtitleFontSize(35);
    setTitleColor("#F63D57");
    setSubtitleColor("#000000");
    setalignItems("start");
    setFontFamily("KBFGDisplay");
    setPrompt("");

    setImageUrl("");
    setcharacterUrl(process.env.PUBLIC_URL + "/image48.png");
    setcharacterImg(process.env.PUBLIC_URL + "/image48.png");
    setLogoUrl("");
    setLogoImg("");
    setImageWidth(100);
    setImageHeight(100);
    setImagePositionX(400);
    setImagePositionY(10);
    setCharacterWidth(84);
    setCharacterHeight(160);
    setCharacterPositionX(752);
    setCharacterPositionY(78);
    setLogoWidth(100);
    setLogoHeight(100);
    setLogoPositionX(0);
    setLogoPositionY(0);
  };

  const example5set = async () => {
    setWidth(566);
    setHeight(540);
    setPadding(35);
    setBackgroundColor("#FDEFF4");
    setTitle("내 보험 찾기");
    setSubtitle("잊고 있던 내 보험 찾고\n이마트 상품권도 받자");
    setTitleFontSize(40);
    setSubtitleFontSize(35);
    setTitleColor("#F63D57");
    setSubtitleColor("#000000");
    setalignItems("start");
    setFontFamily("KBFGDisplay");
    setPrompt("");

    setImageUrl("");
    setcharacterUrl(process.env.PUBLIC_URL + "/image48.png");
    setcharacterImg(process.env.PUBLIC_URL + "/image48.png");
    setLogoUrl("");
    setLogoImg("");
    setImageWidth(100);
    setImageHeight(100);
    setImagePositionX(390);
    setImagePositionY(200);
    setCharacterWidth(84);
    setCharacterHeight(160);
    setCharacterPositionX(395);
    setCharacterPositionY(339);
    setLogoWidth(120);
    setLogoHeight(80);
    setLogoPositionX(33);
    setLogoPositionY(110);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0]; // 파일을 선택
    setImageFile(file); // 파일 상태 저장
    if (file) {
      // 선택한 파일을 미리보기 위해 URL 생성
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl); // 미리보기 상태에 저장
    }
  };

  // const handlePromptChange = (e) => {
  //   setPrompt2(e.target.value);
  // };

  const editImage = async () => {
    console.log("편집시작");
    setEditGenerating(true);
    const translatedPrompt = await changeKoreanToEnglish(prompt2);
    if (!translatedPrompt) {
      throw new Error("번역된 프롬프트가 없습니다.");
    }
    console.log(prompt2);
    console.log(imageFile);
    const formData = new FormData();

    formData.append("image", imageFile); // 이미지 파일 추가
    formData.append("prompt", translatedPrompt); // 프롬프트 추가 (예: "해를 파란색으로 바꿔줘")
    formData.append("n", 1); // 생성할 이미지 개수 (1개)
    formData.append("size", "256x256"); // 이미지 크기

    try {
      const response = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: {
          Authorization: apikey
          // 'Content-Type': 'multipart/form-data'는 FormData 사용 시 자동으로 설정
        },
        body: formData
      });

      const data = await response.json();

      console.log("리턴받은url", data.data[0].url);
      setEditedImageUrl(data.data[0].url);

      setEditGenerating(false);
    } catch (error) {
      console.error("Error:", error);
      setEditGenerating(false);
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

  const deleteContentButton = async () => {
    setImageUrl("");
    setSelectedImageUrl("");
  };

  const deletecharacterButton = async () => {
    setcharacterUrl("");
    setcharacterImg("");
  };

  const deletelogoButton = async () => {
    setLogoUrl("");
    setLogoImg("");
  };

  console.log("현재이미지url :: ", imageUrl);
  console.log("현재selectedurl :: ", selectedImageUrl);
  // console.log("현재isCaptured :: ", isCaptured);
  // console.log("프롬프트 :: ", prompt);
  // console.log("프롬프트 :: ", alignItems);
  // console.log("프롬프트 :: ", fontFamily);

  return (
    <div style={{ backgroundColor: "#f1edea" }}>
      <div className="wrap">
        <form>
          <h2 className="title">Banner</h2>
          <div className="container">
            <div className="box">
              <label>Width </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
              <span>( px )</span>
            </div>
            <div className="box">
              <label>Height </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <span>( px )</span>
            </div>
            <div className="box">
              <label>Padding </label>
              <input
                type="number"
                value={padding}
                onChange={(e) => setPadding(e.target.value)}
              />
              <span>( px )</span>
            </div>
            <div>
              <label>Background Color </label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
            </div>
          </div>
          <h2 className="title">Text</h2>
          <div className="container">
            <div className="box">
              <label>Title</label>
              <input
                className="w100"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="box">
              <label className="sub_title">SubTitle</label>
              <textarea
                className="w100"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>
            <div className="box">
              <label>Title FontSize</label>
              <input
                type="number"
                value={titleFontSize}
                onChange={(e) => setTitleFontSize(e.target.value)}
              />
              <span>( px )</span>
            </div>

            <div className="box">
              <label>Subtitle FontSize</label>
              <input
                type="number"
                value={subtitleFontSize}
                onChange={(e) => setSubtitleFontSize(e.target.value)}
              />
              <span>( px )</span>
            </div>
            <div className="box">
              <label>Title Color</label>
              <input
                type="color"
                value={titleColor}
                onChange={(e) => setTitleColor(e.target.value)}
              />
            </div>
            <div className="box">
              <label>SubTitle Color</label>
              <input
                type="color"
                value={subtitleColor}
                onChange={(e) => setSubtitleColor(e.target.value)}
              />
            </div>
            <div className="box">
              <label>Text Align</label>
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
              <label>Text Font</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
              >
                <option value="Arial">Arial</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Verdana">Verdana</option>
                <option value="KBFGDisplay">KBFG Display</option>
              </select>
            </div>
          </div>
          <br></br>
        </form>
        <h2 className="title">Image</h2>
        <br></br>
        <div className="form_box">
          <label>Basic Image</label>
          <div className="form_cont">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                padding: "10px"
              }}
            >
              {imagePaths.map((path, index) => (
                <div key={index} style={{ flex: "1 1 calc(33.33% - 10px)" }}>
                  <img
                    src={process.env.PUBLIC_URL + path}
                    alt={`error ${index + 1}`}
                    style={{
                      width: "100px",
                      height: "100px",
                      cursor: "pointer",
                      border:
                        characterUrl === process.env.PUBLIC_URL + path
                          ? "3px solid red"
                          : "1px solid black"
                    }}
                    onClick={() =>
                      selecteCharacter(process.env.PUBLIC_URL + path)
                    }
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex" }}>
              {" "}
              {/* 버튼들을 가로로 배치 */}
              <button
                type="button"
                disabled={loading}
                onClick={() => deletecharacterButton()}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="box">
            <label>Character Width</label>
            <input
              type="number"
              value={characterWidth}
              onChange={(e) => setCharacterWidth(e.target.value)}
            />
            <span>( px )</span>
          </div>
          <div className="box">
            <label>Character Height</label>
            <input
              type="number"
              value={characterHeight}
              onChange={(e) => setCharacterHeight(e.target.value)}
            />
            <span>( px )</span>
          </div>
          <div className="box">
            <label>Character Position X</label>
            <input
              type="number"
              value={characterPositionX}
              onChange={(e) =>
                setCharacterPositionX(parseFloat(e.target.value) || 0)
              }
            />
            <span>( px )</span>
          </div>
          <div className="box">
            <label>Character Position Y</label>
            <input
              type="number"
              value={characterPositionY}
              onChange={(e) =>
                setCharacterPositionY(parseFloat(e.target.value) || 0)
              }
            />
            <span>( px )</span>
          </div>
        </div>
        <br></br>
        <br></br>

        <div className="form_box">
          <label>Logo Image</label>
          <div className="form_cont">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 200px)", // 2열로 설정
                gap: "10px", // 이미지 사이의 간격
                justifyContent: "center", // 가운데 정렬
                padding: "10px"
              }}
            >
              {logoPaths.map((path, index) => (
                <div
                  key={index}
                  style={{
                    width: "150px", // 이미지 컨테이너의 너비 고정
                    height: "150px", // 이미지 컨테이너의 높이 고정
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border:
                      logoUrl === process.env.PUBLIC_URL + path
                        ? "3px solid red"
                        : "1px solid black",
                    cursor: "pointer"
                  }}
                  onClick={() => selectLogo(process.env.PUBLIC_URL + path)}
                >
                  <img
                    src={process.env.PUBLIC_URL + path}
                    alt={`error ${index + 1}`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain"
                    }}
                    onClick={() => selectLogo(process.env.PUBLIC_URL + path)}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", marginTop: "10px" }}>
              {/* 버튼들을 가로로 배치 */}
              <button
                type="button"
                disabled={loading}
                onClick={() => deletelogoButton()}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="box">
            <label>Logo Width</label>
            <input
              type="number"
              value={logoWidth}
              onChange={(e) => setLogoWidth(e.target.value)}
            />
            <span>( px )</span>
          </div>
          <div className="box">
            <label>Logo Height</label>
            <input
              type="number"
              value={logoHeight}
              onChange={(e) => setLogoHeight(e.target.value)}
            />
            <span>( px )</span>
          </div>
          <div className="box">
            <label>Logo Position X</label>
            <input
              type="number"
              value={logoPositionX}
              onChange={(e) =>
                setLogoPositionX(parseFloat(e.target.value) || 0)
              }
            />
            <span>( px )</span>
          </div>
          <div className="box">
            <label>Logo Position Y</label>
            <input
              type="number"
              value={logoPositionY}
              onChange={(e) =>
                setLogoPositionY(parseFloat(e.target.value) || 0)
              }
            />
            <span>( px )</span>
          </div>
        </div>
        <br></br>
        <br></br>

        <div className="form_box">
          <label>Generated Images</label>
          <div className="form_cont">
            <form
              onSubmit={makeImageFromAi}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <textarea
                className="w100"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter prompt for image generation"
                style={{
                  width: "300px",
                  height: "150px",
                  marginBottom: "10px"
                }} // 가로 세로 꽉 차게
              />
              <div style={{ display: "flex" }}>
                {" "}
                {/* 버튼들을 가로로 배치 */}
                <button type="submit" disabled={loading}>
                  {loading ? "Generating..." : "Confirm"}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => deleteContentButton()}
                >
                  Delete
                </button>
              </div>
            </form>
            {imageUrls.length > 0 && (
              <div className="ml20">
                <h2 className="title">Generated Images:</h2>
                <div style={{ display: "flex", gap: "10px", margin: "10px 0" }}>
                  {imageUrls.map((url, index) => (
                    <div key={index}>
                      <img
                        src={url}
                        alt={`Generated ${index + 1}`}
                        style={{
                          maxWidth: "100px",
                          maxHeight: "100px",
                          cursor: "pointer",
                          border:
                            selectedImageUrl === url ? "3px solid red" : "none"
                        }}
                        onClick={() => handleImageSelection(url)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="form_box">
          <label>Edit Images</label>
          <div className="form_cont">
            <input
              style={{ margin: "10px 0 5px 20px" }}
              type="file"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="ml20">
                {/* <h2 className='title'>선택한이미지</h2> */}
                <img
                  style={{
                    maxWidth: "300px",
                    maxHeight: "300px"
                  }}
                  src={imagePreview}
                  alt="preview"
                />
              </div>
            )}
            <div style={{ display: "flex" }}>
              <textarea
                className="w100"
                type="text"
                placeholder="Enter prompt for image edit (ex: 해를 파란색으로 바꿔줘)"
                value={prompt2}
                onChange={(e) => setPrompt2(e.target.value)}
              />
              <button onClick={editImage} disabled={editGenerating}>
                {editGenerating ? "Editing..." : "Edit Image"}
              </button>
            </div>
            {editedImageUrl && (
              <div className="ml20">
                <h2 className="title">Edit Images:</h2>
                <img
                  src={editedImageUrl}
                  alt="Edited"
                  style={{
                    maxWidth: "150px",
                    maxHeight: "150px",
                    cursor: "pointer",
                    border:
                      selectedImageUrl === editedImageUrl
                        ? "3px solid red"
                        : "none"
                  }}
                  onClick={() => handleImageSelection(editedImageUrl)}
                />
              </div>
            )}
          </div>

          {/* 편집된 이미지가 있을 경우 화면에 출력 */}
        </div>

        <div className="container">
          <div className="box">
            <label>Image Width</label>
            <input
              type="number"
              value={imageWidth}
              onChange={(e) => setImageWidth(e.target.value)}
            />
            <span>( px )</span>
          </div>
          <div className="box">
            <label>Image Height</label>
            <input
              type="number"
              value={imageHeight}
              onChange={(e) => setImageHeight(e.target.value)}
            />
            <span>( px )</span>
          </div>
          <div className="box">
            <label>Image Position X</label>
            <input
              type="number"
              value={imagePositionX}
              onChange={(e) =>
                setImagePositionX(parseFloat(e.target.value) || 0)
              }
            />
            <span>( px )</span>
          </div>
          <div className="box">
            <label>Image Position Y</label>
            <input
              type="number"
              value={imagePositionY}
              onChange={(e) =>
                setImagePositionY(parseFloat(e.target.value) || 0)
              }
            />
            <span>( px )</span>
          </div>
          <div className="box" style={{ borderBottom: "none" }}>
            <label>Image URL</label>
            <input
              className="w100"
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        </div>
      </div>
      {/* Banner output */}
      <div className="banner_wrap">
        <button className="btn1" onClick={resetbutton}>
          초기화
        </button>
        <h2 className="title">Preview</h2>
        <br />
        <div id="customBanner" style={bannerStyle}>
          <div style={titleStyle}>{title}</div>
          {subtitle && (
            <div style={{ ...subtitleStyle, whiteSpace: "pre-wrap" }}>
              {subtitle}
            </div>
          )}
          {imageUrl && (
            <Draggable>
              <img
                src={isCaptured ? imageUrl : selectedImageUrl}
                alt="wrong img addr"
                style={imageStyle}
              />
            </Draggable>
          )}
          {characterUrl && (
            <Draggable>
              <img
                src={isCaptured ? characterUrl : characterImg}
                alt="wrong img addr"
                style={characterStyle}
              />
            </Draggable>
          )}
          {logoUrl && (
            <Draggable>
              <img
                src={isCaptured ? logoUrl : logoImg}
                alt="wrong img addr"
                style={logoStyle}
              />
            </Draggable>
          )}
        </div>
        <button className="btn" disabled={saving} onClick={saveCustomBanner}>
          {saving ? "Saving Now..." : "Save"}
        </button>
        <br></br>
        <br></br>
        <br></br>
        <button className="btn1" onClick={example0set}>
          Sample 0
        </button>
        <button className="btn1" onClick={example1set}>
          Sample 1
        </button>
        <button className="btn1" onClick={example2set}>
          Sample 2
        </button>
        <button className="btn1" onClick={example3set}>
          Sample 3
        </button>
        <button className="btn1" onClick={example4set}>
          Sample 4
        </button>
        <button className="btn1" onClick={example5set}>
          Sample 5
        </button>
      </div>
    </div>
  );
}
