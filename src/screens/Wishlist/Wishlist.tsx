import { useEffect, useState, useRef } from "react";
import { apiFetch } from "../../lib/auth";
import { AddDateSection } from "../StitchDesign/sections/AddDateSection";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Film, Tv, Plus, Trash2, Star, Search, X, Clock } from "lucide-react";

interface WishlistItem {
  id: number;
  movie_id: string;
  movie_title: string;
  movie_year?: string;
  movie_poster?: string;
  movie_genre?: string;
  priority: 'must_watch' | 'interested' | 'maybe';
  is_shared: boolean;
  user_id: string;
  added_date: string;
}

interface SearchResult {
  id: string;
  title: string;
  year: string;
  poster?: string;
  content_type: 'movie' | 'tv_series';
  genre?: string;
}

const PRIORITY_CONFIG = {
  must_watch: { label: 'Must Watch', color: 'bg-red-900/40 text-red-400 border-red-800' },
  interested: { label: 'Interested',  color: 'bg-yellow-900/40 text-yellow-400 border-yellow-800' },
  maybe:      { label: 'Maybe',       color: 'bg-[#472326] text-[#c69193] border-[#663335]' },
};

// ─── Add Item Modal ──────────────────────────────────────────────────────────

function AddWishlistModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (item: Omit<WishlistItem, 'id' | 'user_id' | 'added_date'>) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [priority, setPriority] = useState<WishlistItem['priority']>('interested');
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (query.trim().length === 0) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiFetch(`/api/content-search?q=${encodeURIComponent(query)}&type=all`);
        const data = await res.json();
        setResults(data.results || []);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleAdd = async () => {
    if (!selected) return;
    setAdding(true);
    await onAdd({
      movie_id: selected.id,
      movie_title: selected.title,
      movie_year: selected.year,
      movie_poster: selected.poster,
      movie_genre: selected.genre,
      priority,
      is_shared: true,
    });
    setAdding(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div
        className="bg-[#2e1517] border border-[#663335] rounded-2xl w-full max-w-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#3d1f22]">
          <h3 className="text-white font-semibold text-lg">Add to Wishlist</h3>
          <button onClick={onClose} className="text-[#a08082] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a08082]">
              {searching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#a08082] border-t-transparent" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </div>
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(null); }}
              placeholder="Search for a movie or TV series…"
              className="w-full bg-[#3d1f22] border border-[#663335] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#663335] focus:outline-none focus:border-[#e82833]"
            />
          </div>

          {/* Results dropdown */}
          {results.length > 0 && !selected && (
            <div className="bg-[#3d1f22] border border-[#663335] rounded-lg max-h-52 overflow-y-auto">
              {results.map(r => (
                <div
                  key={r.id}
                  onClick={() => { setSelected(r); setQuery(r.title); setResults([]); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#472326] cursor-pointer border-b border-[#663335] last:border-b-0 transition-colors"
                >
                  {r.poster ? (
                    <img src={r.poster} alt={r.title} className="w-8 h-11 object-cover rounded flex-shrink-0" onError={e => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div className="w-8 h-11 bg-[#472326] rounded flex items-center justify-center flex-shrink-0">
                      {r.content_type === 'movie' ? <Film className="w-4 h-4 text-[#663335]" /> : <Tv className="w-4 h-4 text-[#663335]" />}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{r.title} {r.year && `(${r.year})`}</div>
                    {r.genre && <div className="text-[#a08082] text-xs truncate">{r.genre}</div>}
                  </div>
                  <Badge variant="outline" className="text-xs border-[#663335] text-[#a08082] flex-shrink-0">
                    {r.content_type === 'movie' ? 'Movie' : 'TV'}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Selected preview */}
          {selected && (
            <div className="flex items-center gap-3 bg-[#3d1f22] border border-[#e82833]/40 rounded-lg px-4 py-3">
              {selected.poster ? (
                <img src={selected.poster} alt={selected.title} className="w-10 h-14 object-cover rounded flex-shrink-0" onError={e => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <div className="w-10 h-14 bg-[#472326] rounded flex items-center justify-center flex-shrink-0">
                  <Film className="w-5 h-5 text-[#663335]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">{selected.title} {selected.year && `(${selected.year})`}</div>
                {selected.genre && <div className="text-[#a08082] text-xs">{selected.genre}</div>}
              </div>
              <button onClick={() => { setSelected(null); setQuery(""); }} className="text-[#a08082] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Priority */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#a08082]">Priority</label>
            <div className="flex gap-2">
              {(Object.keys(PRIORITY_CONFIG) as WishlistItem['priority'][]).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    priority === p ? PRIORITY_CONFIG[p].color : 'bg-[#3d1f22] text-[#663335] border-[#472326] hover:border-[#663335]'
                  }`}
                >
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAdd}
            disabled={!selected || adding}
            className="w-full bg-[#e82833] hover:bg-[#c62229] text-white disabled:opacity-40"
          >
            {adding ? 'Adding…' : 'Add to Wishlist'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const Wishlist = (): JSX.Element => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [editPriority, setEditPriority] = useState<WishlistItem['priority']>('interested');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/wishlist');
      const data = await res.json();
      if (res.ok) setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (item: Omit<WishlistItem, 'id' | 'user_id' | 'added_date'>) => {
    const res = await apiFetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) await fetchItems();
  };

  const startEdit = (item: WishlistItem) => {
    setEditingId(item.id);
    setEditPriority(item.priority);
    setConfirmDeleteId(null);
  };

  const handleSave = async (id: number) => {
    setSavingId(id);
    await apiFetch(`/api/wishlist?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: editPriority }),
    });
    await fetchItems();
    setSavingId(null);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await apiFetch(`/api/wishlist?id=${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i.id !== id));
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      {showAdd && <AddWishlistModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}

      <div className="flex flex-col bg-white min-h-screen">
        <div className="flex flex-col w-full bg-[#211111] min-h-screen">
          <AddDateSection />

          <div className="flex justify-center px-4 lg:px-40 py-8 w-full">
            <div className="flex flex-col max-w-4xl w-full">

              {/* Header */}
              <div className="flex items-start justify-between mb-8 px-4">
                <div>
                  <h1 className="font-bold text-white text-[32px] leading-10 font-['Plus_Jakarta_Sans',Helvetica]">
                    My Wishlist
                  </h1>
                  <p className="text-[#c69193] text-base mt-1 font-['Plus_Jakarta_Sans',Helvetica]">
                    Movies &amp; shows you want to watch on future dates
                  </p>
                </div>
                <Button
                  onClick={() => setShowAdd(true)}
                  className="flex items-center gap-2 bg-[#e82833] hover:bg-[#c62229] text-white mt-1"
                >
                  <Plus className="w-4 h-4" />
                  Add to Wishlist
                </Button>
              </div>

              {/* Content */}
              {loading ? (
                <div className="flex items-center justify-center py-20 gap-3 text-[#c69193]">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#c69193] border-t-transparent" />
                  <span>Loading wishlist…</span>
                </div>
              ) : items.length === 0 ? (
                <Card className="bg-[#472326] border-[#663335]">
                  <CardContent className="p-12 text-center">
                    <Star className="w-14 h-14 text-[#a08082] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Your wishlist is empty</h3>
                    <p className="text-[#c69193] mb-6">Save movies and TV shows you want to watch together.</p>
                    <Button onClick={() => setShowAdd(true)} className="bg-[#e82833] text-white hover:bg-[#c62229]">
                      Add Your First Movie
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 px-4">
                  {items.map(item => (
                    <Card key={item.id} className="bg-[#472326] border-[#663335] overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex">
                          {/* Poster */}
                          {item.movie_poster ? (
                            <img
                              src={item.movie_poster}
                              alt={item.movie_title}
                              className="w-20 flex-shrink-0 object-cover"
                              onError={e => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-20 flex-shrink-0 bg-[#3d1f22] flex items-center justify-center min-h-[80px]">
                              <Film className="w-6 h-6 text-[#663335]" />
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 px-4 py-3 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="text-white font-semibold truncate font-['Plus_Jakarta_Sans',Helvetica]">
                                  {item.movie_title}
                                  {item.movie_year && <span className="text-[#a08082] font-normal ml-1.5">({item.movie_year})</span>}
                                </h3>
                                {item.movie_genre && (
                                  <p className="text-[#a08082] text-xs mt-0.5 truncate">{item.movie_genre}</p>
                                )}
                                <div className="flex items-center gap-1 mt-1 text-[#663335] text-xs">
                                  <Clock className="w-3 h-3" />
                                  Added {formatDate(item.added_date)}
                                </div>
                              </div>

                              {/* Priority badge / edit controls */}
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                {editingId === item.id ? (
                                  <div className="flex flex-col items-end gap-2">
                                    <select
                                      value={editPriority}
                                      onChange={e => setEditPriority(e.target.value as WishlistItem['priority'])}
                                      className="bg-[#3d1f22] border border-[#663335] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#e82833]"
                                    >
                                      <option value="must_watch">Must Watch</option>
                                      <option value="interested">Interested</option>
                                      <option value="maybe">Maybe</option>
                                    </select>
                                    <div className="flex gap-1.5">
                                      <Button
                                        size="sm"
                                        onClick={() => handleSave(item.id)}
                                        disabled={savingId === item.id}
                                        className="h-7 px-2 text-xs bg-[#e82833] hover:bg-[#c62229] text-white"
                                      >
                                        {savingId === item.id ? '…' : 'Save'}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingId(null)}
                                        className="h-7 px-2 text-xs bg-transparent border-[#663335] text-[#c69193] hover:bg-[#3d1f22]"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <Badge className={`${PRIORITY_CONFIG[item.priority].color} text-xs`}>
                                    {PRIORITY_CONFIG[item.priority].label}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          {editingId !== item.id && (
                            <div className="flex flex-col items-center justify-center gap-2 px-3 border-l border-[#663335]">
                              <button
                                onClick={() => startEdit(item)}
                                className="text-[#a08082] hover:text-white transition-colors p-1"
                                title="Edit priority"
                              >
                                <Star className="w-4 h-4" />
                              </button>
                              {confirmDeleteId === item.id ? (
                                <div className="flex flex-col items-center gap-1">
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deletingId === item.id}
                                    className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                                  >
                                    {deletingId === item.id ? '…' : 'Yes'}
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="text-[#663335] hover:text-[#a08082] text-xs transition-colors"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteId(item.id)}
                                  className="text-[#663335] hover:text-red-400 transition-colors p-1"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
