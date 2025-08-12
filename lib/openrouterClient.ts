export async function callLlama3API(messages: { role: string; content: string }[]) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000", 
      "X-Title": "AI Accountability Coach"
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3-70b-instruct", 
      messages,
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`OpenRouter error: ${error}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content;
}
