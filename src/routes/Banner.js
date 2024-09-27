import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { fileUploadSelectedImg, fileUploadAllTag } from '../api/fileUploadToS3';

const apikey = process.env.REACT_APP_APIKEY;

export default function Banner() {
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(150);
  const [padding, setPadding] = useState(10);
  const [alignItems, setalignItems] = useState('center');
  const [title, setTitle] = useState('This is a banner!');
  const [titleFontSize, setTitleFontSize] = useState(16);
  const [subtitle, setSubtitle] = useState('');
  const [subtitleFontSize, setSubtitleFontSize] = useState(12);
  const [backgroundColor, setBackgroundColor] = useState('#ffe157');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [titleColor, setTitleColor] = useState('#000000');
  const [subtitleColor, setSubtitleColor] = useState('#555555');

  const [imageUrl, setImageUrl] = useState(''); //이게 test2의 imageSrc
  const [imageWidth, setImageWidth] = useState(100);
  const [imageHeight, setImageHeight] = useState(100);
  const [imagePositionX, setImagePositionX] = useState(0);
  const [imagePositionY, setImagePositionY] = useState(0);

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false); //ai 이미지생성중
  const [saving, setSaving] = useState(false); // 배너완성 저장중
  const [imageUrls, setImageUrls] = useState([]); //ai 생성된 이미지들
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  const [base64Image, setBase64Image] = useState(null);
  // const [imageSrc, setImageSrc] = useState(null);
  const [isCaptured, setIsCaptured] = useState(false); //이기술의핵심 졸라중요
  // 로컬에 저장시키고 그때만 ture로 바꿈

  const [imageFile, setImageFile] = useState(null);
  const [prompt2, setPrompt2] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [editedImageUrl, setEditedImageUrl] = useState(null);
  const [editGenerating, setEditGenerating] = useState(false);

  const bannerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    padding: `${padding}px`,
    justifyContent: 'center',
    backgroundColor: backgroundColor,
    display: 'flex',
    alignItems: alignItems,
    border: '1px solid #ccc',
    fontFamily: fontFamily,
    flexDirection: 'column',
    boxSizing: 'border-box',
    position: 'relative',
  };

  const titleStyle = {
    fontSize: `${titleFontSize}px`,
    color: titleColor,
    fontWeight: 'bold',
  };

  const subtitleStyle = {
    fontSize: `${subtitleFontSize}px`,
    color: subtitleColor,
  };

  const imageStyle = {
    position: 'absolute',
    top: `${imagePositionY}px`,
    left: `${imagePositionX}px`,
    width: `${imageWidth}px`,
    height: `${imageHeight}px`,
  };

  const makeImageFromAi = async (e) => {
    e.preventDefault();
    setLoading(true);
    setImageUrls([]);

    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: apikey
          Authorization: apikey,
        },
        body: JSON.stringify({
          prompt: prompt,
          n: 3,
          size: '256x256',
        }),
      });

      const data = await res.json();
      const urls = data.data.map((imageData) => imageData.url);
      setImageUrls(urls);
    } catch (error) {
      console.error('Error:', error);
      setImageUrls(['Error generating images.']);
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
      console.log('저장 실행 시작::', selectedImageUrl);
      setSaving(true);

      let width = 0;
      let height = 0;

      // selectedImageUrl이 있을 때만 fileUploadSelectedImg 실행
      if (selectedImageUrl) {
        const response = await fileUploadSelectedImg(selectedImageUrl);

        // console.log('서버 응답:', response);
        setBase64Image(response.base64Image);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setIsCaptured(true);

      const element = document.getElementById('customBanner');

      if (!element) {
        console.error('customBanner 요소를 찾을 수 없습니다.');
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
        backgroundColor: null, // 투명 배경 설정
      });

      const dataURL = canvas.toDataURL('image/png');

      // 파일명때문에 현재 시간 시분초
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const fileName = `banner${hours}${minutes}${seconds}.png`;

      await fileUploadAllTag(dataURL, fileName);

      //서버저장후 다시불러오지않고 바로 data로 로컬에 저장 = 서버에 저장로직 지워도됨
      const link = document.createElement('a');
      link.href = dataURL; // dataURL을 href로 설정
      link.download = fileName; // 다운로드할 파일명
      document.body.appendChild(link);
      link.click(); // 링크 클릭하여 다운로드 실행
      document.body.removeChild(link); // 링크 제거

      setIsCaptured(false);
      setSaving(false);
    } catch (error) {
      console.error('이미지 업로드 중 오류 발생:', error);
      setSaving(false);
    }
  };

  const example1set = async () => {
    setWidth(460);
    setHeight(150);
    setPadding(30);
    setTitle('KB 100세만족 연금보험 무배당');
    setSubtitle('(100세보증형)');
    setTitleFontSize(18);
    setSubtitleFontSize(14);
    setTitleColor('#000000');
    setSubtitleColor('#000000');
    setalignItems('start');
    setFontFamily('Arial');
    setPrompt(
      'hug grandmon and grandpa each other picture look like illerstrate'
    );

    setImageWidth(130);
    setImageHeight(130);
    setImagePositionX(310);
    setImagePositionY(18);
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
    console.log('편집시작');
    setEditGenerating(true);
    console.log(prompt2);
    console.log(imageFile);
    const formData = new FormData();
    formData.append('image', imageFile); // 이미지 파일 추가
    formData.append('prompt', prompt2); // 프롬프트 추가 (예: "해를 파란색으로 바꿔줘")
    formData.append('n', 1); // 생성할 이미지 개수 (1개)
    formData.append('size', '256x256'); // 이미지 크기

    try {
      const response = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          Authorization: apikey,
          // 'Content-Type': 'multipart/form-data'는 FormData 사용 시 자동으로 설정
        },
        body: formData,
      });

      const data = await response.json();

      console.log('리턴받은url', data.data[0].url);
      setEditedImageUrl(data.data[0].url);

      setEditGenerating(false);
    } catch (error) {
      console.error('Error:', error);
      setEditGenerating(false);
    }
  };

  useEffect(() => {
    if (base64Image) {
      // base64 데이터를 Blob으로 변환
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

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
  // console.log("프롬프트 :: ", prompt);
  // console.log("프롬프트 :: ", alignItems);
  // console.log("프롬프트 :: ", fontFamily);

  return (
    <div style={{ backgroundColor: '#f1edea' }}>
      <div className='wrap'>
        <form>
          <h2 className='title'>Banner</h2>
          <div className='container'>
            <div className='box'>
              <label>Width </label>
              <input
                type='number'
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
              <span>( px )</span>
            </div>
            <div className='box'>
              <label>Height </label>
              <input
                type='number'
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <span>( px )</span>
            </div>
            <div className='box'>
              <label>Padding </label>
              <input
                type='number'
                value={padding}
                onChange={(e) => setPadding(e.target.value)}
              />
              <span>( px )</span>
            </div>
            <div>
              <label>Background Color </label>
              <input
                type='color'
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
            </div>
          </div>
          <h2 className='title'>Text</h2>
          <div className='container'>
            <div className='box'>
              <label>Title</label>
              <input
                className='w100'
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className='box'>
              <label className='sub_title'>SubTitle</label>
              <textarea
                className='w100'
                type='text'
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>
            <div className='box'>
              <label>Title FontSize</label>
              <input
                type='number'
                value={titleFontSize}
                onChange={(e) => setTitleFontSize(e.target.value)}
              />
              <span>( px )</span>
            </div>

            <div className='box'>
              <label>Subtitle FontSize</label>
              <input
                type='number'
                value={subtitleFontSize}
                onChange={(e) => setSubtitleFontSize(e.target.value)}
              />
              <span>( px )</span>
            </div>
            <div className='box'>
              <label>Title Color</label>
              <input
                type='color'
                value={titleColor}
                onChange={(e) => setTitleColor(e.target.value)}
              />
            </div>
            <div className='box'>
              <label>SubTitle Color</label>
              <input
                type='color'
                value={subtitleColor}
                onChange={(e) => setSubtitleColor(e.target.value)}
              />
            </div>
            <div className='box'>
              <label>Text Align</label>
              <select
                value={alignItems}
                onChange={(e) => setalignItems(e.target.value)}
              >
                <option value='start'>Left</option>
                <option value='center'>Center</option>
                <option value='flex-end'>Right</option>
              </select>
            </div>
            <div>
              <label>Text Font</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
              >
                <option value='Arial'>Arial</option>
                <option value='Courier New'>Courier New</option>
                <option value='Georgia'>Georgia</option>
                <option value='Times New Roman'>Times New Roman</option>
                <option value='Verdana'>Verdana</option>
              </select>
            </div>
          </div>
          <h2 className='title'>Image</h2>
          <div className='container'>
            <div className='box'>
              <label>Image Width</label>
              <input
                type='number'
                value={imageWidth}
                onChange={(e) => setImageWidth(e.target.value)}
              />
              <span>( px )</span>
            </div>
            <div className='box'>
              <label>Image Height</label>
              <input
                type='number'
                value={imageHeight}
                onChange={(e) => setImageHeight(e.target.value)}
              />
              <span>( px )</span>
            </div>
            <div className='box'>
              <label>Image Position X</label>
              <input
                type='number'
                value={imagePositionX}
                onChange={(e) => setImagePositionX(e.target.value)}
              />
              <span>( px )</span>
            </div>
            <div className='box'>
              <label>Image Position Y</label>
              <input
                type='number'
                value={imagePositionY}
                onChange={(e) => setImagePositionY(e.target.value)}
              />
              <span>( px )</span>
            </div>
            <div className='box' style={{ borderBottom: 'none' }}>
              <label>Image URL</label>
              <input
                className='w100'
                type='text'
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>
        </form>
        <div className='form_box'>
          <label>Generated Images</label>
          <div className='form_cont'>
            <form onSubmit={makeImageFromAi}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='Enter prompt for image generation'
              />
              <button type='submit' disabled={loading}>
                {loading ? 'Generating...' : 'Confirm'}
              </button>
              <button
                type='button'
                disabled={loading}
                onClick={() => setImageUrl('')}
              >
                Delete
              </button>
            </form>
            {imageUrls.length > 0 && (
              <div className='ml20'>
                <h2 className='title'>Generated Images:</h2>
                <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
                  {imageUrls.map((url, index) => (
                    <div key={index}>
                      <img
                        src={url}
                        alt={`Generated ${index + 1}`}
                        style={{
                          maxWidth: '150px',
                          maxHeight: '150px',
                          cursor: 'pointer',
                          border:
                            selectedImageUrl === url ? '3px solid red' : 'none',
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
        <div className='form_box'>
          <label>Edit Images</label>
          <div className='form_cont'>
            <input
              style={{ margin: '10px 0 5px 20px' }}
              type='file'
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className='ml20'>
                {/* <h2 className='title'>선택한이미지</h2> */}
                <img src={imagePreview} alt='preview' />
              </div>
            )}
            <div style={{ display: 'flex' }}>
              <textarea
                className='w100'
                type='text'
                placeholder='Enter prompt for image edit (ex: 해를 파란색으로 바꿔줘)'
                value={prompt2}
                onChange={(e) => setPrompt2(e.target.value)}
              />
              <button onClick={editImage} disabled={editGenerating}>
                {editGenerating ? 'Editing...' : 'Edit Image'}
              </button>
            </div>
            {editedImageUrl && (
              <div className='ml20'>
                <h2 className='title'>Edit Images:</h2>
                <img
                  src={editedImageUrl}
                  alt='Edited'
                  style={{
                    maxWidth: '150px',
                    maxHeight: '150px',
                    cursor: 'pointer',
                    border:
                      selectedImageUrl === editedImageUrl
                        ? '3px solid red'
                        : 'none',
                  }}
                  onClick={() => handleImageSelection(editedImageUrl)}
                />
              </div>
            )}
          </div>

          {/* 편집된 이미지가 있을 경우 화면에 출력 */}
        </div>
      </div>
      {/* Banner output */}
      <div className='banner_wrap'>
        <h2 className='title'>Preview</h2>
        <br />
        <div id='customBanner' style={bannerStyle}>
          <div style={titleStyle}>{title}</div>
          {subtitle && (
            <div style={{ ...subtitleStyle, whiteSpace: 'pre-wrap' }}>
              {subtitle}
            </div>
          )}
          {imageUrl && (
            <img
              src={isCaptured ? imageUrl : selectedImageUrl}
              alt='wrong img addr'
              style={imageStyle}
            />
          )}
        </div>
        <button className='btn' disabled={saving} onClick={saveCustomBanner}>
          {saving ? 'Saving Now...' : 'Save'}
        </button>
        <button className='btn' onClick={example1set}>
          Sample 1
        </button>
      </div>
    </div>
  );
}
