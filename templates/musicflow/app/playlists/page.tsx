"use client";

import { Music, Play, Pause, Heart, Clock, Disc, Headphones, Search, Plus, Shuffle, Repeat, Volume2, SkipBack, SkipForward } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const playlists = [
  { id: 1, name: "Chill Vibes", tracks: 45, duration: "2h 30m", color: "from-purple-500 to-pink-500" },
  { id: 2, name: "Workout Mix", tracks: 30, duration: "1h 45m", color: "from-orange-500 to-red-500" },
  { id: 3, name: "Focus Flow", tracks: 25, duration: "2h", color: "from-blue-500 to-cyan-500" },
  { id: 4, name: "Late Night", tracks: 35, duration: "2h 15m", color: "from-indigo-500 to-purple-500" },
];

const currentPlaylist = [
  { id: 1, title: "Midnight Dreams", artist: "Luna Band", album: "Night Sky", duration: "3:45" },
  { id: 2, title: "Electric Feel", artist: "Neon Pulse", album: "Synthwave", duration: "4:12" },
  { id: 3, title: "Summer Breeze", artist: "Coastal Vibes", album: "Beach Days", duration: "3:28" },
  { id: 4, title: "Urban Lights", artist: "City Sounds", album: "Metro", duration: "3:55" },
  { id: 5, title: "Ocean Waves", artist: "Nature Sounds", album: "Relax", duration: "4:30" },
];

export default function PlaylistsPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);

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
              <Link href="/library" className="text-gray-300 hover:text-white">Library</Link>
              <Link href="/playlists" className="text-white font-medium">Playlists</Link>
              <Link href="/radio" className="text-gray-300 hover:text-white">Radio</Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 bg-gray-700 rounded-full text-sm focus:outline-none"
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
        {/* Featured Playlist */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-8xl shadow-2xl">
                🎵
              </div>
              <div className="flex-1">
                <p className="text-gray-400 text-sm mb-2">PUBLIC PLAYLIST</p>
                <h1 className="text-4xl font-bold mb-4">My Favorites</h1>
                <p className="text-gray-400 mb-6">All your favorite songs in one place • 124 tracks, 8h 30m</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 text-black" /> : <Play className="w-6 h-6 text-black ml-1" />}
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white">
                    <Heart className="w-6 h-6" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white">
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Your Playlists */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Playlists</h2>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-600 rounded-full hover:bg-gray-800">
              <Plus className="w-4 h-4" />
              Create Playlist
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="group cursor-pointer">
                <div className={`aspect-square bg-gradient-to-br ${playlist.color} rounded-xl mb-3 group-hover:scale-105 transition-transform shadow-lg`} />
                <h3 className="font-medium mb-1">{playlist.name}</h3>
                <p className="text-gray-400 text-sm">{playlist.tracks} tracks • {playlist.duration}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Track List */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Track List</h2>
          <div className="space-y-2">
            {currentPlaylist.map((track, index) => (
              <div
                key={track.id}
                onClick={() => setCurrentTrack(index)}
                className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer hover:bg-gray-800/50 ${
                  currentTrack === index ? "bg-gray-800" : ""
                }`}
              >
                <span className="w-8 text-center text-gray-400">
                  {currentTrack === index && isPlaying ? (
                    <div className="flex gap-0.5 justify-center">
                      <div className="w-1 h-4 bg-green-500 animate-pulse" />
                      <div className="w-1 h-4 bg-green-500 animate-pulse delay-75" />
                      <div className="w-1 h-4 bg-green-500 animate-pulse delay-150" />
                    </div>
                  ) : (
                    index + 1
                  )}
                </span>
                <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-xl">
                  🎵
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${currentTrack === index ? "text-green-500" : ""}`}>
                    {track.title}
                  </h4>
                  <p className="text-gray-400 text-sm">{track.artist}</p>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <Heart className="w-5 h-5" />
                </button>
                <span className="text-gray-400 text-sm">{track.duration}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 w-1/3">
            <div className="w-14 h-14 bg-gray-700 rounded flex items-center justify-center text-2xl">
              🎵
            </div>
            <div>
              <h4 className="font-medium">{currentPlaylist[currentTrack]?.title}</h4>
              <p className="text-gray-400 text-sm">{currentPlaylist[currentTrack]?.artist}</p>
            </div>
            <button className="text-gray-400 hover:text-white">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col items-center w-1/3">
            <div className="flex items-center gap-6">
              <button className="text-gray-400 hover:text-white">
                <Shuffle className="w-4 h-4" />
              </button>
              <button className="text-gray-400 hover:text-white">
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-5 h-5 text-black" /> : <Play className="w-5 h-5 text-black ml-0.5" />}
              </button>
              <button className="text-gray-400 hover:text-white">
                <SkipForward className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-white">
                <Repeat className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 w-full max-w-md">
              <span className="text-xs text-gray-400">2:14</span>
              <div className="flex-1 h-1 bg-gray-600 rounded-full">
                <div className="w-1/3 h-full bg-white rounded-full" />
              </div>
              <span className="text-xs text-gray-400">{currentPlaylist[currentTrack]?.duration}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-1/3 justify-end">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <div className="w-24 h-1 bg-gray-600 rounded-full">
              <div className="w-3/4 h-full bg-white rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
