import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_MODEL = 'gemini-2.5-flash-preview-04-17';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { fileUrl, fileName, notes, aspects, tier } = await req.json();

    if (!fileUrl) return Response.json({ error: 'No file URL provided' }, { status: 400 });

    // Step 1: Fetch the audio file as a stream
    const audioRes = await fetch(fileUrl);
    if (!audioRes.ok) return Response.json({ error: 'Failed to fetch audio file' }, { status: 500 });

    const mimeType = audioRes.headers.get('content-type') || 'audio/mpeg';
    const fileSize = audioRes.headers.get('content-length');

    // Step 2: Upload to Gemini Files API (streams directly, no base64 in memory)
    const uploadRes = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'X-Goog-Upload-Protocol': 'raw',
          'X-Goog-Upload-Header-Content-Type': mimeType,
          ...(fileSize ? { 'X-Goog-Upload-Header-Content-Length': fileSize } : {}),
          'Content-Type': mimeType,
        },
        body: audioRes.body,
        duplex: 'half',
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      return Response.json({ error: `File upload failed: ${err}` }, { status: 500 });
    }

    const uploadData = await uploadRes.json();
    const fileUri = uploadData.file?.uri;
    if (!fileUri) return Response.json({ error: 'No file URI returned from Gemini' }, { status: 500 });

    // Step 3: Generate feedback using the uploaded file
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

    const genRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { file_data: { mime_type: mimeType, file_uri: fileUri } }
            ]
          }],
          generationConfig: {
            temperature: tier === 'advanced' ? 0.7 : 0.5,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    const genData = await genRes.json();
    if (!genRes.ok) {
      return Response.json({ error: genData.error?.message || 'Gemini generation error' }, { status: 500 });
    }

    const feedback = genData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!feedback) return Response.json({ error: 'No feedback generated' }, { status: 500 });

    return Response.json({ feedback });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});