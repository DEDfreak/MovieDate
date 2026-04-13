import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Film, Tv, Calendar, MapPin, Star, Clock, X, Image, Pencil, Trash2, Check } from "lucide-react";
import { AddDateSection } from "../StitchDesign/sections/AddDateSection";
import { apiFetch } from "../../lib/auth";

interface MovieDate {
  id: number;
  movie_id: string;
  movie_title: string;
  movie_year?: string;
  movie_poster?: string;
  content_type: 'movie' | 'tv_series';
  date_watched: string;
  location: string;
  user1_rating?: number;
  user2_rating?: number;
  user1_review: string;
  user2_review: string;
  watch_status: 'completed' | 'partial' | 'continued';
  watch_progress: number;
  parent_date_id?: number;
  linked_dates?: MovieDate[];
  parent_date?: MovieDate;
  created_at: string;
  photos?: any[];
}

interface EditState {
  location: string;
  date_watched: string;
  user1_rating: number;
  user2_rating: number;
  user1_review: string;
  user2_review: string;
  watch_status: 'completed' | 'partial' | 'continued';
  watch_progress: number;
}

// ─── Slider ──────────────────────────────────────────────────────────────────

function RatingSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-[#a08082]">{label}</span>
        <span className="text-xs font-semibold text-white bg-[#472326] px-2 py-0.5 rounded">{value}/10</span>
      </div>
      <input
        type="range" min="0" max="10" step="0.5"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#e82833]"
      />
    </div>
  );
}

// ─── Detail / Edit Modal ─────────────────────────────────────────────────────

function DateDetailModal({
  date,
  onClose,
  onSave,
  onDelete,
}: {
  date: MovieDate;
  onClose: () => void;
  onSave: (id: number, updates: Partial<MovieDate>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toDateInputValue = (iso: string) => iso.slice(0, 10); // "YYYY-MM-DD"

  const [form, setForm] = useState<EditState>({
    location: date.location,
    date_watched: toDateInputValue(date.date_watched),
    user1_rating: date.user1_rating ?? 5,
    user2_rating: date.user2_rating ?? 5,
    user1_review: date.user1_review,
    user2_review: date.user2_review,
    watch_status: date.watch_status,
    watch_progress: date.watch_progress,
  });

  const update = (field: keyof EditState, value: any) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      // Auto-switch status when progress changes
      if (field === 'watch_progress') {
        if (value < 100 && next.watch_status === 'completed') next.watch_status = 'partial';
        if (value === 100 && next.watch_status === 'partial') next.watch_status = 'completed';
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(date.id, {
      ...form,
      date_watched: new Date(form.date_watched).toISOString(),
    });
    setSaving(false);
    setEditing(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(date.id);
    setDeleting(false);
    onClose();
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const statusConfig = {
    completed: { color: 'bg-green-900/30 text-green-400 border border-green-800', label: 'Completed' },
    partial:   { color: 'bg-orange-900/30 text-orange-400 border border-orange-800', label: 'To be continued' },
    continued: { color: 'bg-blue-900/30 text-blue-400 border border-blue-800', label: 'Continuation' },
  };

  const currentStatus = editing ? form.watch_status : date.watch_status;
  const { color, label } = statusConfig[currentStatus];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8"
      onClick={() => { if (!editing) onClose(); }}
    >
      <div
        className="relative bg-[#2e1517] border border-[#663335] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Top action bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-5 pb-3 bg-[#2e1517] border-b border-[#3d1f22]">
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#e82833] hover:bg-[#c62229] text-white flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setEditing(false); setForm({
                    location: date.location,
                    date_watched: toDateInputValue(date.date_watched),
                    user1_rating: date.user1_rating ?? 5,
                    user2_rating: date.user2_rating ?? 5,
                    user1_review: date.user1_review,
                    user2_review: date.user2_review,
                    watch_status: date.watch_status,
                    watch_progress: date.watch_progress,
                  }); }}
                  className="bg-transparent border-[#663335] text-[#c69193] hover:bg-[#3d1f22] hover:text-white"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(true)}
                  className="bg-transparent border-[#663335] text-[#c69193] hover:bg-[#3d1f22] hover:text-white flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Button>
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-400">Are you sure?</span>
                    <Button
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-red-700 hover:bg-red-800 text-white"
                    >
                      {deleting ? 'Deleting…' : 'Yes, delete'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmDelete(false)}
                      className="bg-transparent border-[#663335] text-[#c69193] hover:bg-[#3d1f22]"
                    >
                      No
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmDelete(true)}
                    className="bg-transparent border-red-900 text-red-400 hover:bg-red-900/20 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                )}
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#a08082] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Poster + title header */}
        <div className="flex flex-col sm:flex-row">
          {date.movie_poster ? (
            <img
              src={date.movie_poster}
              alt={date.movie_title}
              className="w-full sm:w-40 sm:flex-shrink-0 h-56 sm:h-auto object-cover sm:rounded-bl-none"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="hidden sm:flex sm:w-40 sm:flex-shrink-0 items-center justify-center bg-[#3d1f22]">
              <Image className="w-10 h-10 text-[#663335]" />
            </div>
          )}

          <div className="flex-1 p-6">
            <div className="flex items-center gap-2 mb-1 text-[#a08082]">
              {date.content_type === 'movie' ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
              <span className="text-xs uppercase tracking-wide">
                {date.content_type === 'movie' ? 'Movie' : 'TV Series'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight mb-3">
              {date.movie_title}
              {date.movie_year && <span className="text-[#a08082] font-normal ml-2">({date.movie_year})</span>}
            </h2>

            {/* Location */}
            {editing ? (
              <div className="flex flex-col gap-1 mb-3">
                <label className="text-xs text-[#a08082]">Location</label>
                <input
                  value={form.location}
                  onChange={e => update('location', e.target.value)}
                  className="bg-[#3d1f22] border border-[#663335] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e82833]"
                />
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#a08082] mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {date.location}
                </div>
              </div>
            )}

            {/* Date watched */}
            {editing ? (
              <div className="flex flex-col gap-1 mb-3">
                <label className="text-xs text-[#a08082]">Date Watched</label>
                <input
                  type="date"
                  value={form.date_watched}
                  onChange={e => update('date_watched', e.target.value)}
                  className="bg-[#3d1f22] border border-[#663335] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e82833] w-fit"
                />
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm text-[#a08082] mb-3">
                <Calendar className="w-4 h-4" />
                {formatDate(date.date_watched)}
              </div>
            )}

            {/* Watch status */}
            {editing ? (
              <div className="flex flex-col gap-1 mb-3">
                <label className="text-xs text-[#a08082]">Watch Status</label>
                <select
                  value={form.watch_status}
                  onChange={e => update('watch_status', e.target.value)}
                  className="bg-[#3d1f22] border border-[#663335] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e82833] w-fit"
                >
                  <option value="completed">Completed</option>
                  <option value="partial">Partially watched</option>
                  <option value="continued">Continued from previous</option>
                </select>
              </div>
            ) : (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                {label} {date.watch_status !== 'completed' && `(${date.watch_progress}%)`}
              </span>
            )}

            {/* Watch progress */}
            {editing ? (
              (form.watch_status === 'partial' || form.watch_status === 'continued') && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-[#c69193] mb-1">
                    <span>Watch Progress</span>
                    <span>{form.watch_progress}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100" step="5"
                    value={form.watch_progress}
                    onChange={e => update('watch_progress', parseInt(e.target.value))}
                    className="w-full accent-[#e82833]"
                  />
                </div>
              )
            ) : (
              date.watch_status !== 'completed' && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-[#c69193] mb-1">
                    <span>Watch Progress</span>
                    <span>{date.watch_progress}%</span>
                  </div>
                  <Progress value={date.watch_progress} className="h-2" />
                </div>
              )
            )}
          </div>
        </div>

        {/* Ratings + Reviews */}
        <div className="px-6 pb-6 space-y-5 border-t border-[#3d1f22] pt-5">
          {/* Ratings */}
          <div>
            <h4 className="text-white font-semibold mb-3">Ratings</h4>
            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#3d1f22] rounded-xl p-4">
                  <RatingSlider label="Her Rating" value={form.user1_rating} onChange={v => update('user1_rating', v)} />
                </div>
                <div className="bg-[#3d1f22] rounded-xl p-4">
                  <RatingSlider label="His Rating" value={form.user2_rating} onChange={v => update('user2_rating', v)} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {date.user1_rating != null && (
                  <div className="flex flex-col items-center gap-1 bg-[#3d1f22] rounded-xl p-3">
                    <span className="text-xs text-[#a08082]">Her Rating</span>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xl font-bold text-white">{date.user1_rating}</span>
                      <span className="text-[#a08082] text-sm">/10</span>
                    </div>
                  </div>
                )}
                {date.user2_rating != null && (
                  <div className="flex flex-col items-center gap-1 bg-[#3d1f22] rounded-xl p-3">
                    <span className="text-xs text-[#a08082]">His Rating</span>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xl font-bold text-white">{date.user2_rating}</span>
                      <span className="text-[#a08082] text-sm">/10</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div>
            <h4 className="text-white font-semibold mb-3">Reviews</h4>
            {editing ? (
              <div className="space-y-3">
                <div className="bg-[#3d1f22] rounded-xl p-4">
                  <label className="text-xs font-medium text-[#e82833] block mb-2">Her Review</label>
                  <textarea
                    value={form.user1_review}
                    onChange={e => update('user1_review', e.target.value)}
                    rows={3}
                    placeholder="Her thoughts on this date…"
                    className="w-full bg-[#2e1517] border border-[#663335] rounded-lg px-3 py-2 text-sm text-[#c69193] placeholder:text-[#663335] focus:outline-none focus:border-[#e82833] resize-none"
                  />
                </div>
                <div className="bg-[#3d1f22] rounded-xl p-4">
                  <label className="text-xs font-medium text-[#e82833] block mb-2">His Review</label>
                  <textarea
                    value={form.user2_review}
                    onChange={e => update('user2_review', e.target.value)}
                    rows={3}
                    placeholder="His thoughts on this date…"
                    className="w-full bg-[#2e1517] border border-[#663335] rounded-lg px-3 py-2 text-sm text-[#c69193] placeholder:text-[#663335] focus:outline-none focus:border-[#e82833] resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {date.user1_review && (
                  <div className="bg-[#3d1f22] rounded-xl p-4">
                    <div className="text-xs font-medium text-[#e82833] mb-1">Her Review</div>
                    <p className="text-[#c69193] text-sm leading-relaxed">{date.user1_review}</p>
                  </div>
                )}
                {date.user2_review && (
                  <div className="bg-[#3d1f22] rounded-xl p-4">
                    <div className="text-xs font-medium text-[#e82833] mb-1">His Review</div>
                    <p className="text-[#c69193] text-sm leading-relaxed">{date.user2_review}</p>
                  </div>
                )}
                {!date.user1_review && !date.user2_review && (
                  <p className="text-[#663335] text-sm italic">No reviews yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Photos */}
          {date.photos && date.photos.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-3">Photos</h4>
              <div className="grid grid-cols-3 gap-2">
                {date.photos.map((photo: any, i: number) => (
                  <img
                    key={i}
                    src={photo.data || photo}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const Dates = (): JSX.Element => {
  const [dates, setDates] = useState<MovieDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<MovieDate | null>(null);

  useEffect(() => { fetchDates(); }, []);

  const fetchDates = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/movie-dates?linked=true');
      const data = await response.json();
      if (response.ok) {
        setDates(data.dates || []);
      } else {
        setError(data.message || 'Failed to load dates');
      }
    } catch {
      setError('Failed to load dates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id: number, updates: Partial<MovieDate>) => {
    await apiFetch(`/api/movie-dates?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    // Refresh list and update the open modal's data
    const res = await apiFetch('/api/movie-dates?linked=true');
    const data = await res.json();
    if (res.ok) {
      const refreshed: MovieDate[] = data.dates || [];
      setDates(refreshed);
      setSelectedDate(refreshed.find(d => d.id === id) ?? null);
    }
  };

  const handleDelete = async (id: number) => {
    await apiFetch(`/api/movie-dates?id=${id}`, { method: 'DELETE' });
    setDates(prev => prev.filter(d => d.id !== id));
  };

  const getStatusBadge = (status: 'completed' | 'partial' | 'continued', progress: number) => {
    const configs = {
      completed: { color: 'bg-green-900/30 text-green-400 border-green-800', label: 'Completed' },
      partial:   { color: 'bg-orange-900/30 text-orange-400 border-orange-800', label: 'To be continued' },
      continued: { color: 'bg-blue-900/30 text-blue-400 border-blue-800', label: 'Continuation' },
    };
    const { color, label } = configs[status];
    return (
      <Badge className={color}>
        {label} {status !== 'completed' && `(${progress}%)`}
      </Badge>
    );
  };

  const getCardBorder = (status: 'completed' | 'partial' | 'continued', hasParent: boolean) => {
    if (hasParent) return 'border-l-4 border-l-green-500';
    if (status === 'partial') return 'border-l-4 border-l-orange-500';
    return 'border-l-4 border-l-blue-500';
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const getAverageRating = (r1?: number, r2?: number) => {
    if (r1 == null && r2 == null) return null;
    if (r1 == null) return r2;
    if (r2 == null) return r1;
    return ((r1 + r2) / 2).toFixed(1);
  };

  const groupLinkedDates = (dates: MovieDate[]) => {
    const grouped: { [key: string]: MovieDate[] } = {};
    const processed = new Set<number>();

    dates.forEach(date => {
      if (processed.has(date.id)) return;
      const groupKey = date.parent_date_id
        ? (dates.find(d => d.id === date.parent_date_id)?.id.toString() || date.id.toString())
        : date.id.toString();
      if (!grouped[groupKey]) grouped[groupKey] = [];
      if (!date.parent_date_id) { grouped[groupKey].push(date); processed.add(date.id); }
      if (date.linked_dates) {
        date.linked_dates.forEach(linked => {
          if (!processed.has(linked.id)) { grouped[groupKey].push(linked); processed.add(linked.id); }
        });
      }
      if (date.parent_date_id && !processed.has(date.id)) { grouped[groupKey].push(date); processed.add(date.id); }
    });

    return Object.values(grouped).map(group =>
      group.sort((a, b) => new Date(a.date_watched).getTime() - new Date(b.date_watched).getTime())
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col bg-white min-h-screen">
        <div className="flex flex-col w-full bg-[#211111] min-h-screen">
          <AddDateSection />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3 text-[#c69193]">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#c69193] border-t-transparent"></div>
              <span className="text-lg">Loading your movie dates...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col bg-white min-h-screen">
        <div className="flex flex-col w-full bg-[#211111] min-h-screen">
          <AddDateSection />
          <div className="flex-1 flex items-center justify-center px-4">
            <Card className="bg-[#472326] border-[#663335] max-w-md">
              <CardContent className="p-6 text-center">
                <div className="text-red-400 mb-4">
                  <Clock className="w-12 h-12 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Error Loading Dates</h3>
                </div>
                <p className="text-[#c69193] mb-4">{error}</p>
                <Button onClick={fetchDates} className="bg-[#e82833] text-white hover:bg-[#c62229]">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const groupedDates = groupLinkedDates(dates);

  return (
    <>
      {selectedDate && (
        <DateDetailModal
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      <div className="flex flex-col bg-white min-h-screen">
        <div className="flex flex-col w-full bg-[#211111] min-h-screen">
          <AddDateSection />

          <div className="flex justify-center px-4 lg:px-40 py-8 w-full">
            <div className="flex flex-col max-w-4xl w-full">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Our Movie Dates</h1>
                <p className="text-[#c69193] text-lg">A timeline of our cinematic journey together</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                  { value: dates.length, label: 'Total Dates' },
                  { value: dates.filter(d => d.content_type === 'movie').length, label: 'Movies' },
                  { value: dates.filter(d => d.content_type === 'tv_series').length, label: 'TV Series' },
                  { value: dates.filter(d => d.watch_progress < 100).length, label: 'To Continue' },
                ].map(stat => (
                  <Card key={stat.label} className="bg-[#472326] border-[#663335]">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-[#c69193]">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {groupedDates.length === 0 ? (
                <Card className="bg-[#472326] border-[#663335]">
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-[#a08082] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No movie dates yet!</h3>
                    <p className="text-[#c69193] mb-6">Start your cinematic journey by adding your first movie date.</p>
                    <Button onClick={() => window.location.href = '/add-date'} className="bg-[#e82833] text-white hover:bg-[#c62229]">
                      Add Your First Date
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {groupedDates.map((group, groupIndex) => (
                    <div key={groupIndex} className="relative">
                      {group.length > 1 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#3d1f22]/30 to-transparent rounded-lg -m-2" />
                      )}
                      <div className="relative space-y-6">
                        {group.map((date, index) => (
                          <div key={date.id} className="relative">
                            {index > 0 && (
                              <div className="absolute -top-3 left-8 w-16 h-6 pointer-events-none">
                                <svg width="64" height="24" viewBox="0 0 64 24" className="text-[#8a4a4d]">
                                  <path d="M 2 2 Q 16 2 32 12 Q 48 22 62 22" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.7" />
                                  <path d="M 58 18 L 62 22 L 58 26" fill="none" stroke="currentColor" strokeWidth="2" />
                                </svg>
                              </div>
                            )}

                            <Card
                              onClick={() => setSelectedDate(date)}
                              className={`bg-[#472326] border-[#663335] overflow-hidden transition-all hover:shadow-lg hover:scale-[1.01] cursor-pointer ${getCardBorder(date.watch_status, !!date.parent_date_id)}`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      {date.content_type === 'movie'
                                        ? <Film className="w-4 h-4 text-[#a08082] flex-shrink-0" />
                                        : <Tv className="w-4 h-4 text-[#a08082] flex-shrink-0" />}
                                      <h3 className="text-lg font-semibold text-white truncate">
                                        {date.movie_title} {date.movie_year && `(${date.movie_year})`}
                                      </h3>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#a08082]">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatDate(date.date_watched)}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {date.location}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2 ml-3 flex-shrink-0">
                                    {getStatusBadge(date.watch_status, date.watch_progress)}
                                    {(() => {
                                      const avg = getAverageRating(date.user1_rating, date.user2_rating);
                                      return avg && (
                                        <div className="flex items-center gap-1 text-yellow-400">
                                          <Star className="w-4 h-4 fill-current" />
                                          <span className="text-sm font-medium">{avg}</span>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>

                                {date.watch_status !== 'completed' && (
                                  <div className="mb-3">
                                    <div className="flex justify-between text-xs text-[#c69193] mb-1">
                                      <span>Watch Progress</span>
                                      <span>{date.watch_progress}%</span>
                                    </div>
                                    <Progress value={date.watch_progress} className="h-1.5" />
                                  </div>
                                )}

                                {(date.user1_review || date.user2_review) && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                    {date.user1_review && (
                                      <div>
                                        <div className="font-medium text-white mb-0.5 text-xs">Her Review</div>
                                        <p className="text-[#c69193] line-clamp-2 text-xs">{date.user1_review}</p>
                                      </div>
                                    )}
                                    {date.user2_review && (
                                      <div>
                                        <div className="font-medium text-white mb-0.5 text-xs">His Review</div>
                                        <p className="text-[#c69193] line-clamp-2 text-xs">{date.user2_review}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </div>
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
