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