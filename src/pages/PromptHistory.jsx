import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, ChevronRight, X, Plus, Inbox, Mic2, Crown } from 'lucide-react';
import Layout from '../components/Layout';
import { base44 } from '@/api/base44Client';

const PROJECT_COLORS = ['#f59e0b', '#8b5cf6', '#10b981', '#3b82f6', '#ef4444', '#ec4899', '#06b6d4'];

export default function PromptHistory() {
  const [projects, setProjects] = useState([]);
  const [records, setRecords] = useState([]);
  const [audioRecords, setAudioRecords] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null); // null = All
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'prompts' | 'audio'
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_COLORS[0]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [projs, recs, audioRecs] = await Promise.all([
      base44.entities.Project.list('-created_date'),
      base44.entities.PromptRecord.list('-created_date', 100),
      base44.entities.AudioFeedbackRecord.list('-created_date', 100),
    ]);
    setProjects(projs);
    setRecords(recs);
    setAudioRecords(audioRecs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    await base44.entities.Project.create({ name: newProjectName.trim(), color: newProjectColor });
    setNewProjectName('');
    setShowNewProject(false);
    load();
  };

  const deleteProject = async (e, id) => {
    e.stopPropagation();
    await base44.entities.Project.delete(id);
    if (selectedProject === id) setSelectedProject(null);
    load();
  };

  const filteredPrompts = selectedProject
    ? records.filter(r => r.project_id === selectedProject)
    : records;

  const filteredAudio = audioRecords; // audio records don't have projects

  const allItems = [
    ...filteredPrompts.map(r => ({ ...r, _type: 'prompt' })),
    ...filteredAudio.map(r => ({ ...r, _type: 'audio' })),
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const displayItems = activeTab === 'prompts' ? filteredPrompts.map(r => ({ ...r, _type: 'prompt' }))
    : activeTab === 'audio' ? filteredAudio.map(r => ({ ...r, _type: 'audio' }))
    : allItems;

  const getProject = (id) => projects.find(p => p.id === id);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="flex gap-6">
        {/* Sidebar — Projects */}
        <aside className="w-56 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projects</span>
            <button onClick={() => setShowNewProject(true)}
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* New project form */}
          {showNewProject && (
            <div className="mb-3 rounded-xl border border-border/60 bg-card p-3 space-y-2">
              <input autoFocus value={newProjectName} onChange={e => setNewProjectName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createProject()}
                placeholder="Project name…"
                className="w-full bg-secondary rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40" />
              <div className="flex gap-1.5">
                {PROJECT_COLORS.map(c => (
                  <button key={c} onClick={() => setNewProjectColor(c)}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${newProjectColor === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                    style={{ background: c }} />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={createProject} className="flex-1 text-xs py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all">Create</button>
                <button onClick={() => setShowNewProject(false)} className="px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border/60 transition-all"><X className="w-3 h-3" /></button>
              </div>
            </div>
          )}

          {/* All items */}
          <button onClick={() => setSelectedProject(null)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all mb-1 ${selectedProject === null ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}>
            <Inbox className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left truncate">All History</span>
            <span className="text-xs text-muted-foreground">{records.length + audioRecords.length}</span>
          </button>

          {/* Project list */}
          {projects.map(p => {
            const count = records.filter(r => r.project_id === p.id).length;
            const isActive = selectedProject === p.id;
            return (
              <button key={p.id} onClick={() => setSelectedProject(p.id)}
                className={`group w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all mb-1 ${isActive ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}>
                <div className="w-4 h-4 rounded-sm flex-shrink-0" style={{ background: p.color || '#f59e0b' }} />
                <span className="flex-1 text-left truncate">{p.name}</span>
                <span className="text-xs text-muted-foreground">{count}</span>
                <span onClick={e => deleteProject(e, p.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive">
                  <X className="w-3 h-3" />
                </span>
              </button>
            );
          })}
        </aside>

        {/* Main — History list */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold tracking-tight">
              {selectedProject ? (getProject(selectedProject)?.name || 'Project') : 'All History'}
            </h1>
            <div className="flex items-center gap-2">
              <Link to="/audio-feedback"
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-teal-500/40 text-teal-500 text-sm font-medium hover:bg-teal-500/10 transition-all">
                <Mic2 className="w-4 h-4" /> New Feedback
              </Link>
              <Link to="/prompt-generator"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all">
                <Sparkles className="w-4 h-4" /> New Prompt
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 p-1 bg-secondary rounded-xl w-fit">
            {[['all', 'All'], ['prompts', 'Prompts'], ['audio', 'Audio Feedback']].map(([val, label]) => (
              <button key={val} onClick={() => setActiveTab(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === val ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                {label}
              </button>
            ))}
          </div>

          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary border border-border/60 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">Nothing here yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayItems.map(rec => {
                if (rec._type === 'audio') {
                  const isAdvanced = rec.tier === 'advanced';
                  return (
                    <Link key={rec.id} to={`/audio-feedback/${rec.id}`}
                      className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-card hover:border-teal-500/30 hover:bg-teal-500/5 p-5 transition-all duration-200">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isAdvanced ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-teal-500/10 border border-teal-500/20'}`}>
                        {isAdvanced ? <Crown className="w-4 h-4 text-purple-400" /> : <Mic2 className="w-4 h-4 text-teal-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate mb-1">{rec.file_name || 'Audio Feedback'}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{rec.feedback?.slice(0, 120)}…</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${isAdvanced ? 'bg-purple-500/10 text-purple-400' : 'bg-teal-500/10 text-teal-600'}`}>
                            {isAdvanced ? 'Advanced' : 'Base'}
                          </span>
                          {rec.aspects?.slice(0, 2).map(a => (
                            <span key={a} className="px-2 py-0.5 rounded-md bg-secondary text-xs text-muted-foreground">{a}</span>
                          ))}
                          <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                            <Clock className="w-3 h-3" />
                            {new Date(rec.created_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-teal-400 transition-colors flex-shrink-0 mt-1" />
                    </Link>
                  );
                }

                const proj = rec.project_id ? getProject(rec.project_id) : null;
                const tags = [rec.genre, rec.mood, rec.tempo].filter(Boolean);
                return (
                  <Link key={rec.id} to={`/prompt-result/${rec.id}`}
                    className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-card hover:border-amber-500/30 hover:bg-amber-500/5 p-5 transition-all duration-200">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate mb-1">{rec.title || 'Untitled Prompt'}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{rec.result?.slice(0, 120)}…</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {proj && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="w-2 h-2 rounded-full" style={{ background: proj.color || '#f59e0b' }} />
                            {proj.name}
                          </span>
                        )}
                        {tags.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-secondary text-xs text-muted-foreground">{t}</span>
                        ))}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                          <Clock className="w-3 h-3" />
                          {new Date(rec.created_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-400 transition-colors flex-shrink-0 mt-1" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}