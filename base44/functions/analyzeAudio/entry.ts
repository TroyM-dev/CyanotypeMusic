import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { fileUrl, fileName, notes, aspects, tier } = await req.json();

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const model = tier === 'advanced' ? 'gemini-2.0-flash' : 'gemini-2.0-flash';

    // Fetch the audio file and convert to base64
    const audioRes = await fetch(fileUrl);
    const arrayBuffer = await audioRes.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Audio = btoa(binary);
    const mimeType = audioRes.headers.get('content-type') || 'audio/mpeg';

    const focusAreas = aspects && aspects.length > 0 ? aspects.join(', ') : 'all aspects';

    const prompt = `You are an experienced music producer, mixing engineer, and creative director with decades of experience across many genres. Listen carefully to this audio track and provide professional, honest, and detailed feedback.

Track name: ${fileName || 'Not provided'}
Focus areas requested: ${focusAreas}
Additional notes from the artist: ${notes || 'None provided'}

Please provide detailed feedback covering:
1. A thoughtful overall impression based on what you actually hear
2. Detailed feedback on each requested aspect (composition, arrangement, mixing/levels, sound design, melody/harmony, rhythm/groove, dynamics, emotional impact)
3. Specific, actionable suggestions for improvement
4. What elements are working well
5. A short encouraging closing note

Be honest, specific, and genuinely helpful. Reference specific moments or elements you notice in the audio.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64Audio } }
            ]
          }],
          generationConfig: {
            temperature: tier === 'advanced' ? 0.7 : 0.5,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    const geminiData = await geminiRes.json();
    if (!geminiRes.ok) {
      return Response.json({ error: geminiData.error?.message || 'Gemini API error' }, { status: 500 });
    }

    const feedback = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!feedback) return Response.json({ error: 'No feedback generated' }, { status: 500 });

    return Response.json({ feedback });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});