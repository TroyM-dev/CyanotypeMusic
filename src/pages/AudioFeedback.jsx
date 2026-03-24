import { useState, useRef } from 'react';
import { Mic2, Upload, X, Copy, Check, RotateCcw, Zap, Crown } from 'lucide-react';
import Layout from '../components/Layout';
import { base44 } from '@/api/base44Client';

const FEEDBACK_ASPECTS = ['Overall Composition', 'Arrangement', 'Mixing & Levels', 'Sound Design', 'Melody & Harmony', 'Rhythm & Groove', 'Dynamics', 'Emotional Impact'];

export default function AudioFeedback() {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [aspects, setAspects] = useState([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tier, setTier] = useState('base');
  const [error, setError] = useState('');
  const inputRef = useRef();

  const toggleAspect = (a) => setAspects(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const handleFile = (f) => {
    if (!f) return;
    const isAudio = f.type.startsWith('audio/') || /\.(mp3|wav|flac|aac|ogg|m4a|aiff|wma)$/i.test(f.name);
    if (isAudio) setFile(f);
    else setError('Unsupported file type. Please upload an audio file (MP3, WAV, FLAC, AAC, etc.).');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const analyze = async () => {
    setLoading(true);
    setResult('');
    setError('');
    try {
      let fileUrl = null;
      if (file) {
        setUploading(true);
        const uploaded = await base44.integrations.Core.UploadFile({ file });
        fileUrl = uploaded.file_url;
        setUploading(false);
      }

      const focusAreas = aspects.length > 0 ? aspects.join(', ') : 'all aspects';

      const prompt = `You are an experienced music producer, mixing engineer, and creative director with decades of experience across many genres. A musician wants professional, honest, and detailed feedback on their music.

Focus areas requested: ${focusAreas}
Additional notes from the artist: ${notes || 'None provided'}

Please listen carefully to the uploaded audio and provide:
1. A brief overall impression of the track
2. Detailed feedback on each requested aspect (composition, arrangement, mixing, sound design, melody/harmony, rhythm, dynamics, emotional impact — cover whichever are relevant)
3. Specific, actionable suggestions for improvement
4. What's working well and should be kept
5. A short encouraging closing note

Be honest, specific, technical where appropriate, and genuinely helpful. Avoid generic advice — be as precise as possible.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: fileUrl ? [fileUrl] : undefined,
        model: tier === 'advanced' ? 'gemini_3_pro' : 'gemini_3_flash',
      });
      setResult(res);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setFile(null); setNotes(''); setAspects([]); setResult(''); setError('');
  };

  const loadingMessage = uploading ? 'Uploading audio…' : tier === 'advanced' ? 'Deep analysis with Gemini Pro…' : 'Analyzing your track with Gemini…';

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-teal-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Audio Feedback</h1>
          </div>
          <p className="text-muted-foreground text-sm">Upload your track and get deep, professional-grade feedback on every aspect of your music.</p>
        </div>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => !file && inputRef.current.click()}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 mb-5 ${
            file ? 'border-teal-500/40 bg-teal-500/5 cursor-default' : 'border-border/60 hover:border-teal-500/40 hover:bg-teal-500/5 cursor-pointer'
          }`}
        >
          <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          {file ? (
            <div className="flex items-center gap-4 px-6 py-5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
                <Mic2 className="w-5 h-5 text-teal-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary border border-border/60 flex items-center justify-center">
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Drop your audio file here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse — MP3, WAV, FLAC, AAC supported</p>
              </div>
            </div>
          )}
        </div>

        {/* Focus Areas */}
        <div className="mb-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Focus Areas <span className="normal-case text-muted-foreground/50">(optional — leave blank for full analysis)</span></label>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_ASPECTS.map(a => (
              <button key={a} onClick={() => toggleAspect(a)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${aspects.includes(a) ? 'bg-teal-500/20 border-teal-500/40 text-teal-600' : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Tier */}
        <div className="mb-5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Analysis Tier</label>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setTier('base')}
              className={`flex flex-col gap-1.5 p-4 rounded-xl border transition-all text-left ${
                tier === 'base' ? 'border-teal-500/50 bg-teal-500/10' : 'border-border/60 hover:border-border bg-card'
              }`}>
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${tier === 'base' ? 'text-teal-500' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-semibold ${tier === 'base' ? 'text-teal-500' : 'text-foreground'}`}>Base</span>
              </div>
              <p className="text-xs text-muted-foreground leading-snug">Fast, solid feedback on your track. Great for quick iterative reviews.</p>
              <span className="text-xs font-medium text-muted-foreground/60 mt-1">Gemini Flash · Standard credits</span>
            </button>
            <button onClick={() => setTier('advanced')}
              className={`flex flex-col gap-1.5 p-4 rounded-xl border transition-all text-left ${
                tier === 'advanced' ? 'border-purple-500/50 bg-purple-500/10' : 'border-border/60 hover:border-border bg-card'
              }`}>
              <div className="flex items-center gap-2">
                <Crown className={`w-4 h-4 ${tier === 'advanced' ? 'text-purple-400' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-semibold ${tier === 'advanced' ? 'text-purple-400' : 'text-foreground'}`}>Advanced</span>
              </div>
              <p className="text-xs text-muted-foreground leading-snug">Deep, nuanced analysis with richer musical understanding and more precise insights.</p>
              <span className="text-xs font-medium text-purple-400/70 mt-1">Gemini Pro · Uses more credits</span>
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Notes for the AI</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="Tell the AI what you were going for, what you're unsure about, or any specific questions…"
            className="w-full bg-card border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all resize-none" />
        </div>

        <button onClick={analyze} disabled={(!file && !notes) || loading}
          className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed ${
            tier === 'advanced' ? 'bg-purple-600 text-white' : 'bg-primary text-primary-foreground'
          }`}>
          {loading ? (
            <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />{loadingMessage}</>
          ) : (
            <>{tier === 'advanced' ? <Crown className="w-4 h-4" /> : <Mic2 className="w-4 h-4" />}Analyze Track</>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-500 font-medium">Error: {error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-8 rounded-2xl border border-teal-500/20 bg-teal-500/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-medium uppercase tracking-wider ${tier === 'advanced' ? 'text-purple-400' : 'text-teal-500'}`}>
                {tier === 'advanced' ? '✦ Advanced AI Feedback' : 'AI Feedback'}
              </span>
              <div className="flex gap-2">
                <button onClick={reset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border/60 hover:border-border transition-all">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
                <button onClick={copy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-teal-600 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all">
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