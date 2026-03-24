import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Copy, Check, ArrowLeft, Mic2, Crown, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Layout from '../components/Layout';
import { base44 } from '@/api/base44Client';

export default function AudioFeedbackResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.AudioFeedbackRecord.get(id).then(r => {
      setRecord(r);
      setLoading(false);
    });
  }, [id]);

  const copy = () => {
    navigator.clipboard.writeText(record.feedback);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteRecord = async () => {
    await base44.entities.AudioFeedbackRecord.delete(id);
    navigate('/audio-feedback');
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
      </div>
    </Layout>
  );

  if (!record) return (
    <Layout>
      <div className="text-center py-32 text-muted-foreground">Feedback not found.</div>
    </Layout>
  );

  const isAdvanced = record.tier === 'advanced';

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Back nav */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/audio-feedback" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Audio Feedback
          </Link>
        </div>

        {/* Header card */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isAdvanced ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-teal-500/10 border border-teal-500/20'}`}>
                {isAdvanced ? <Crown className="w-4 h-4 text-purple-400" /> : <Mic2 className="w-4 h-4 text-teal-500" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{record.file_name || 'Audio Feedback'}</p>
                <p className={`text-xs font-medium ${isAdvanced ? 'text-purple-400/70' : 'text-teal-500/70'}`}>
                  {isAdvanced ? 'Advanced Analysis · Gemini 2.5 Pro' : 'Base Analysis · Gemini 2.5 Flash'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={copy}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  isAdvanced
                    ? 'text-purple-400 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20'
                    : 'text-teal-600 bg-teal-500/10 border-teal-500/20 hover:bg-teal-500/20'
                }`}>
                {copied ? <><Check className="w-3.5 h-3.5" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
              </button>
              <button onClick={deleteRecord}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground border border-border/60 hover:text-destructive hover:border-destructive/40 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {record.aspects?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/40">
              {record.aspects.map(a => (
                <span key={a} className="px-2.5 py-1 rounded-md bg-secondary text-xs text-muted-foreground font-medium">{a}</span>
              ))}
            </div>
          )}
        </div>

        {/* Formatted markdown result */}
        <div className={`rounded-2xl border p-8 bg-gradient-to-b to-transparent ${
          isAdvanced ? 'border-purple-500/20 from-purple-500/5' : 'border-teal-500/20 from-teal-500/5'
        }`}>
          <ReactMarkdown
            className={`prose prose-invert max-w-none
              prose-headings:font-bold
              prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-0
              prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
              prose-p:text-foreground/85 prose-p:leading-relaxed prose-p:my-3
              prose-strong:text-foreground prose-strong:font-semibold
              prose-ul:my-3 prose-li:my-1.5 prose-li:text-foreground/85
              ${isAdvanced ? 'prose-headings:text-purple-300' : 'prose-headings:text-teal-300'}`}
            components={{
              h2: ({ children }) => (
                <div className="mt-10 mb-4">
                  <div className="border-t border-border/40 mb-6" />
                  <h2 className={`text-2xl font-bold ${isAdvanced ? 'text-purple-300' : 'text-teal-300'}`}>{children}</h2>
                </div>
              ),
            }}
          >
            {record.feedback}
          </ReactMarkdown>
        </div>
      </div>
    </Layout>
  );
}