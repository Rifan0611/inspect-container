import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Helper to convert a Blob/File to base64 required by Gemini API
 */
const fileToGenerativePart = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(",")[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type || "image/jpeg",
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const getGeminiApiKey = () => {
  let key = localStorage.getItem('gemini_api_key');
  if (!key) {
    key = window.prompt("Aplikasi membutuhkan Google Gemini API Key untuk fitur Scan OCR tingkat lanjut.\n\nSilakan buat API Key gratis di: https://aistudio.google.com/app/apikey\nLalu masukkan kode API Key tersebut di bawah ini:");
    if (key && key.trim().length > 0) {
      localStorage.setItem('gemini_api_key', key.trim());
      return key.trim();
    }
    return null;
  }
  return key;
};

/**
 * Extract container number using Gemini Vision
 * @param {Blob | File} file Image file
 * @param {string} apiKey User's Gemini API Key
 * @returns {Promise<string|null>} Extracted container number or null
 */
export const scanContainerWithGemini = async (file, apiKey) => {
  if (!apiKey) {
    throw new Error("API Key tidak ditemukan.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
Deteksi dan baca nomor container pada foto.
Fokus hanya pada kode container utama yang berada di badan container.

Aturan:
- Format: XXXX1234567
- 4 huruf + 7 angka
- Huruf kapital semua
- Abaikan tulisan lain seperti logo, berat, warning, atau stiker.

Keluarkan hasil dalam format JSON:
{
  "container_number": ""
}`;

  try {
    const imagePart = await fileToGenerativePart(file);
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    // Parse JSON
    try {
      // Find JSON block if Gemini wraps it in ```json ... ```
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      return parsed.container_number || null;
    } catch (parseError) {
      console.error("Gagal parse JSON dari Gemini:", responseText);
      // Fallback regex if JSON parsing fails but text has something that looks like container
      const clean = responseText.replace(/[^A-Z0-9]/g, '');
      const match = clean.match(/[A-Z]{4}[0-9]{7}/);
      return match ? match[0] : null;
    }
  } catch (err) {
    console.error("Gemini API Error:", err);
    throw err;
  }
};
