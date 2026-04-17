import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AddDateSection } from "../StitchDesign/sections/AddDateSection";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Film, Tv, Calendar, MapPin, Star, Heart, Plus, List, BookMarked, Clock, ChevronRight } from "lucide-react";
import { apiFetch, getUser } from "../../lib/auth";

interface RecentDate {
  id: number;
  movie_title: string;
  movie_year?: string;
  movie_poster?: string;
  content_type: "movie" | "tv_series";
  date_watched: string;
  location: string;
  user1_rating?: number;
  user2_rating?: number;
  watch_status: "completed" | "partial" | "continued";
  watch_progress: number;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function avgRating(r1?: number, r2?: number): string | null {
  const n1 = r1 != null ? Number(r1) : null;
  const n2 = r2 != null ? Number(r2) : null;
  if (n1 === null && n2 === null) return null;
  if (n1 === null) return n2!.toFixed(1);
  if (n2 === null) return n1.toFixed(1);
  return ((n1 + n2) / 2).toFixed(1);
}

export const Home = (): JSX.Element => {
  const user = getUser();
  const [dates, setDates] = useState<RecentDate[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/movie-dates").then(r => r.json()).catch(() => ({ dates: [] })),
      apiFetch("/api/wishlist").then(r => r.json()).catch(() => ({ items: [] })),
    ]).then(([datesData, wishlistData]) => {
      setDates(datesData.dates || []);
      setWishlistCount((wishlistData.items || []).length);
    }).finally(() => setLoading(false));
  }, []);

  const totalDates = dates.length;
  const toContinue = dates.filter(d => d.watch_progress < 100).length;
  const allRatings = dates.flatMap(d => [
    d.user1_rating != null ? Number(d.user1_rating) : null,
    d.user2_rating != null ? Number(d.user2_rating) : null,
  ]).filter((r): r is number => r !== null);
  const overallAvg = allRatings.length
    ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
    : null;

  const recentDates = [...dates]
    .sort((a, b) => new Date(b.date_watched).getTime() - new Date(a.date_watched).getTime())
    .slice(0, 3);

  const statusConfig = {
    completed: { color: "bg-green-900/30 text-green-400 border-green-800", label: "Completed" },
    partial:   { color: "bg-orange-900/30 text-orange-400 border-orange-800", label: "To be continued" },
    continued: { color: "bg-blue-900/30 text-blue-400 border-blue-800", label: "Continuation" },
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#211111]">
      <AddDateSection />

      <main className="flex-1 flex flex-col items-center px-4 lg:px-12 py-10 gap-10 max-w-5xl mx-auto w-full">

        {/* ── Hero ── */}
        <section className="w-full">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#3d1517] via-[#2e1517] to-[#1a0d0e] border border-[#663335] px-8 py-10">
            {/* decorative circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#e82833]/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-[#e82833]/5 blur-2xl pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-[#e82833]" />
                  <span className="text-[#a08082] text-sm">CineDate</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white font-['Plus_Jakarta_Sans',Helvetica] leading-tight">
                  {greeting()},{" "}
                  <span className="text-[#e82833]">
                    {user?.display_name || user?.username || "there"}
                  </span>
                </h1>
                <p className="text-[#c69193] mt-2 text-base max-w-md">
                  {totalDates === 0
                    ? "Start your movie journey — log your first date together."
                    : `You've logged ${totalDates} date${totalDates !== 1 ? "s" : ""} together. Keep the memories alive.`}
                </p>
              </div>

              <Link to="/add-date">
                <Button className="flex items-center gap-2 bg-[#e82833] hover:bg-[#c62229] text-white px-6 py-3 rounded-xl font-semibold text-base shadow-lg shadow-[#e82833]/20 flex-shrink-0">
                  <Plus className="w-5 h-5" />
                  Add New Date
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Calendar className="w-5 h-5 text-[#e82833]" />, label: "Total Dates",  value: loading ? "—" : String(totalDates) },
            { icon: <Star      className="w-5 h-5 text-yellow-400" />, label: "Avg Rating",   value: loading ? "—" : overallAvg ? `${overallAvg}/10` : "No ratings" },
            { icon: <Clock     className="w-5 h-5 text-orange-400" />, label: "To Continue",  value: loading ? "—" : String(toContinue) },
            { icon: <BookMarked className="w-5 h-5 text-purple-400" />, label: "On Wishlist", value: loading ? "—" : String(wishlistCount) },
          ].map(s => (
            <Card key={s.label} className="bg-[#2e1517] border-[#663335]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {s.icon}
                  <span className="text-xs text-[#a08082] uppercase tracking-wide">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-white font-['Plus_Jakarta_Sans',Helvetica]">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* ── Recent Dates ── */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white font-['Plus_Jakarta_Sans',Helvetica]">Recent Dates</h2>
            <Link to="/dates" className="flex items-center gap-1 text-sm text-[#e82833] hover:text-[#c62229] transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 text-[#c69193] py-8 justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#c69193] border-t-transparent" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : recentDates.length === 0 ? (
            <Card className="bg-[#2e1517] border-[#663335] border-dashed">
              <CardContent className="p-10 flex flex-col items-center text-center gap-3">
                <Film className="w-10 h-10 text-[#663335]" />
                <p className="text-[#a08082] text-sm">No dates logged yet.</p>
                <Link to="/add-date">
                  <Button size="sm" className="bg-[#e82833] hover:bg-[#c62229] text-white mt-1">
                    Log your first date
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {recentDates.map(date => {
                const avg = avgRating(date.user1_rating, date.user2_rating);
                const { color, label } = statusConfig[date.watch_status];
                return (
                  <Link to="/dates" key={date.id}>
                    <Card className="bg-[#2e1517] border-[#663335] hover:border-[#8a4a4d] hover:scale-[1.005] transition-all cursor-pointer overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex">
                          {/* Poster */}
                          {date.movie_poster ? (
                            <img
                              src={date.movie_poster}
                              alt={date.movie_title}
                              className="w-16 flex-shrink-0 object-cover"
                              onError={e => { e.currentTarget.style.display = "none"; }}
                            />
                          ) : (
                            <div className="w-16 flex-shrink-0 bg-[#3d1f22] flex items-center justify-center min-h-[72px]">
                              {date.content_type === "movie"
                                ? <Film className="w-6 h-6 text-[#663335]" />
                                : <Tv className="w-6 h-6 text-[#663335]" />}
                            </div>
                          )}

                          <div className="flex-1 px-4 py-3 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="text-white font-semibold text-sm truncate">
                                  {date.movie_title}
                                  {date.movie_year && <span className="text-[#a08082] font-normal ml-1">({date.movie_year})</span>}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#a08082]">
                                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(date.date_watched)}</span>
                                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{date.location}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                <Badge className={`${color} text-xs`}>{label}</Badge>
                                {avg && (
                                  <span className="flex items-center gap-1 text-yellow-400 text-xs">
                                    <Star className="w-3 h-3 fill-current" />{avg}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Quick Actions ── */}
        <section className="w-full">
          <h2 className="text-lg font-semibold text-white font-['Plus_Jakarta_Sans',Helvetica] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                to: "/add-date",
                icon: <Plus className="w-6 h-6 text-[#e82833]" />,
                title: "Add a Date",
                desc: "Log a new movie or TV night",
              },
              {
                to: "/wishlist",
                icon: <BookMarked className="w-6 h-6 text-purple-400" />,
                title: "Wishlist",
                desc: "Browse movies you want to watch",
              },
              {
                to: "/dates",
                icon: <List className="w-6 h-6 text-blue-400" />,
                title: "All Dates",
                desc: "See your full movie timeline",
              },
            ].map(a => (
              <Link to={a.to} key={a.to}>
                <Card className="bg-[#2e1517] border-[#663335] hover:border-[#8a4a4d] hover:scale-[1.02] transition-all cursor-pointer h-full">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#3d1f22] flex items-center justify-center flex-shrink-0">
                      {a.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">{a.title}</h3>
                      <p className="text-[#a08082] text-xs mt-0.5">{a.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#663335] ml-auto self-center flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};
