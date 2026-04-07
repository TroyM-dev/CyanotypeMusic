import { Link, useNavigate } from 'react-router-dom';
import { audioFileStore } from '../lib/audioFileStore';
import { Sparkles, Mic2, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';

const features = [
  {
    icon: Sparkles,
    label: 'Prompt Generator',
    description: 'Describe your musical vision — genre, mood, instruments, tempo, references — and get a rich, detailed prompt ready to use with any AI music tool or as a creative brief for your next session.',
    href: '/prompt-generator',
    cta: 'Generate a Prompt',
    gradient: 'from-amber-500/10 to-orange-500/5',
    accent: 'text-amber-400',
    border: 'hover:border-amber-500/40',
  },
  {
    icon: Mic2,
    label: 'Audio Feedback',
    description: 'Upload a track or demo and receive deep, detailed AI feedback on your composition, arrangement, mixing, dynamics, and more — like having a seasoned producer listen alongside you.',
    href: '/audio-feedback',
    cta: 'Get Feedback',
    gradient: 'from-teal-500/10 to-cyan-500/5',
    accent: 'text-teal-500',
    border: 'hover:border-teal-500/40',
    isAudio: true,
  },
];

export default function Home() {
  const navigate = useNavigate();

  const handleAudioDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('audio/')) {
      audioFileStore.set(f);
      navigate('/audio-feedback');
    }
  };
  return (
    <Layout>
      {/* Hero */}
      <div className="text-center mb-16 pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow inline-block"></span>
          Let AI Power Your Creativity
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-5 leading-tight">
          You Create<br />
          <span className="text-primary">We Listen</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
          AI-powered prompts and feedback designed to support your creative process — not direct it. Take what resonates, leave what doesn't. Your music, your call.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        {features.map(({ icon: Icon, label, description, href, cta, gradient, accent, border, isAudio }) => (
          isAudio ? (
            <div
              key={href}
              onDrop={handleAudioDrop}
              onDragOver={e => e.preventDefault()}
              className={`group relative rounded-2xl border border-border/60 bg-gradient-to-br ${gradient} p-8 transition-all duration-300 ${border} hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-1`}
            >
              <Link to={href} className="block">
                <div className={`w-12 h-12 rounded-xl border border-border/60 bg-card flex items-center justify-center mb-5 ${accent}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold mb-3 text-foreground">{label}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{description}</p>
              </Link>
              <div className="rounded-xl border-2 border-dashed border-teal-500/30 bg-teal-500/5 flex flex-col items-center justify-center py-4 gap-1.5 mb-4 cursor-pointer hover:border-teal-500/60 hover:bg-teal-500/10 transition-all"
                onClick={() => navigate(href)}>
                <Mic2 className="w-5 h-5 text-teal-500/60" />
                <p className="text-xs text-teal-600/70 font-medium">Drop audio here to start</p>
              </div>
              <Link to={href} className={`flex items-center gap-2 text-sm font-medium ${accent}`}>
                {cta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ) : (
            <Link
              key={href}
              to={href}
              className={`group relative rounded-2xl border border-border/60 bg-gradient-to-br ${gradient} p-8 transition-all duration-300 ${border} hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-1`}
            >
              <div className={`w-12 h-12 rounded-xl border border-border/60 bg-card flex items-center justify-center mb-5 ${accent}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{label}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{description}</p>
              <div className={`flex items-center gap-2 text-sm font-medium ${accent}`}>
                {cta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          )
        ))}
      </div>

      {/* Footer hint */}
      <p className="text-center text-muted-foreground/50 text-xs mt-16">
        No music generated — pure intelligence for human creators.
      </p>
    </Layout>
  );
}