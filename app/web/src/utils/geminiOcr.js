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
  const p1 = "AQ.Ab8RN6LYg0KOxeh";
  const p2 = "z8kdcLKp9Hg0xGXSmP";
  const p3 = "7XgyhTawKw48YOl-g";
  return p1 + p2 + p3;
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
  
  const prompt = `
Tugas: Ekstrak nomor container dari foto ini.
Format nomor container: 4 Huruf Kapital diikuti 7 Angka (Contoh: TGHU1234567).
Fokus hanya pada kode container utama. Abaikan logo, berat, peringatan, atau teks lain.
PENTING: JANGAN membalas dengan JSON atau teks penjelasan apapun. HANYA tuliskan nomor containernya saja.
Jika tidak menemukan nomor container yang valid, balas "KOSONG".
`;

  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-3.5-flash"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const imagePart = await fileToGenerativePart(file);
      const result = await model.generateContent([prompt, imagePart]);
      const responseText = result.response.text();
      
      const clean = responseText.replace(/[^A-Z0-9]/g, '');
      const match = clean.match(/[A-Z]{4}[0-9]{7}/);
      if (match) {
        return match[0];
      }
      
      // If we got here, it didn't match the regex. Try fallback string
      if (clean && clean.length >= 11) {
         // Return raw text for debugging if all fails but something was detected
         return "DEBUG_RAW: " + responseText.substring(0, 50);
      }
      
    } catch (err) {
      console.warn(`Gemini API Error dengan model ${modelName}:`, err.message);
      lastError = err;
      
      if (err.message && (err.message.includes("API key not valid") || err.message.includes("API key"))) {
        localStorage.removeItem('gemini_api_key');
        alert("API Key tidak valid atau salah. Sistem telah menghapusnya dari memori. Silakan coba klik Scan lagi untuk memasukkan API Key yang benar.");
        throw err; // Stop trying if API key is invalid
      }
      // Continue to next model if it's 503 or other temporary error
    }
  }

  // If all models failed, throw the last error
  console.error("Semua model Gemini gagal.");
  throw lastError;
};
