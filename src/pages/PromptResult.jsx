import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Copy, Check, ArrowLeft, FolderOpen, Sparkles, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Layout from '../components/Layout';
import { base44 } from '@/api/base44Client';

export default function PromptResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [project, setProject] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const rec = await base44.entities.PromptRecord.get(id);
      setRecord(rec);
      if (rec?.project_id) {
        const proj = await base44.entities.Project.get(rec.project_id);
        setProject(proj);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const copy = () => {
    navigator.clipboard.writeText(record.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteRecord = async () => {
    await base44.entities.PromptRecord.delete(id);
    navigate('/history');
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </Layout>
  );

  if (!record) return (
    <Layout>
      <div className="text-center py-32 text-muted-foreground">Prompt not found.</div>
    </Layout>
  );

  const tags = [record.genre, record.mood, record.tempo].filter(Boolean);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Back nav */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/history" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to History
          </Link>
          <Link to="/prompt-generator" className="flex items-center gap-2 text-sm text-primary hover:opacity-80 transition-opacity">
            <Sparkles className="w-4 h-4" /> New Prompt
          </Link>
        </div>

        {/* Header card */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                {record.title || 'Generated Prompt'}
              </h1>
              {project && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                  <FolderOpen className="w-4 h-4" />
                  <span>{project.name}</span>
                </div>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-md bg-secondary text-xs text-muted-foreground font-medium">{t}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={copy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all">
                {copied ? <><Check className="w-3.5 h-3.5" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
              </button>
              <button onClick={deleteRecord}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground border border-border/60 hover:text-destructive hover:border-destructive/40 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Prompt content */}
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent p-8">
          <ReactMarkdown
            className="prose prose-invert max-w-none
              prose-headings:text-amber-300 prose-headings:font-bold
              prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-0
              prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
              prose-p:text-foreground/85 prose-p:leading-relaxed prose-p:my-3
              prose-strong:text-foreground prose-strong:font-semibold
              prose-ul:my-3 prose-li:my-1.5 prose-li:text-foreground/85"
            components={{
              h2: ({ children }) => (
                <div className="mt-10 mb-4">
                  <div className="border-t border-border/40 mb-6" />
                  <h2 className="text-2xl font-bold text-amber-300">{children}</h2>
                </div>
              ),
            }}
          >
            {record.result}
          </ReactMarkdown>
        </div>
      </div>
    </Layout>
  );
}