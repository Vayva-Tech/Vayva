"use client";

import { Music, Play, Pause, Heart, Clock, Disc, Mic2, Headphones, Search, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const librarySections = [
  { name: "Liked Songs", count: 234, icon: Heart, color: "from-pink-500 to-rose-500" },
  { name: "Your Playlists", count: 12, icon: Disc, color: "from-purple-500 to-indigo-500" },
  { name: "Artists", count: 48, icon: Mic2, color: "from-blue-500 to-cyan-500" },
  { name: "Albums", count: 67, icon: Disc, color: "from-emerald-500 to-teal-500" },
];

const playlists = [
  { id: 1, name: "Chill Vibes", tracks: 45, duration: "2h 30m", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
  { id: 2, name: "Workout Hits", tracks: 30, duration: "1h 45m", color: "bg-gradient-to-br from-orange-500 to-red-500" },
  { id: 3, name: "Focus Flow", tracks: 25, duration: "2h", color: "bg-gradient-to-br from-blue-500 to-cyan-500" },
  { id: 4, name: "Road Trip", tracks: 60, duration: "3h 20m", color: "bg-gradient-to-br from-green-500 to-emerald-500" },
  { id: 5, name: "Late Night", tracks: 35, duration: "2h 15m", color: "bg-gradient-to-br from-indigo-500 to-purple-500" },
  { id: 6, name: "Morning Coffee", tracks: 20, duration: "1h 10m", color: "bg-gradient-to-br from-amber-500 to-yellow-500" },
];

const recentlyPlayed = [
  { id: 1, title: "Midnight Dreams", artist: "Luna Band", album: "Night Sky", duration: "3:45", played: "2 hours ago" },
  { id: 2, title: "Electric Feel", artist: "Neon Pulse", album: "Synthwave", duration: "4:12", played: "5 hours ago" },
  { id: 3, title: "Summer Breeze", artist: "Coastal Vibes", album: "Beach Days", duration: "3:28", played: "Yesterday" },
];

export default function LibraryPage() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-32">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">MusicFlow</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/discover" className="text-gray-300 hover:text-white">Discover</Link>
              <Link href="/library" className="text-white font-medium">Library</Link>
              <Link href="/radio" className="text-gray-300 hover:text-white">Radio</Link>
              <Link href="/premium" className="text-gray-300 hover:text-white">Premium</Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search library..."
                  className="pl-9 pr-4 py-2 bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <Headphones className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Library</h1>

        {/* Quick Access */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {librarySections.map((section) => (
            <div
              key={section.name}
              className={`p-6 rounded-xl bg-gradient-to-br ${section.color} cursor-pointer hover:scale-105 transition-transform`}
            >
              <section.icon className="w-8 h-8 mb-4" />
              <h3 className="font-semibold text-lg">{section.name}</h3>
              <p className="text-white/80 text-sm">{section.count} items</p>
            </div>
          ))}
        </div>

        {/* Playlists */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Playlists</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700">
              <Plus className="w-4 h-4" />
              Create Playlist
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="group cursor-pointer">
                <div className={`aspect-square ${playlist.color} rounded-xl mb-3 group-hover:scale-105 transition-transform relative`}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900">
                      <Play className="w-6 h-6 ml-0.5" />
                    </div>
                  </div>
                </div>
                <h3 className="font-medium text-white mb-1">{playlist.name}</h3>
                <p className="text-gray-400 text-sm">{playlist.tracks} tracks • {playlist.duration}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Played */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Recently Played</h2>
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            {recentlyPlayed.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-700 transition-colors group"
              >
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-600"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-xl">
                  🎵
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{track.title}</h4>
                  <p className="text-gray-400 text-sm">{track.artist} • {track.album}</p>
                </div>
                <span className="text-gray-500 text-sm">{track.played}</span>
                <span className="text-gray-500 text-sm">{track.duration}</span>
                <button className="text-gray-400 hover:text-white">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
