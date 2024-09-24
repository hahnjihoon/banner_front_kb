export async function fileUploadToS3(formData) {
  const response = await fetch(
    `http://43.201.242.149/filemanage/fileuploads3`,
    {
      method: "POST",
      body: formData
    }
  );

  // response 응답 체크 후 에러 발생로직
  if (!response.ok) {
    throw new Error("이미지업로드 실패했습니다.");
  }
  const body = await response.json();
  console.log(body);
  return body;
} //기존 백엔드에있는 api 사용해본거

export async function fileUploadAllTag(htmlContent, outputFileName) {
  console.log("최종 저장할 데이터::", outputFileName);

  const response = await fetch(`http://43.201.19.68:8081/save`, {
    // const response = await fetch(`http://192.168.0.137:8081/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      htmlContent: htmlContent, // base64 데이터
      outputFileName: outputFileName // 파일명
    })
  });

  // response 응답 체크 후 에러 발생 로직
  if (!response.ok) {
    throw new Error("이미지 업로드 실패했습니다.");
  }
  const body = await response.json();
  console.log(body);
  return body;
}

export async function fileUploadSelectedImg(imageUrl) {
  const response = await fetch(`http://43.201.19.68:8081/save/saveselecte`, {
    // const response = await fetch(`http://192.168.0.137:8081/save/saveselecte`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ imageUrl }) // imageUrl을 JSON 형식으로 전달
  });

  // response 응답 체크 후 에러 발생 로직
  if (!response.ok) {
    throw new Error("이미지 업로드 실패했습니다.");
  }

  const body = await response.json();
  console.log("저장장소 리턴값:: ", body);
  return body;
}
