import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { fileUploadSelectedImg } from "../api/fileUploadToS3";
import Draggable from "react-draggable";
import { Resizable } from "re-resizable";

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
  const [height, setHeight] = useState(500);
  const [backgroundColor, setBackgroundColor] = useState("#ffe157");

  const [title, setTitle] = useState("This is a banner!");
  const [titleFontSize, setTitleFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("KBFGDisplay");
  const [titleColor, setTitleColor] = useState("#000000");

  const [titles, setTitles] = useState([title]);
  const dragRefs = useRef([]);
  const [clickedTitleIndex, setClickedTitleIndex] = useState(null);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false); //ai 이미지생성중
  const [saving, setSaving] = useState(false); // 배너완성 저장중
  const [imageUrls, setImageUrls] = useState([]); //ai 생성된 이미지들

  const [base64Image, setBase64Image] = useState(null);
  const [isCaptured, setIsCaptured] = useState(false); //이기술의핵심 졸라중요
  // 로컬에 저장시키고 그때만 ture로 바꿈
  const [imageFile, setImageFile] = useState(null);
  const [prompt2, setPrompt2] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [editedImageUrl, setEditedImageUrl] = useState(null);
  const [editGenerating, setEditGenerating] = useState(false);

  const [imageUrl, setImageUrl] = useState("");
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [imageSize, setImageSize] = useState({ width: 100, height: 100 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isImageSelected, setIsImageSelected] = useState(false);
  const imageRef = useRef(null);

  const [characterUrl, setcharacterUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [characterSize, setCharacterSize] = useState({
    width: 100,
    height: 100
  });
  const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0 });
  const [isCharacterSelected, setIsCharacterSelected] = useState(false);
  const characterRef = useRef(null);
  const [logoSize, setLogoSize] = useState({ width: 200, height: 200 });
  const [logoPosition, setLogoPosition] = useState({ x: 0, y: 0 });
  const [isLogoSelected, setIsLogoSelected] = useState(false);
  const logoRef = useRef(null);

  const bannerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    justifyContent: "center",
    backgroundColor: backgroundColor,
    display: "flex",
    flexDirection: "column",
    border: "1px solid #ccc",
    fontFamily: fontFamily,
    boxSizing: "border-box",
    position: "relative"
  };

  const handleClickOutside = (event) => {
    if (logoRef.current && !logoRef.current.contains(event.target)) {
      setIsLogoSelected(false); // 클릭한 영역이 로고가 아닐 경우 선택 해제
    }

    if (characterRef.current && !characterRef.current.contains(event.target)) {
      setIsCharacterSelected(false); // 클릭한 영역이 캐릭터가 아닐 경우 선택 해제
    }

    if (imageRef.current && !imageRef.current.contains(event.target)) {
      setIsImageSelected(false);
    }

    // const isOutsideTitle = dragRefs.current.every(
    //   (ref) => ref.current && !ref.current.contains(event.target)
    // );

    // if (isOutsideTitle) {
    //   setClickedTitleIndex(null);
    // }
  };

  useEffect(() => {
    // 컴포넌트가 마운트될 때 클릭 이벤트 리스너 추가
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // 컴포넌트가 언마운트될 때 리스너 제거
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".main-title") &&
        !e.target.closest(".draggable-icon") &&
        !e.target.closest(".selected-img")
      ) {
        // 타이틀이나 아이콘 외부를 클릭한 경우
        setClickedTitleIndex(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

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
    setcharacterUrl(url);
  };

  const selectLogo = (url) => {
    console.log("로고:: ", url);
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
    setHeight(500);
    setBackgroundColor("#ffe157");
    setTitle("This is a banner!");
    setTitleFontSize(16);
    setTitleColor("#000000");
    setFontFamily("KBFGDisplay");
    setPrompt("");
    setTitles([]);

    setImageUrl("");
    setSelectedImageUrl("");
    setcharacterUrl("");
    setLogoUrl("");
    setImagePosition({ x: 0, y: 0 });
    setImageSize({ width: 100, height: 100 });
    setCharacterPosition({ x: 0, y: 0 });
    setCharacterSize({ width: 50, height: 50 });
    setLogoPosition({ x: 0, y: 0 });
    setLogoSize({ width: 50, height: 50 });
  };

  const example0set = async () => {
    setTitles([]);
    setWidth(460);
    setHeight(150);
    setBackgroundColor("#ffe157");
    setTitle("");

    const newTitle = {
      text: "KB 100세만족 연금보험 무배당",
      fontSize: 18,
      fontFamily: "KBFGDisplay",
      color: "#000000",
      x: 20, // 초기 위치
      y: 0
    };
    const newTitle2 = {
      text: "(100세보증형)",
      fontSize: 14,
      fontFamily: "KBFGDisplay",
      color: "#000000",
      x: 20, // 초기 위치
      y: 0
    };
    setTitles([...titles, newTitle, newTitle2]);
    setPrompt("일러스트 형식으로 할아버지 할머니가 안고있는 모습");

    setImageUrl("");
    setSelectedImageUrl("");
    setcharacterUrl("");
    setLogoUrl("");
    setImagePosition({ x: 310, y: 18 });
    setImageSize({ width: 130, height: 130 });
    setCharacterPosition({ x: 0, y: 0 });
    setCharacterSize({ width: 50, height: 50 });
    setLogoPosition({ x: 0, y: 0 });
    setLogoSize({ width: 50, height: 50 });
  };

  const example1set = async () => {
    setWidth(960);
    setHeight(450);
    setBackgroundColor("#FDEFF4");

    const newTitle = {
      text: "내 보험 찾기",
      fontSize: 50,
      fontFamily: "KBFGDisplay",
      color: "#F63D57",
      x: 30, // 초기 위치
      y: 90
    };
    const newTitle2 = {
      text: "잊고 있던 내 보험 찾고",
      fontSize: 48,
      fontFamily: "KBFGDisplay",
      color: "#000000",
      x: 30, // 초기 위치
      y: 100 // 초기 위치
    };
    const newTitle3 = {
      text: "이마트 상품권도 받자",
      fontSize: 48,
      fontFamily: "KBFGDisplay",
      color: "#000000",
      x: 30, // 초기 위치
      y: 110 // 초기 위치
    };
    setTitles([...titles, newTitle, newTitle2, newTitle3]);

    setTitle("");
    // setTitleFontSize(45);
    // setTitleColor("#F63D57");
    // setFontFamily("KBFGDisplay");
    setPrompt("");

    setImageUrl();
    setcharacterUrl(process.env.PUBLIC_URL + "/image48.png");
    setLogoUrl(process.env.PUBLIC_URL + "/logo4.png");
    setImagePosition({ x: 610, y: -51 });
    setImageSize({ width: 120, height: 250 });
    setCharacterPosition({ x: 590, y: -50 });
    setCharacterSize({ width: 150, height: 270 });
    setLogoPosition({ x: 30, y: -407 });
    setLogoSize({ width: 50, height: 50 });
  };

  const example2set = async () => {
    console.log("mo.online.main");
    setWidth(950);
    setHeight(600);
    setBackgroundColor("#FDEFF4");

    const newTitle = {
      text: "내 보험 찾기",
      fontSize: 60,
      fontFamily: "KBFGDisplay",
      color: "#F63D57",
      x: 77, // 초기 위치
      y: 132
    };
    const newTitle2 = {
      text: "잊고 있던 내 보험 찾고",
      fontSize: 58,
      fontFamily: "KBFGDisplay",
      color: "#000000",
      x: 77, // 초기 위치
      y: 142 // 초기 위치
    };
    const newTitle3 = {
      text: "이마트 상품권도 받자",
      fontSize: 58,
      fontFamily: "KBFGDisplay",
      color: "#000000",
      x: 77, // 초기 위치
      y: 144 // 초기 위치
    };
    setTitles([...titles, newTitle, newTitle2, newTitle3]);
    setTitle("");
    setPrompt("");

    setImageUrl("");
    setcharacterUrl(process.env.PUBLIC_URL + "/image48.png");
    setLogoUrl(process.env.PUBLIC_URL + "/logo1.png");
    setImagePosition({ x: 400, y: 10 });
    setImageSize({ width: 200, height: 200 });
    setCharacterPosition({ x: 714, y: 33 });
    setCharacterSize({ width: 150, height: 270 });
    setLogoPosition({ x: 55, y: -467 });
    setLogoSize({ width: 200, height: 100 });
  };

  const example3set = async () => {
    setWidth(460);
    setHeight(150);
    setBackgroundColor("#FDEFF4");

    const newTitle = {
      text: "내 보험 찾기",
      fontSize: 20,
      fontFamily: "KBFGDisplay",
      color: "#F63D57",
      x: 25,
      y: 31
    };
    const newTitle2 = {
      text: "잊고 있던 내 보험 찾고",
      fontSize: 20,
      fontFamily: "KBFGDisplay",
      color: "#000000",
      x: 25,
      y: 32
    };
    const newTitle3 = {
      text: "이마트 상품권도 받자",
      fontSize: 20,
      fontFamily: "KBFGDisplay",
      color: "#000000",
      x: 25,
      y: 35
    };
    setTitles([...titles, newTitle, newTitle2, newTitle3]);
    setTitle("");
    setPrompt("");

    setImageUrl("");
    setcharacterUrl(process.env.PUBLIC_URL + "/image48.png");
    setLogoUrl("");
    setImagePosition({ x: 0, y: 0 });
    setImageSize({ width: 100, height: 100 });
    setCharacterPosition({ x: 350, y: -38 });
    setCharacterSize({ width: 50, height: 90 });
    setLogoPosition({ x: 0, y: 0 });
    setLogoSize({ width: 50, height: 50 });
  };

  const example4set = async () => {
    setWidth(960);
    setHeight(256);
    setBackgroundColor("#FDEFF4");

    const newTitle = {
      text: "내 보험 찾기",
      fontSize: 40,
      fontFamily: "KBFGDisplay",
      color: "#F63D57",
      x: 49,
      y: 89
    };
    const newTitle2 = {
      text: "잊고 있던 내 보험 찾고 이마트 상품권도 받자",
      fontSize: 38,
      fontFamily: "KBFGDisplay",
      color: "#000000",
      x: 52,
      y: 85
    };
    setTitles([...titles, newTitle, newTitle2]);
    setTitle("");
    setPrompt("");

    setImageUrl("");
    setcharacterUrl(process.env.PUBLIC_URL + "/image48.png");
    setLogoUrl(process.env.PUBLIC_URL + "/logo1.png");
    setImagePosition({ x: 700, y: -18 });
    setImageSize({ width: 100, height: 100 });
    setCharacterPosition({ x: 775, y: -24 });
    setCharacterSize({ width: 84, height: 160 });
    setLogoPosition({ x: 30, y: -249 });
    setLogoSize({ width: 194, height: 10 });
  };

  const example5set = async () => {
    setWidth(966);
    setHeight(540);
    setBackgroundColor("#FDEFF4");

    const newTitle = {
      text: "내 보험 찾기",
      fontSize: 70,
      fontFamily: "KBFGDisplay",
      color: "#F63D57",
      x: 108,
      y: 61
    };
    const newTitle2 = {
      text: "잊고 있던 내 보험 찾고",
      fontSize: 70,
      fontFamily: "KBFGDisplay",
      color: "#000000",
      x: 109,
      y: 67
    };
    const newTitle3 = {
      text: "이마트 상품권도 받자",
      fontSize: 70,
      fontFamily: "KBFGDisplay",
      color: "#000000",
      x: 121,
      y: 75
    };
    const newTitle4 = {
      text: "찾았다",
      fontSize: 30,
      fontFamily: "KBFGDisplay",
      color: "#F63D57",
      x: 546,
      y: 137
    };
    setTitles([...titles, newTitle, newTitle2, newTitle3, newTitle4]);
    setTitle("");
    setPrompt("");

    setImageUrl("");
    setcharacterUrl(process.env.PUBLIC_URL + "/image48.png");
    setLogoUrl("");
    setImagePosition({ x: 0, y: 0 });
    setImageSize({ width: 100, height: 100 });
    setCharacterPosition({ x: 639, y: 60 });
    setCharacterSize({ width: 150, height: 250 });
    setLogoPosition({ x: 0, y: 0 });
    setLogoSize({ width: 50, height: 50 });
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

  const editImage = async () => {
    console.log("편집시작");
    setEditGenerating(true);
    const translatedPrompt = await changeKoreanToEnglish(prompt2);
    if (!translatedPrompt) {
      throw new Error("번역된 프롬프트가 없습니다.");
    }
    console.log(prompt2);
    console.log(imageFile);

    const convertToRGBA = async (imageFile) => {
      const imageBitmap = await createImageBitmap(imageFile);
      const canvas = document.createElement("canvas");
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;

      const ctx = canvas.getContext("2d", { alpha: true }); // 투명도 허용
      ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 초기화 후 투명도로 설정
      ctx.drawImage(imageBitmap, 0, 0);

      // RGBA 형식으로 변환된 Blob을 반환
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png");
      });
    };

    // imageFile을 RGBA로 변환
    const rgbaImageFile = await convertToRGBA(imageFile);

    const formData = new FormData();

    formData.append("image", rgbaImageFile); // 이미지 파일 추가
    formData.append("prompt", translatedPrompt); // 프롬프트 추가 (예: "해를 파란색으로 바꿔줘")
    formData.append("n", 1); // 생성할 이미지 개수 (1개)
    formData.append("size", "256x256"); // 이미지 크기
    console.log("----------------------", formData);

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

      console.log("리턴받은url", data);
      setEditedImageUrl(data.data[0].url);

      setEditGenerating(false);
    } catch (error) {
      console.error("Error:", error);
      alert(error);
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

  const handleDragStopTitle = (e, data, index) => {
    const updatedTitles = titles.map((title, i) =>
      i === index ? { ...title, x: data.x, y: data.y } : title
    );
    setTitles(updatedTitles);
  };

  const handleAddTitle = () => {
    const newTitle = {
      text: title,
      fontSize: titleFontSize,
      fontFamily: fontFamily,
      color: titleColor,
      x: 0, // 초기 위치
      y: 0 // 초기 위치
    };

    setTitles([...titles, newTitle]); // titles 배열에 새로운 타이틀 추가
    setTitle(""); // 입력 필드 초기화
  };

  const handleRemoveTitle = (index) => {
    const updatedTitles = titles.filter((_, i) => i !== index);
    setTitles(updatedTitles); // 타이틀 업데이트
  };

  const deleteContentButton = async () => {
    setImageUrl("");
    setSelectedImageUrl("");
  };

  const deletecharacterButton = async () => {
    setcharacterUrl("");
  };

  const deletelogoButton = async () => {
    setLogoUrl("");
  };

  // console.log("현재이미지url :: ", imageUrl);

  return (
    <div style={{ backgroundColor: "#f1edea" }}>
      <div className="wrap">
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
            <label>Sentence</label>
            <input
              className="w100"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="box">
            <label>FontSize</label>
            <input
              type="number"
              value={titleFontSize}
              onChange={(e) => setTitleFontSize(e.target.value)}
            />
            <span>( px )</span>
          </div>
          <div className="box">
            <label>Color</label>
            <input
              type="color"
              value={titleColor}
              onChange={(e) => setTitleColor(e.target.value)}
            />
          </div>
          <div>
            <label>Font</label>
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
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "10px"
          }}
        >
          {" "}
          {/* 버튼들을 가로로 배치 */}
          <button
            type="button"
            onClick={handleAddTitle}
            style={{
              width: "200px", // 버튼의 가로 크기
              height: "50px", // 버튼의 세로 크기
              backgroundColor: "#977a5e", // 버튼 색상 갈색으로 변경
              color: "white", // 텍스트 색상
              fontSize: "16px", // 글자 크기
              border: "none", // 테두리 없앰
              borderRadius: "5px", // 버튼에 약간의 둥근 모서리 추가
              cursor: "pointer" // 마우스를 올리면 포인터로 변경
            }}
          >
            배너에적용
          </button>
        </div>
        <br></br>

        <h2 className="title">Image</h2>
        <br></br>
        <div className="form_box">
          <label>Character Image</label>
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
        </div>
      </div>

      {/* Banner output */}
      <div className="banner_wrap">
        <button className="btn1" onClick={resetbutton}>
          초기화
        </button>
        <h2 className="title">Preview</h2>
        <br />
        <div
          id="customBanner"
          style={{ ...bannerStyle, position: "relative", overflow: "hidden" }}
        >
          {/* 타이틀 렌더링 */}
          {title && (
            <div
              style={{
                fontFamily: fontFamily,
                fontSize: `${titleFontSize}px`,
                color: titleColor,
                position: "relative",
                display: "inline-block",
                width: "auto", // 텍스트 길이에 맞추기 위해 auto 사용
                alignSelf: "flex-start"
              }}
            >
              {title}
            </div>
          )}

          {titles.map((title, index) => {
            if (!dragRefs.current[index]) {
              dragRefs.current[index] = React.createRef();
            }

            // 타이틀 스타일
            const titleStyle = {
              fontFamily: title.fontFamily,
              fontSize: `${title.fontSize}px`,
              color: title.color,
              position: "relative",
              display: "inline-block", // 텍스트 길이에 맞추기 위해 사용
              width: "auto", // 텍스트 길이에 맞추기 위해 auto 사용
              alignSelf: "flex-start" // 부모의 flex 영향을 받지 않도록 설정
            };

            // defaultPosition을 사용하여 초기 위치 설정
            const defaultPosition = { x: title.x || 0, y: title.y || 0 };

            return (
              <Draggable
                nodeRef={dragRefs.current[index]}
                key={index}
                defaultPosition={defaultPosition} // defaultPosition 설정
                onStop={(e, data) => handleDragStopTitle(e, data, index)} // 드래그 종료 시 위치 저장
              >
                <div
                  ref={dragRefs.current[index]}
                  className="main-title"
                  style={{
                    ...titleStyle
                  }}
                  onClick={() => setClickedTitleIndex(index)} // 타이틀 클릭 시 인덱스 저장
                >
                  {title.text}

                  {/* x 버튼: 클릭된 타이틀에만 표시 */}
                  {clickedTitleIndex === index && (
                    <span
                      className="remove-title"
                      onClick={(e) => {
                        e.stopPropagation(); // 부모 클릭 이벤트 막기
                        handleRemoveTitle(index); // 타이틀 삭제
                      }}
                      style={{
                        position: "absolute",
                        top: "0px", // 타이틀의 오른쪽 위로 이동
                        right: "-20px", // 타이틀의 오른쪽 위로 이동
                        background: "black",
                        color: "white",
                        cursor: "pointer",
                        borderRadius: "50%",
                        width: "15px", // 원형을 만들기 위한 너비
                        height: "15px", // 원형을 만들기 위한 높이
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px", // 텍스트 크기 조정
                        lineHeight: "1" // 텍스트가 세로로 정렬되도록 설정
                      }}
                    >
                      x
                    </span>
                  )}
                </div>
              </Draggable>
            );
          })}
          {imageUrl && (
            <Draggable
              position={imagePosition}
              onStop={(e, data) => {
                setImagePosition({ x: data.x, y: data.y });
              }}
            >
              <Resizable
                size={imageSize}
                onResizeStop={(e, direction, ref, d) => {
                  setImageSize({
                    width: imageSize.width + d.width,
                    height: imageSize.height + d.height
                  });
                }}
              >
                <div
                  ref={imageRef} // 로고 이미지 컨테이너에 ref 설정
                  onClick={() => setIsImageSelected((prev) => !prev)} // 클릭 시 선택 상태 토글
                  style={{
                    border: isImageSelected ? "3px solid red" : "",
                    position: "relative",
                    display: "inline-block"
                  }}
                >
                  <img
                    src={isCaptured ? imageUrl : selectedImageUrl}
                    alt="wrong img addr"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain", // 이미지 비율 유지
                      display: "block" // 공백 제거
                    }}
                  />
                </div>
              </Resizable>
            </Draggable>
          )}
          {characterUrl && (
            <Draggable
              position={characterPosition}
              onStop={(e, data) => {
                setCharacterPosition({ x: data.x, y: data.y });
              }}
            >
              <Resizable
                size={characterSize}
                onResizeStop={(e, direction, ref, d) => {
                  setCharacterSize({
                    width: logoSize.width + d.width,
                    height: logoSize.height + d.height
                  });
                }}
              >
                <div
                  ref={characterRef} // 로고 이미지 컨테이너에 ref 설정
                  onClick={() => setIsCharacterSelected((prev) => !prev)} // 클릭 시 선택 상태 토글
                  style={{
                    border: isCharacterSelected ? "3px solid red" : "",
                    position: "relative",
                    display: "inline-block"
                  }}
                >
                  <img
                    src={characterUrl}
                    alt="wrong img addr"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain", // 이미지 비율 유지
                      display: "block" // 공백 제거
                    }}
                  />
                </div>
              </Resizable>
            </Draggable>
          )}
          {logoUrl && (
            <Draggable
              position={logoPosition}
              onStop={(e, data) => {
                // 드래그 종료 후 최종 위치 저장
                setLogoPosition({ x: data.x, y: data.y });
              }}
            >
              <Resizable
                size={logoSize}
                onResizeStop={(e, direction, ref, d) => {
                  // 크기 조절 종료 후 최종 크기 저장
                  setLogoSize({
                    width: logoSize.width + d.width,
                    height: logoSize.height + d.height
                  });
                }}
                // style={{ display: "inline-block" }}
              >
                <div
                  ref={logoRef} // 로고 이미지 컨테이너에 ref 설정
                  onClick={() => setIsLogoSelected((prev) => !prev)} // 클릭 시 선택 상태 토글
                  style={{
                    border: isLogoSelected ? "3px solid red" : "",
                    position: "relative",
                    display: "inline-block"
                  }}
                >
                  <img
                    src={logoUrl}
                    alt="wrong img addr"
                    style={{
                      // border: isLogoSelected ? "3px solid red" : "",
                      width: "100%",
                      height: "100%",
                      objectFit: "contain", // 이미지 비율 유지
                      display: "block" // 공백 제거
                    }}
                  />
                </div>
              </Resizable>
            </Draggable>
          )}
        </div>
        <button className="btn" disabled={saving} onClick={saveCustomBanner}>
          {saving ? "Saving Now..." : "Save"}
        </button>
        <br></br>
        <br></br>
        <br></br>
        <button
          className="btn1"
          onClick={example0set}
          style={{ margin: "0 10px" }}
        >
          Sample 0
        </button>
        <button
          className="btn1"
          onClick={example1set}
          style={{ margin: "0 10px" }}
        >
          Sample 1
        </button>
        <button
          className="btn1"
          onClick={example2set}
          style={{ margin: "0 10px" }}
        >
          Sample 2
        </button>
        <button
          className="btn1"
          onClick={example3set}
          style={{ margin: "0 10px" }}
        >
          Sample 3
        </button>
        <button
          className="btn1"
          onClick={example4set}
          style={{ margin: "0 10px" }}
        >
          Sample 4
        </button>
        <button
          className="btn1"
          onClick={example5set}
          style={{ margin: "0 10px" }}
        >
          Sample 5
        </button>
      </div>
    </div>
  );
}
