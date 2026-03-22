import { useState } from 'react';
import { Sparkles, Copy, Check, RotateCcw } from 'lucide-react';
import Layout from '../components/Layout';
import { base44 } from '@/api/base44Client';

const GENRES = ['Electronic', 'Hip-Hop', 'Jazz', 'Classical', 'Rock', 'Ambient', 'R&B', 'Folk', 'Metal', 'Pop', 'Experimental', 'World'];
const MOODS = ['Euphoric', 'Melancholic', 'Tense', 'Peaceful', 'Aggressive', 'Nostalgic', 'Dreamy', 'Dark', 'Uplifting', 'Mysterious'];
const TEMPOS = ['Very Slow (< 60 BPM)', 'Slow (60–80 BPM)', 'Moderate (80–100 BPM)', 'Upbeat (100–130 BPM)', 'Fast (130–160 BPM)', 'Very Fast (160+ BPM)'];

export default function PromptGenerator() {
  const [form, setForm] = useState({
    genre: '',
    mood: '',
    tempo: '',
    instruments: '',
    references: '',
    description: '',
    purpose: '',
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const generate = async () => {
    setLoading(true);
    setResult('');
    const prompt = `You are an expert music producer and creative director. Based on the following directions, generate a richly detailed, actionable music production prompt that a musician or producer could use as a creative brief or feed into an AI music tool.

Details:
- Genre/Style: ${form.genre || 'Not specified'}
- Mood/Emotion: ${form.mood || 'Not specified'}
- Tempo: ${form.tempo || 'Not specified'}
- Instruments/Sounds: ${form.instruments || 'Not specified'}
- Artist/Song References: ${form.references || 'None'}
- Additional Description: ${form.description || 'None'}
- Purpose/Context: ${form.purpose || 'Not specified'}

Generate a detailed, inspiring, and technically specific music prompt. Cover elements like: sonic texture, arrangement structure, key/scale suggestions, production techniques, atmosphere, dynamics, and any other relevant musical details. Be vivid and precise. Format it as a flowing, professional creative brief.`;

    const res = await base44.integrations.Core.InvokeLLM({ prompt });
    setResult(res);
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canGenerate = form.genre || form.mood || form.description;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Prompt Generator</h1>
          </div>
          <p className="text-muted-foreground text-sm">Fill in as much or as little as you like — the AI will build a rich, detailed creative prompt from your directions.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {/* Genre */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Genre / Style</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <button key={g} onClick={() => set('genre', form.genre === g ? '' : g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.genre === g ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Mood / Emotion</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(m => (
                <button key={m} onClick={() => set('mood', form.mood === m ? '' : m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.mood === m ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tempo */}
        <div className="mb-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Tempo</label>
          <div className="flex flex-wrap gap-2">
            {TEMPOS.map(t => (
              <button key={t} onClick={() => set('tempo', form.tempo === t ? '' : t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.tempo === t ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Text inputs */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Instruments / Sounds</label>
            <input value={form.instruments} onChange={e => set('instruments', e.target.value)}
              placeholder="e.g. Rhodes piano, 808 bass, reverb guitar…"
              className="w-full bg-card border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Artist / Song References</label>
            <input value={form.references} onChange={e => set('references', e.target.value)}
              placeholder="e.g. Boards of Canada, Blade Runner OST…"
              className="w-full bg-card border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all" />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Additional Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
            placeholder="Describe anything else — visual imagery, narrative, energy, scene…"
            className="w-full bg-card border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none" />
        </div>

        <div className="mb-6">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Purpose / Context</label>
          <input value={form.purpose} onChange={e => set('purpose', e.target.value)}
            placeholder="e.g. Film score, album opener, club banger, meditation playlist…"
            className="w-full bg-card border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all" />
        </div>

        <button onClick={generate} disabled={!canGenerate || loading}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? (
            <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Generating…</>
          ) : (
            <><Sparkles className="w-4 h-4" />Generate Prompt</>
          )}
        </button>

        {/* Result */}
        {result && (
          <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Your Music Prompt</span>
              <div className="flex gap-2">
                <button onClick={() => { setResult(''); setForm({ genre:'', mood:'', tempo:'', instruments:'', references:'', description:'', purpose:'' }); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border/60 hover:border-border transition-all">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
                <button onClick={copy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all">
                  {copied ? <><Check className="w-3 h-3" />Copied!</> : <><Copy className="w-3 h-3" />Copy</>}
                </button>
              </div>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{result}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}