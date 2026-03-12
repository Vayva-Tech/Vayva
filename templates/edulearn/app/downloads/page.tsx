"use client";

import Header from "@/components/Header";
import { Download, Clock, CheckCircle, AlertCircle, FileText, FileArchive, FileVideo, FileImage, FolderOpen, ExternalLink, Trash2, Pause, Play } from "lucide-react";
import { useState } from "react";

const downloadHistory = [
  {
    id: 1,
    name: "Blender_4.0_Complete_Hotkey_Guide.pdf",
    type: "pdf",
    size: "2.4 MB",
    downloadedAt: "2024-03-05 14:30",
    status: "completed",
    course: "Blender Fundamentals",
  },
  {
    id: 2,
    name: "8K_PBR_Concrete_Textures.zip",
    type: "archive",
    size: "4.8 GB",
    downloadedAt: "2024-03-04 09:15",
    status: "completed",
    course: "Materials & Texturing",
  },
  {
    id: 3,
    name: "Maya_Character_Rig_Base.ma",
    type: "project",
    size: "156 MB",
    downloadedAt: "2024-03-03 16:45",
    status: "completed",
    course: "Character Animation",
  },
  {
    id: 4,
    name: "After_Effects_Title_Templates.zip",
    type: "archive",
    size: "45 MB",
    downloadedAt: "2024-03-02 11:20",
    status: "completed",
    course: "Motion Graphics",
  },
];

const activeDownloads = [
  {
    id: 101,
    name: "Unreal_Engine_5_Material_Library.zip",
    type: "archive",
    size: "2.1 GB",
    progress: 67,
    speed: "5.2 MB/s",
    timeLeft: "2 min",
    status: "downloading",
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case "pdf": return <FileText className="w-8 h-8 text-red-500" />;
    case "video": return <FileVideo className="w-8 h-8 text-blue-500" />;
    case "archive": return <FileArchive className="w-8 h-8 text-yellow-500" />;
    case "project": return <FileImage className="w-8 h-8 text-purple-500" />;
    default: return <FileText className="w-8 h-8 text-gray-500" />;
  }
};

export default function DownloadsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [downloads, setDownloads] = useState(activeDownloads);

  const pauseDownload = (id: number) => {
    setDownloads(downloads.map(d => d.id === id ? { ...d, status: d.status === "downloading" ? "paused" : "downloading" } : d));
  };

  const cancelDownload = (id: number) => {
    setDownloads(downloads.filter(d => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[{ label: "Downloads" }]} />

      <div className="px-6 py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Downloads</h1>
          <p className="text-gray-500">Manage your course materials and resources</p>
        </div>

        {/* Storage Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">12.4 GB</div>
            <div className="text-gray-500 text-sm">Total Downloaded</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">156</div>
            <div className="text-gray-500 text-sm">Files Downloaded</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">2</div>
            <div className="text-gray-500 text-sm">Active Downloads</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">45 GB</div>
            <div className="text-gray-500 text-sm">Storage Limit</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-3 font-medium text-sm transition-colors ${
              activeTab === "active"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Active Downloads
            {downloads.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                {downloads.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-3 font-medium text-sm transition-colors ${
              activeTab === "history"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Download History
          </button>
        </div>

        {/* Active Downloads */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {downloads.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No active downloads</h3>
                <p className="text-gray-500">All your downloads are complete!</p>
              </div>
            ) : (
              downloads.map((download) => (
                <div key={download.id} className="card p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                      {getIcon(download.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 truncate">{download.name}</h3>
                        <span className="text-sm text-gray-500">{download.size}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span>{download.speed}</span>
                        <span>•</span>
                        <span>{download.timeLeft} remaining</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[300px]">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${download.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12">{download.progress}%</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => pauseDownload(download.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {download.status === "downloading" ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={() => cancelDownload(download.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Download History */}
        {activeTab === "history" && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {downloadHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            {getIcon(item.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{item.course}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{item.size}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {item.downloadedAt}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Open Downloads Folder</h3>
            </div>
            <p className="text-sm text-gray-500">Access all your downloaded files in one place</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Storage Status</h3>
            </div>
            <p className="text-sm text-gray-500">12.4 GB used of 45 GB available</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-medium text-gray-900">Failed Downloads</h3>
            </div>
            <p className="text-sm text-gray-500">No failed downloads in the last 30 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
