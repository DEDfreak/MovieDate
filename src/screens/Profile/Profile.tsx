import React, { useEffect, useState } from "react";
import { apiFetch } from "../../lib/auth";
import { AddDateSection } from "../StitchDesign/sections/AddDateSection";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Pencil, Check, X, Star, Film, MapPin, Calendar, Heart } from "lucide-react";

interface ProfileData {
  herName: string;
  hisName: string;
  memberSince: string;
  favoriteGenre: string;
}

interface Stats {
  totalDates: number;
  averageRating: number | null;
  topLocation: string | null;
  moviesCount: number;
  tvCount: number;
}

const STORAGE_KEY = "cinedate_profile";

const defaultProfile: ProfileData = {
  herName: "Her",
  hisName: "Him",
  memberSince: new Date().getFullYear().toString(),
  favoriteGenre: "",
};

function loadProfile(): ProfileData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

export const Profile = (): JSX.Element => {
  const [profile, setProfile] = useState<ProfileData>(loadProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileData>(profile);
  const [stats, setStats] = useState<Stats>({
    totalDates: 0,
    averageRating: null,
    topLocation: null,
    moviesCount: 0,
    tvCount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await apiFetch("/api/movie-dates");
      const data = await res.json();
      const dates: any[] = data.dates || [];

      const ratings: number[] = [];
      dates.forEach((d: any) => {
        if (d.user1_rating != null) ratings.push(Number(d.user1_rating));
        if (d.user2_rating != null) ratings.push(Number(d.user2_rating));
      });

      const avgRating =
        ratings.length > 0
          ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
          : null;

      const locationCounts: Record<string, number> = {};
      dates.forEach((d: any) => {
        if (d.location) locationCounts[d.location] = (locationCounts[d.location] || 0) + 1;
      });
      const topLocation =
        Object.keys(locationCounts).sort((a, b) => locationCounts[b] - locationCounts[a])[0] ?? null;

      setStats({
        totalDates: dates.length,
        averageRating: avgRating,
        topLocation,
        moviesCount: dates.filter((d: any) => d.content_type === "movie").length,
        tvCount: dates.filter((d: any) => d.content_type === "tv_series").length,
      });
    } catch {
      // leave defaults
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSave = () => {
    setProfile(draft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditing(false);
  };

  const field = (label: string, value: string, key: keyof ProfileData) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-[#a08082]">{label}</label>
      <input
        value={draft[key]}
        onChange={e => setDraft(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={value}
        className="bg-[#3d1f22] border border-[#663335] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#663335] focus:outline-none focus:border-[#e82833]"
      />
    </div>
  );

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <div className="flex flex-col w-full bg-[#211111] min-h-screen">
        <AddDateSection />

        <div className="flex justify-center px-4 lg:px-40 py-8 w-full">
          <div className="flex flex-col max-w-4xl w-full gap-6">

            {/* Profile card */}
            <Card className="bg-[#472326] border-[#663335]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#e82833]/20 border-2 border-[#e82833]/40 flex items-center justify-center">
                      <Heart className="w-7 h-7 text-[#e82833]" />
                    </div>
                    <div>
                      {editing ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={draft.herName}
                            onChange={e => setDraft(p => ({ ...p, herName: e.target.value }))}
                            placeholder="Her name"
                            className="bg-[#3d1f22] border border-[#663335] rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-[#e82833] w-28"
                          />
                          <span className="text-[#a08082]">&amp;</span>
                          <input
                            value={draft.hisName}
                            onChange={e => setDraft(p => ({ ...p, hisName: e.target.value }))}
                            placeholder="His name"
                            className="bg-[#3d1f22] border border-[#663335] rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-[#e82833] w-28"
                          />
                        </div>
                      ) : (
                        <h2 className="text-xl font-bold text-white">
                          {profile.herName} &amp; {profile.hisName}
                        </h2>
                      )}
                      <p className="text-[#a08082] text-sm mt-0.5">
                        Cinema couple · Since {editing ? (
                          <input
                            value={draft.memberSince}
                            onChange={e => setDraft(p => ({ ...p, memberSince: e.target.value }))}
                            placeholder="Year"
                            className="bg-[#3d1f22] border border-[#663335] rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-[#e82833] w-16 inline-block"
                          />
                        ) : profile.memberSince}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {editing ? (
                      <>
                        <Button size="sm" onClick={handleSave} className="bg-[#e82833] hover:bg-[#c62229] text-white flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel} className="bg-transparent border-[#663335] text-[#c69193] hover:bg-[#3d1f22] hover:text-white flex items-center gap-1.5">
                          <X className="w-3.5 h-3.5" /> Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => { setDraft(profile); setEditing(true); }} className="bg-transparent border-[#663335] text-[#c69193] hover:bg-[#3d1f22] hover:text-white flex items-center gap-1.5">
                        <Pencil className="w-3.5 h-3.5" /> Edit Profile
                      </Button>
                    )}
                  </div>
                </div>

                {/* Favorite genre — editable */}
                {editing ? (
                  <div className="border-t border-[#3d1f22] pt-4">
                    {field("Favorite Genre", "e.g. Romance, Thriller…", "favoriteGenre")}
                  </div>
                ) : profile.favoriteGenre ? (
                  <div className="border-t border-[#3d1f22] pt-4 flex items-center gap-2 text-sm text-[#c69193]">
                    <Star className="w-4 h-4 text-[#e82833]" />
                    Favorite genre: <span className="text-white font-medium">{profile.favoriteGenre}</span>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard
                icon={<Calendar className="w-5 h-5 text-[#e82833]" />}
                label="Total Dates"
                value={loadingStats ? "—" : String(stats.totalDates)}
                live
              />
              <StatCard
                icon={<Star className="w-5 h-5 text-yellow-400" />}
                label="Avg Rating"
                value={loadingStats ? "—" : stats.averageRating != null ? `${stats.averageRating}/10` : "No ratings yet"}
                live
              />
              <StatCard
                icon={<MapPin className="w-5 h-5 text-[#c69193]" />}
                label="Top Location"
                value={loadingStats ? "—" : stats.topLocation ?? "No data yet"}
                live
              />
              <StatCard
                icon={<Film className="w-5 h-5 text-blue-400" />}
                label="Movies Watched"
                value={loadingStats ? "—" : String(stats.moviesCount)}
                live
              />
              <StatCard
                icon={<Film className="w-5 h-5 text-purple-400" />}
                label="TV Series"
                value={loadingStats ? "—" : String(stats.tvCount)}
                live
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function StatCard({ icon, label, value, live }: { icon: React.ReactNode; label: string; value: string; live?: boolean }) {
  return (
    <Card className="bg-[#472326] border-[#663335]">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-xs text-[#a08082] uppercase tracking-wide">{label}</span>
          {live && <span className="ml-auto text-[10px] text-[#663335]">live</span>}
        </div>
        <p className="text-white font-bold text-xl font-['Plus_Jakarta_Sans',Helvetica]">{value}</p>
      </CardContent>
    </Card>
  );
}
