export async function summarizeContent(content: string): Promise<string> {
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  const data = await response.json();
  return data.summary || "Summary unavailable.";
}

export async function enhanceNewsContent(title: string, rawContent: string) {
  const response = await fetch('/api/enhance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content: rawContent })
  });
  return response.json();
}
export async function generateReflectionPrompts(content: string) {
  const response = await fetch('/api/reflect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  return response.json();
}
export async function generateImagePrompt(title: string, content: string): Promise<string> {
  try {
    const response = await fetch('/api/generate-image-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });
    
    if (!response.ok) throw new Error("Failed to generate prompt from API");
    
    const data = await response.json();
    return data.prompt || "Abstract concept of knowledge, technology and news flow";
    
  } catch (error) {
    console.error("Image prompt generation error:", error);
    // Фолбэк (запасной вариант), если API недоступно
    return `Minimalist digital illustration of ${title.substring(0, 50)}`;
  }
}