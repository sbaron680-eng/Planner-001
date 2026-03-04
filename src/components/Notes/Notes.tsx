import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Pin, PinOff, Search } from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';

interface NoteForm {
  title: string;
  content: string;
  tags: string;
  isPinned: boolean;
}

const defaultForm: NoteForm = {
  title: '',
  content: '',
  tags: '',
  isPinned: false,
};

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote, togglePinNote } =
    usePlannerStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NoteForm>(defaultForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  const filtered = notes
    .filter((n) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });

  function handleSubmit() {
    if (!form.title.trim()) return;
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (editId) {
      updateNote(editId, { ...form, tags });
      setEditId(null);
    } else {
      addNote({ ...form, tags });
    }
    setForm(defaultForm);
    setShowForm(false);
  }

  function startEdit(id: string) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    setForm({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', '),
      isPinned: note.isPinned,
    });
    setEditId(id);
    setShowForm(true);
  }

  const viewNote = notes.find((n) => n.id === selectedNote);

  return (
    <div className="p-6 flex gap-6 h-full">
      {/* 좌측: 목록 */}
      <div className="w-72 shrink-0 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm"
              placeholder="검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditId(null);
              setForm(defaultForm);
              setSelectedNote(null);
            }}
            className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-700"
          >
            <Plus size={16} />
          </button>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">노트가 없습니다.</p>
        ) : (
          <div className="space-y-2 overflow-y-auto">
            {filtered.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  setSelectedNote(note.id);
                  setShowForm(false);
                }}
                className={`group bg-white border rounded-xl p-3 cursor-pointer hover:shadow-sm transition-shadow ${
                  selectedNote === note.id
                    ? 'border-primary-300 shadow-sm'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {note.isPinned && (
                      <Pin size={11} className="inline-block text-yellow-500 mr-1 -mt-0.5" />
                    )}
                    {note.title}
                  </p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePinNote(note.id);
                      }}
                      className="text-gray-400 hover:text-yellow-500"
                    >
                      {note.isPinned ? <PinOff size={13} /> : <Pin size={13} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(note.id);
                      }}
                      className="text-gray-400 hover:text-blue-500"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                        if (selectedNote === note.id) setSelectedNote(null);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">{note.content}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex gap-1 flex-wrap">
                    {note.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-300">
                    {format(new Date(note.updatedAt), 'MM.dd')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 우측: 상세 / 폼 */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5">
        {showForm ? (
          <div className="space-y-3 h-full flex flex-col">
            <h3 className="font-semibold text-gray-700">
              {editId ? '노트 수정' : '새 노트'}
            </h3>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="제목 *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              className="flex-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
              placeholder="내용을 작성하세요..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="태그 (쉼표로 구분)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
                className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {editId ? '저장' : '추가'}
              </button>
            </div>
          </div>
        ) : viewNote ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{viewNote.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => togglePinNote(viewNote.id)}
                  className="text-gray-400 hover:text-yellow-500"
                >
                  {viewNote.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                </button>
                <button
                  onClick={() => startEdit(viewNote.id)}
                  className="text-sm text-blue-500 hover:underline"
                >
                  수정
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              마지막 수정: {format(new Date(viewNote.updatedAt), 'yyyy.MM.dd HH:mm')}
            </p>
            <div className="flex gap-1.5 flex-wrap mb-4">
              {viewNote.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full"
                >
                  #{t}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {viewNote.content || '(내용 없음)'}
            </p>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 text-sm">
              노트를 선택하거나 새 노트를 추가하세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
