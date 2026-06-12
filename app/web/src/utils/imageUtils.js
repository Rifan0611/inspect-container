export const compressImageToBase64 = (file, callback) => {
  if (!file || !(file instanceof Blob)) {
    return callback(null);
  }
  
  const timeoutId = setTimeout(() => {
    console.error("compressImageToBase64 timeout");
    callback(null);
  }, 10000); // 10 seconds timeout

  const cleanup = () => clearTimeout(timeoutId);

  const objectUrl = URL.createObjectURL(file);
  const img = new Image();
  
  img.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const maxDim = 600; // Smaller dimension for fast upload and preview
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      cleanup();
      URL.revokeObjectURL(objectUrl);
      callback(dataUrl);
    } catch (e) {
      console.error("Canvas compression failed:", e);
      cleanup();
      URL.revokeObjectURL(objectUrl);
      callback(null);
    }
  };
  
  img.onerror = () => {
    console.error("Image load failed");
    cleanup();
    URL.revokeObjectURL(objectUrl);
    callback(null);
  };
  
  img.src = objectUrl;
};

export const compressImage = (file) => {
  return new Promise((resolve) => {
    if (!file || !(file instanceof Blob)) {
      return resolve(file);
    }
    
    const timeoutId = setTimeout(() => {
      console.error("compressImage timeout");
      resolve(file);
    }, 10000);

    const cleanup = () => clearTimeout(timeoutId);

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          const contrast = 1.5; 
          let color = ((gray / 255 - 0.5) * contrast + 0.5) * 255;
          color = Math.min(255, Math.max(0, color));
          
          data[i] = color;
          data[i + 1] = color;
          data[i + 2] = color;
        }
        ctx.putImageData(imageData, 0, 0);
        
        canvas.toBlob((blob) => {
          cleanup();
          URL.revokeObjectURL(objectUrl);
          resolve(blob);
        }, "image/jpeg", 0.9);
      } catch (e) {
        console.error("OCR compress failed:", e);
        cleanup();
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      }
    };
    
    img.onerror = () => {
      cleanup();
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    
    img.src = objectUrl;
  });
};
