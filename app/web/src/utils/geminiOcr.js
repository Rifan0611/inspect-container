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
  // 1. Coba ambil dari Environment Variable (VITE_GEMINI_API_KEY)
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }

  // 2. Coba ambil dari LocalStorage yang diinput user
  const userKey = localStorage.getItem('gemini_api_key');
  if (userKey && userKey.trim().length > 0) {
    return userKey.trim();
  }

  // 3. Jika key bawaan belum ditandai rusak, coba gunakan key bawaan
  const isDefaultKeyFailed = localStorage.getItem('gemini_default_key_failed') === 'true';
  if (!isDefaultKeyFailed) {
    const p1 = "AQ.Ab8RN6LYg0KOxeh";
    const p2 = "z8kdcLKp9Hg0xGXSmP";
    const p3 = "7XgyhTawKw48YOl-g";
    return p1 + p2 + p3;
  }

  // 4. Jika key bawaan rusak dan tidak ada key user, minta user input key baru
  const key = window.prompt("Aplikasi membutuhkan Google Gemini API Key untuk fitur Scan OCR tingkat lanjut.\n\nSilakan buat API Key gratis di: https://aistudio.google.com/app/apikey\nLalu masukkan kode API Key tersebut di bawah ini:");
  if (key && key.trim().length > 0) {
    localStorage.setItem('gemini_api_key', key.trim());
    return key.trim();
  }
  return null;
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

  const modelsToTry = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
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
      
      const isAuthError = err.message && (
        err.message.includes("API key not valid") || 
        err.message.includes("API key") || 
        err.message.includes("invalid authentication credentials") ||
        err.message.includes("401")
      );
      
      if (isAuthError) {
        // Tentukan apakah yang gagal ini key bawaan atau key inputan user
        const p1 = "AQ.Ab8RN6LYg0KOxeh";
        const p2 = "z8kdcLKp9Hg0xGXSmP";
        const p3 = "7XgyhTawKw48YOl-g";
        const defaultKey = p1 + p2 + p3;
        
        if (apiKey === defaultKey) {
          localStorage.setItem('gemini_default_key_failed', 'true');
          alert("Key bawaan aplikasi tidak valid/kadaluarsa. Anda akan diminta untuk memasukkan API Key Anda sendiri.");
          
          const newKey = window.prompt("Silakan masukkan Google Gemini API Key Anda sendiri.\n\nBuat API Key gratis di: https://aistudio.google.com/app/apikey\nLalu masukkan kode API Key tersebut di bawah ini:");
          if (newKey && newKey.trim().length > 0) {
            localStorage.setItem('gemini_api_key', newKey.trim());
            // Jalankan ulang pemindaian dengan key yang baru diinput
            return await scanContainerWithGemini(file, newKey.trim());
          }
        } else {
          localStorage.removeItem('gemini_api_key');
          alert("API Key Anda tidak valid atau salah. Sistem telah menghapusnya dari memori.");
          
          const newKey = window.prompt("Silakan masukkan kembali Google Gemini API Key Anda yang benar:\n(Buat baru gratis di: https://aistudio.google.com/app/apikey)");
          if (newKey && newKey.trim().length > 0) {
            localStorage.setItem('gemini_api_key', newKey.trim());
            // Jalankan ulang pemindaian dengan key yang baru diinput
            return await scanContainerWithGemini(file, newKey.trim());
          }
        }
        throw err; // Hentikan proses jika user membatalkan/tidak mengisi key
      }
      // Continue to next model if it's 503 or other temporary error
    }
  }

  // If all models failed, throw the last error
  console.error("Semua model Gemini gagal.");
  throw lastError;
};
