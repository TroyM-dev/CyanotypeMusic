import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
  const data = await res.json();
  const audioModels = data.models?.filter(m => m.supportedGenerationMethods?.includes('generateContent'));
  return Response.json({ audioModels: audioModels?.map(m => ({ name: m.name, displayName: m.displayName })) });
});