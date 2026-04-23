
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function enhanceNewsContent(title: string, rawContent: string): Promise<{ content: string; conclusion: string }> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert market analyst and editorial assistant. 
      I have a raw news transcript from a major financial source titled: "${title}".
      
      Raw Content: "${rawContent}"
      
      Task:
      1. Provide a "Word-for-Word" style polished transcript. Keep the original text but make minor adjustments only for better readability and grammatical flow where the raw feed might be fragmented.
      2. Provide a "Market Strategic Conclusion" (1-2 sentences) summarizing the broader market implications of this news.
      
      Return as JSON with keys: "polishedTranscript" and "conclusion".`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      content: data.polishedTranscript || rawContent,
      conclusion: data.conclusion || "Strategic conclusion pending manual review."
    };
  } catch (error) {
    console.error("Error enhancing news content:", error);
    return {
      content: rawContent,
      conclusion: "Unable to generate conclusion at this time."
    };
  }
}

export async function generateImagePrompt(title: string, content: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this stock market/finance article titled "${title}" and its content summary "${content.substring(0, 300)}", generate a concise (max 15 words), descriptive visual prompt for an AI image generator. The style should be professional, clean, and related to finance, data, or global markets. Focus on abstract concepts like "digital trade charts", "bull market sculptures", or "high-tech trading floors". Avoid text in the image. Just output the prompt text.`,
    });
    return response.candidates[0].content.parts[0].text.trim().replace(/["]+/g, '');
  } catch (error) {
    console.error("Error generating image prompt:", error);
    return "professional finance market abstract background";
  }
}

export async function generateReflectionPrompts(content: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on the following content, generate 3 thought-provoking reflection questions for a learner to deepen their understanding: \n\n ${content}`,
      config: {
        maxOutputTokens: 500,
        thinkingConfig: { thinkingBudget: 200 }
      }
    });

    const text = response.text || "";
    // Crude parsing of a list
    return text
      .split('\n')
      .filter(line => line.trim().match(/^\d\./) || line.trim().startsWith('-'))
      .map(line => line.replace(/^\d\.\s*|-\s*/, '').trim())
      .slice(0, 3);
  } catch (error) {
    console.error("Error generating reflection prompts:", error);
    return ["What was the most important takeaway for you?", "How can you apply this to your daily life?", "What challenged your current perspective?"];
  }
}

export async function summarizeContent(content: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following article in 3 clear, concise bullet points for a weekly learner's digest: \n\n ${content}`,
    });
    return response.text || "Summary unavailable.";
  } catch (error) {
    console.error("Error summarizing content:", error);
    return "Failed to generate summary.";
  }
}
