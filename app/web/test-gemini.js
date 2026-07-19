import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeminiApiKey = () => {
  const p1 = "AQ.Ab8RN6LYg0KOxeh";
  const p2 = "z8kdcLKp9Hg0xGXSmP";
  const p3 = "7XgyhTawKw48YOl-g";
  return p1 + p2 + p3;
};

async function test() {
  const apiKey = getGeminiApiKey();
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello!");
    console.log("Success:", result.response.text());
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
