export async function analyzeCode(
  files: { path: string; content: string }[],
  userQuery?: string
) {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contextFiles: files,
      prompt: userQuery
    })
  });
  
  if (!response.ok) {
    throw new Error(`AI Analysis failed: ${response.statusText}`);
  }
  
  return response.json();
}

export async function thinkAndSuggest(
  history: { role: string; content: string }[],
  currentInput: string,
  context: string
) {
  const response = await fetch('/api/ai/think', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      history,
      currentInput,
      context
    })
  });

  if (!response.ok) {
    throw new Error(`AI Thinking failed: ${response.statusText}`);
  }

  return response.json();
}

export async function generateBlueprint(
  files: { path: string; content: string }[],
  context: string
) {
  const response = await fetch('/api/ai/blueprint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contextFiles: files,
      context
    })
  });

  if (!response.ok) {
    throw new Error(`Blueprint generation failed: ${response.statusText}`);
  }

  return response.json();
}
