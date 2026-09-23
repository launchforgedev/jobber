import React, { useState } from 'react';
import {
  HelpCircle, Pin, Edit3, Trash2, ArrowUp, ArrowDown, Plus, RefreshCw,
  CheckCircle2, Sparkles, Filter, ChevronRight
} from 'lucide-react';
import { PrepKit, Question, QuestionCategory } from '../types/prepkit.ts';
import {
  updateQuestionInKit,
  addManualQuestionToKit,
  deleteQuestionFromKit,
  reorderQuestionInKit,
  regenerateSectionInKit
} from '../services/kitBuilder.ts';

interface QuestionBankProps {
  kit: PrepKit;
  onUpdateKit: (updated: PrepKit) => void;
}

const CATEGORIES: { id: QuestionCategory; label: string; desc: string; color: string }[] = [
  { id: 'technical', label: 'Technical Depth', desc: 'Code patterns, internal algorithms, DB internals, debugging', color: 'emerald' },
  { id: 'system-design', label: 'System Architecture', desc: 'Distributed topologies, scaling, CAP trade-offs, consistency', color: 'blue' },
  { id: 'behavioural', label: 'Behavioural & Leadership', desc: 'STAR-formatted conflict, mentoring, trade-offs, deadlines', color: 'amber' },
  { id: 'company-fit', label: 'Culture & Domain Alignment', desc: 'Fintech compliance, business model alignment, engineering values', color: 'purple' }
];

export const QuestionBank: React.FC<QuestionBankProps> = ({ kit, onUpdateKit }) => {
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [editOutline, setEditOutline] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<number>(2);
  const [isRegeneratingCategory, setIsRegeneratingCategory] = useState<QuestionCategory | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState<QuestionCategory>('technical');
  const [newPrompt, setNewPrompt] = useState('');
  const [newOutline, setNewOutline] = useState('');
  const [newReqId, setNewReqId] = useState(kit.role.requirements[0]?.id || 'r1');

  const filteredQuestions = selectedCategory === 'all'
    ? kit.questions
    : kit.questions.filter(q => q.category === selectedCategory);

  const handleStartEdit = (q: Question) => {
    setEditingQuestionId(q.id);
    setEditPrompt(q.prompt);
    setEditOutline(q.answer_outline);
    setEditDifficulty(q.difficulty);
  };

  const handleSaveEdit = (q: Question) => {
    const updated = updateQuestionInKit(kit, q.id, {
      prompt: editPrompt,
      answer_outline: editOutline,
      difficulty: editDifficulty
    });
    onUpdateKit(updated);
    setEditingQuestionId(null);
  };

  const handleTogglePin = (q: Question) => {
    const nextState = q._state === 'pinned' ? 'edited' : 'pinned';
    const updated = updateQuestionInKit(kit, q.id, { _state: nextState });
    onUpdateKit(updated);
  };

  const handleDelete = (qId: string) => {
    const updated = deleteQuestionFromKit(kit, qId);
    onUpdateKit(updated);
  };

  const handleMove = (qId: string, direction: 'up' | 'down') => {
    const updated = reorderQuestionInKit(kit, qId, direction);
    onUpdateKit(updated);
  };

  const handleRegenerateCategory = async (cat: QuestionCategory) => {
    setIsRegeneratingCategory(cat);
    try {
      const updated = await regenerateSectionInKit(kit, { type: 'category', category: cat });
      onUpdateKit(updated);
    } catch (err) {
      console.error('Error regenerating category:', err);
    } finally {
      setIsRegeneratingCategory(null);
    }
  };

  const handleCreateManualQuestion = () => {
    if (!newPrompt.trim()) return;
    const updated = addManualQuestionToKit(kit, {
      category: newCategory,
      prompt: newPrompt.trim(),
      answer_outline: newOutline.trim() || 'Key technical context and trade-offs.',
      difficulty: 2,
      requirement_ids: [newReqId]
    });
    onUpdateKit(updated);
    setIsAddingNew(false);
    setNewPrompt('');
    setNewOutline('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span>Targeted Question Bank & Expected Rubrics</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Questions are mapped directly to required job competencies. Edit, reorder, or pin questions; manual edits are strictly protected during regeneration.
          </p>
        </div>

        <button
          onClick={() => setIsAddingNew(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all duration-200 interactive-hover"
        >
          <Plus className="h-4 w-4" />
          <span>Add Custom Question</span>
        </button>
      </div>

      {/* Category Pills / Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            selectedCategory === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-xs'
              : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          All Categories ({kit.questions.length})
        </button>

        {CATEGORIES.map(cat => {
          const count = kit.questions.filter(q => q.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{cat.label}</span>
              <span className="ml-1.5 font-mono text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Add New Question Modal/Drawer */}
      {isAddingNew && (
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 space-y-4 shadow-sm animate-scale-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              New Custom Question
            </span>
            <button
              onClick={() => setIsAddingNew(false)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Category</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as QuestionCategory)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Targeted Job Requirement</label>
              <select
                value={newReqId}
                onChange={e => setNewReqId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
              >
                {kit.role.requirements.map(r => (
                  <option key={r.id} value={r.id}>[{r.id}] {r.text.slice(0, 50)}...</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-700 dark:text-slate-300 font-medium mb-1">Question Prompt</label>
            <textarea
              rows={3}
              value={newPrompt}
              onChange={e => setNewPrompt(e.target.value)}
              placeholder="e.g. Walk me through a challenging production issue involving database sharding..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-700 dark:text-slate-300 font-medium mb-1">Expected Answer Outline / Rubric</label>
            <textarea
              rows={2}
              value={newOutline}
              onChange={e => setNewOutline(e.target.value)}
              placeholder="What points should the ideal answer hit? Mention consistency guarantees, WAL, etc."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          <button
            onClick={handleCreateManualQuestion}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm"
          >
            Save Custom Question
          </button>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const isEditing = editingQuestionId === q.id;
          const mappedReqs = kit.role.requirements.filter(r => q.requirement_ids.includes(r.id));

          return (
            <div
              key={q.id}
              className={`rounded-2xl border transition-all duration-200 p-4 sm:p-5 ${
                q._state === 'pinned'
                  ? 'border-indigo-400 dark:border-indigo-500/50 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">Editing Question [{q.id}]</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveEdit(q)}
                        className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingQuestionId(null)}
                        className="rounded border border-slate-300 dark:border-slate-700 px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Prompt</label>
                    <textarea
                      rows={3}
                      value={editPrompt}
                      onChange={e => setEditPrompt(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Expected Answer Rubric</label>
                    <textarea
                      rows={3}
                      value={editOutline}
                      onChange={e => setEditOutline(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-600 dark:text-slate-400">Difficulty:</label>
                    {[1, 2, 3].map(diff => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setEditDifficulty(diff)}
                        className={`px-2.5 py-1 rounded text-xs font-mono ${
                          editDifficulty === diff
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Level {diff}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Top Bar of Card */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                        [{q.id.toUpperCase()}]
                      </span>
                      <span className="font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {q.category}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        Difficulty: {q.difficulty}/3
                      </span>

                      {/* State badge */}
                      {q._state === 'pinned' && (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-300 dark:border-indigo-800">
                          <Pin className="h-2.5 w-2.5" /> Pinned
                        </span>
                      )}
                      {q._state === 'edited' && (
                        <span className="font-mono text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                          Edited
                        </span>
                      )}
                      {q._state === 'manual' && (
                        <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                          Manual
                        </span>
                      )}
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <button
                        onClick={() => handleTogglePin(q)}
                        title={q._state === 'pinned' ? 'Unpin question' : 'Pin question (protect from category regeneration)'}
                        className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                          q._state === 'pinned' ? 'text-indigo-600 dark:text-indigo-400' : ''
                        }`}
                      >
                        <Pin className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleStartEdit(q)}
                        title="Edit question prompt and rubric"
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(q.id, 'up')}
                        disabled={idx === 0}
                        title="Move question up"
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(q.id, 'down')}
                        disabled={idx === filteredQuestions.length - 1}
                        title="Move question down"
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        title="Delete question"
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {q.prompt}
                  </h3>

                  {/* Rubric Outline */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 p-3 text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-slate-200 block mb-1">
                      Expected Answer Outline & Scoring Rubric:
                    </span>
                    <p className="leading-relaxed">{q.answer_outline}</p>
                  </div>

                  {/* Mapped Requirements */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500">
                      Targeted Requirements:
                    </span>
                    {mappedReqs.map(r => (
                      <span
                        key={r.id}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          r.priority === 'must'
                            ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                            : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        [{r.id}] {r.text.slice(0, 30)}...
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
