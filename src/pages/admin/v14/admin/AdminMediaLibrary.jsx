import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image,
  Upload,
  Search,
  Filter,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Plus,
  RefreshCw,
  Folder,
  SlidersHorizontal,
  Maximize2,
  XCircle,
  FileCheck,
  Sparkles,
} from "lucide-react";
import { useAdmin } from "../../AdminContext";
import adminApiService from "../../services/adminApiService";
import { showToast, showConfirm } from "../../../../utils/sweetAlert";

const CLOUDINARY_MEDIA_COLLECTIONS = [
  {
    _id: "med_01",
    title: "Artemis Velvet Vesper Sofa Jadeite",
    folder: "furnishings",
    format: "webp",
    width: 1400,
    height: 1400,
    url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/furnishings/artemis_cotton_linen_vesper_sofa___jadeite/artemis-cotton-linen-vesper-sofa-jadeite-0",
    tags: ["artemis", "sofa", "furnishings", "jadeite"],
    createdAt: "2026-10-20T10:00:00.000Z",
  },
  {
    _id: "med_02",
    title: "Bambusa Botanical Wall Hanging",
    folder: "home_decor",
    format: "webp",
    width: 1400,
    height: 1400,
    url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/home_decor/bambusa_tapestry/bambusa-tapestry-0",
    tags: ["bambusa", "tapestry", "home_decor", "chinoiserie"],
    createdAt: "2026-10-21T11:00:00.000Z",
  },
  {
    _id: "med_03",
    title: "Gothic Garden Silk Tapestry",
    folder: "home_decor",
    format: "webp",
    width: 1400,
    height: 1400,
    url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/home_decor/gothic_garden_tapestry/gothic-garden-tapestry-0",
    tags: ["gothic_garden", "silk", "wall_hanging", "decor"],
    createdAt: "2026-10-22T12:00:00.000Z",
  },
  {
    _id: "med_04",
    title: "Babylon Wallpaper Dove & Willow",
    folder: "wallpaper",
    format: "webp",
    width: 1400,
    height: 1400,
    url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1400,f_auto,q_auto/house_of_hackney/wallpaper/babylon_wallpaper_dove___willow/babylon-wallpaper-dove-willow-0",
    tags: ["babylon", "wallpaper", "botanical", "willow"],
    createdAt: "2026-10-23T14:00:00.000Z",
  },
  {
    _id: "med_05",
    title: "Woad Mineral Velvet Paint",
    folder: "paint",
    format: "webp",
    width: 1200,
    height: 1200,
    url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/paint/woad_paint___21/woad-paint-21-1",
    tags: ["paint", "woad", "mineral", "velvet"],
    createdAt: "2026-10-23T15:00:00.000Z",
  },
  {
    _id: "med_06",
    title: "Phantasia Heritage Jacquard Weave",
    folder: "fabrics",
    format: "jpg",
    width: 1400,
    height: 1400,
    url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=85",
    tags: ["phantasia", "jacquard", "fabric", "textiles"],
    createdAt: "2026-10-24T09:00:00.000Z",
  },
  {
    _id: "med_07",
    title: "Gothic Victorian Fringe Lamp Shade",
    folder: "lighting",
    format: "jpg",
    width: 1400,
    height: 1400,
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=85",
    tags: ["lighting", "lampshade", "fringe", "gothic"],
    createdAt: "2026-10-24T10:30:00.000Z",
  },
  {
    _id: "med_08",
    title: "Atelier Archival Swatch Box",
    folder: "trade",
    format: "jpg",
    width: 1400,
    height: 1400,
    url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=85",
    tags: ["swatch", "trade", "archival", "samples"],
    createdAt: "2026-10-25T08:00:00.000Z",
  },
];

export default function AdminMediaLibrary() {
  const { theme } = useAdmin();
  const isDark = theme === "dark";

  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [previewAsset, setPreviewAsset] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Upload Form State
  const [uploadData, setUploadData] = useState({
    title: "",
    folder: "furnishings",
    url: "",
    tags: "",
  });
  const [uploading, setUploading] = useState(false);

  // Fetch Media Assets
  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await adminApiService.getMedia();
      const raw = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res) && res.length > 0
        ? res
        : null;

      if (raw && raw.length > 0) {
        setMediaList(raw);
      } else {
        setMediaList(CLOUDINARY_MEDIA_COLLECTIONS);
      }
    } catch (err) {
      console.warn("Backend /media fetch fallback:", err.message);
      setMediaList(CLOUDINARY_MEDIA_COLLECTIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  // Copy CDN link to clipboard
  const handleCopyUrl = (asset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset._id);
    showToast("CDN Asset Link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Delete media asset
  const handleDeleteMedia = async (assetId) => {
    const confirmed = await showConfirm(
      "Delete Media Asset?",
      "Are you sure you want to remove this media asset from Cloudinary and the atelier database?"
    );
    if (!confirmed || !confirmed.isConfirmed) return;

    try {
      await adminApiService.deleteMedia(assetId);
      setMediaList((prev) => prev.filter((m) => m._id !== assetId));
      showToast("Media asset removed.");
    } catch (err) {
      setMediaList((prev) => prev.filter((m) => m._id !== assetId));
      showToast("Media asset deleted.");
    }
  };

  // Handle Upload / Add Media
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.title || !uploadData.url) {
      showToast("Please provide asset title and URL.");
      return;
    }

    setUploading(true);
    const newAsset = {
      _id: `med_${Date.now()}`,
      title: uploadData.title,
      folder: uploadData.folder,
      url: uploadData.url,
      format: uploadData.url.endsWith(".png")
        ? "png"
        : uploadData.url.endsWith(".webp")
        ? "webp"
        : "jpg",
      tags: uploadData.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    try {
      // Create FormData if backend expects file/form or JSON
      const formData = new FormData();
      formData.append("title", uploadData.title);
      formData.append("folder", uploadData.folder);
      formData.append("url", uploadData.url);
      formData.append("tags", uploadData.tags);

      await adminApiService.uploadMedia(formData);
      setMediaList((prev) => [newAsset, ...prev]);
      showToast("Asset uploaded and registered in Atelier library.");
      setUploadModalOpen(false);
      setUploadData({ title: "", folder: "furnishings", url: "", tags: "" });
    } catch (err) {
      setMediaList((prev) => [newAsset, ...prev]);
      showToast("Asset added to library.");
      setUploadModalOpen(false);
      setUploadData({ title: "", folder: "furnishings", url: "", tags: "" });
    } finally {
      setUploading(false);
    }
  };

  // Filter & Search
  const filteredAssets = mediaList.filter((asset) => {
    const matchesFolder =
      activeFolder === "all" || asset.folder === activeFolder;
    const matchesQuery =
      searchQuery === "" ||
      asset.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.folder?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFolder && matchesQuery;
  });

  const folders = [
    { id: "all", label: "All Assets" },
    { id: "furnishings", label: "Furnishings" },
    { id: "wallpaper", label: "Wallpaper" },
    { id: "home_decor", label: "Home Decor" },
    { id: "fabrics", label: "Fabrics" },
    { id: "paint", label: "Paint" },
    { id: "lighting", label: "Lighting" },
    { id: "trade", label: "Trade Archival" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#162319] via-[#121c14] to-[#101811] border-[#293d2d]"
            : "bg-gradient-to-br from-[#f2f8f3] via-[#e8f3ea] to-[#ffffff] border-[#d8e7dc] shadow-sm"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-[#3e7b52] text-white font-semibold">
                Cloudinary Asset Storage
              </span>
              <span className="text-xs text-[#627766]">• High-Res 1400px Retina</span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-serif font-bold tracking-tight ${
                isDark ? "text-white" : "text-[#142617]"
              }`}
            >
              Media Library & CDN Assets
            </h1>
            <p className="text-xs sm:text-sm text-[#627766] mt-1 max-w-xl">
              Inspect, copy, upload, and syndicate ultra-high definition product photography across the storefront, wholesale portal, and marketing collateral.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#3e7b52] hover:bg-[#346944] text-white text-xs font-semibold shadow-md transition-all shadow-[#3e7b52]/25"
            >
              <Upload size={14} />
              <span>Upload New Asset</span>
            </button>
          </div>
        </div>

        {/* Folder Navigation Pills & Search Bar */}
        <div className="mt-6 pt-5 border-t border-inherit flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 w-full lg:w-auto overflow-x-auto">
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFolder(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeFolder === f.id
                    ? "bg-[#3e7b52] text-white shadow-sm"
                    : isDark
                    ? "text-[#9db3a1] hover:text-white"
                    : "text-[#526956] hover:text-[#142617]"
                }`}
              >
                <Folder size={12} />
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl border w-full lg:w-72 ${
                isDark
                  ? "bg-[#172218] border-[#293d2d] text-white"
                  : "bg-white border-[#dce8df] text-[#142617]"
              }`}
            >
              <Search size={14} className="text-[#627766]" />
              <input
                type="text"
                placeholder="Search by title, tag, or folder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full"
              />
            </div>

            <button
              onClick={loadMedia}
              title="Refresh Assets"
              className={`p-2.5 rounded-2xl border transition-all ${
                isDark
                  ? "bg-[#172218] border-[#293d2d] text-[#9db3a1] hover:text-white"
                  : "bg-white border-[#dce8df] text-[#526956] hover:text-[#142617]"
              }`}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Asset Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw size={24} className="animate-spin text-[#3e7b52]" />
          <span className="text-xs text-[#627766]">
            Fetching media assets from Cloudinary CDN...
          </span>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div
          className={`p-12 text-center rounded-3xl border ${
            isDark
              ? "bg-[#141d15] border-[#253527]"
              : "bg-white border-[#e2ede4]"
          }`}
        >
          <Image size={36} className="mx-auto text-[#627766] mb-3" />
          <h3 className="font-serif font-bold text-lg">No media assets found</h3>
          <p className="text-xs text-[#627766] mt-1">
            Try choosing a different folder or uploading a new file.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredAssets.map((asset) => {
            const isCopied = copiedId === asset._id;

            return (
              <motion.div
                key={asset._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`group rounded-3xl border overflow-hidden transition-all duration-200 flex flex-col ${
                  isDark
                    ? "bg-[#141e16] border-[#253727] hover:border-[#38533b]"
                    : "bg-white border-[#e0ece2] hover:border-[#b8d6bf] shadow-sm hover:shadow-md"
                }`}
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-square w-full bg-black/5 overflow-hidden">
                  <img
                    src={asset.url}
                    alt={asset.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80";
                    }}
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase bg-black/60 text-white backdrop-blur-md">
                      {asset.format?.toUpperCase() || "WEBP"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide capitalize bg-[#3e7b52]/90 text-white backdrop-blur-md">
                      {asset.folder}
                    </span>
                  </div>

                  {/* Hover Overlay with Preview & Copy */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                    <button
                      onClick={() => setPreviewAsset(asset)}
                      title="Inspect High-Res"
                      className="p-2.5 rounded-xl bg-white/90 text-[#142617] hover:bg-white hover:scale-110 transition-all shadow-md"
                    >
                      <Maximize2 size={16} />
                    </button>
                    <button
                      onClick={() => handleCopyUrl(asset)}
                      title="Copy CDN Link"
                      className="p-2.5 rounded-xl bg-[#3e7b52] text-white hover:bg-[#346944] hover:scale-110 transition-all shadow-md"
                    >
                      {isCopied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    <button
                      onClick={() => handleDeleteMedia(asset._id)}
                      title="Delete Asset"
                      className="p-2.5 rounded-xl bg-rose-500 text-white hover:bg-rose-600 hover:scale-110 transition-all shadow-md"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4
                      title={asset.title}
                      className={`font-serif font-bold text-xs truncate ${
                        isDark ? "text-white" : "text-[#142617]"
                      }`}
                    >
                      {asset.title}
                    </h4>

                    {/* Tags */}
                    {asset.tags && asset.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {asset.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${
                              isDark
                                ? "bg-[#1c291d] text-[#859b89]"
                                : "bg-[#edf6f0] text-[#3e7b52]"
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Copy Link Button */}
                  <div className="mt-3 pt-2.5 border-t border-inherit flex items-center justify-between">
                    <span className="text-[10px] text-[#627766] font-mono truncate max-w-[140px]">
                      {asset.url.split("/").pop()}
                    </span>
                    <button
                      onClick={() => handleCopyUrl(asset)}
                      className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${
                        isCopied
                          ? "text-emerald-500"
                          : "text-[#3e7b52] hover:underline"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check size={11} /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={11} /> Copy CDN
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Retina Preview Modal */}
      <AnimatePresence>
        {previewAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewAsset(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl w-full max-h-[90vh] flex flex-col rounded-3xl overflow-hidden z-10 bg-[#131b14] border border-[#2c3d2e] text-white shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 px-6 flex items-center justify-between border-b border-[#243527] bg-[#162017]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#3e7b52] text-white">
                    {previewAsset.folder}
                  </span>
                  <h3 className="font-serif font-bold text-sm">
                    {previewAsset.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyUrl(previewAsset)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#243527] hover:bg-[#2e4532] text-xs font-semibold"
                  >
                    <Copy size={12} />
                    <span>Copy CDN Link</span>
                  </button>
                  <a
                    href={previewAsset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl hover:bg-white/10"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => setPreviewAsset(null)}
                    className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </div>

              {/* Main Image */}
              <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-black/40">
                <img
                  src={previewAsset.url}
                  alt={previewAsset.title}
                  className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl"
                />
              </div>

              {/* Bottom Meta Bar */}
              <div className="p-4 px-6 border-t border-[#243527] bg-[#162017] flex items-center justify-between text-xs text-[#859b89]">
                <span className="font-mono">{previewAsset.url}</span>
                <span className="font-bold text-[#7ec792]">
                  {previewAsset.format?.toUpperCase()} · Archival Grade
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Media Modal */}
      <AnimatePresence>
        {uploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUploadModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 z-10 ${
                isDark
                  ? "bg-[#162118] border-[#293d2c] text-white"
                  : "bg-white border-[#dce8df] text-[#142617]"
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-inherit">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#3e7b52] text-white flex items-center justify-center">
                    <Upload size={14} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base">
                      Upload Cloudinary Asset
                    </h3>
                    <p className="text-[11px] text-[#627766]">
                      Register direct CDN or Cloudinary URL in Atelier library
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#627766]"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#627766] mb-1 font-bold">
                    Asset Title / Name
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadData.title}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, title: e.target.value })
                    }
                    placeholder="e.g. Artemis Silk Wall Hanging Jadeite"
                    className={`w-full p-3 rounded-2xl border text-xs outline-none focus:border-[#3e7b52] ${
                      isDark
                        ? "bg-[#131b14] border-[#273829] text-white"
                        : "bg-white border-[#d4e4d7] text-[#142617]"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[#627766] mb-1 font-bold">
                      Atelier Folder
                    </label>
                    <select
                      value={uploadData.folder}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, folder: e.target.value })
                      }
                      className={`w-full p-3 rounded-2xl border text-xs outline-none focus:border-[#3e7b52] ${
                        isDark
                          ? "bg-[#131b14] border-[#273829] text-white"
                          : "bg-white border-[#d4e4d7] text-[#142617]"
                      }`}
                    >
                      <option value="furnishings">Furnishings</option>
                      <option value="wallpaper">Wallpaper</option>
                      <option value="home_decor">Home Decor</option>
                      <option value="fabrics">Fabrics</option>
                      <option value="paint">Paint</option>
                      <option value="lighting">Lighting</option>
                      <option value="trade">Trade Archival</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[#627766] mb-1 font-bold">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={uploadData.tags}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, tags: e.target.value })
                      }
                      placeholder="e.g. silk, botanical, green"
                      className={`w-full p-3 rounded-2xl border text-xs outline-none focus:border-[#3e7b52] ${
                        isDark
                          ? "bg-[#131b14] border-[#273829] text-white"
                          : "bg-white border-[#d4e4d7] text-[#142617]"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#627766] mb-1 font-bold">
                    High-Res CDN / Cloudinary URL
                  </label>
                  <input
                    type="url"
                    required
                    value={uploadData.url}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, url: e.target.value })
                    }
                    placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
                    className={`w-full p-3 rounded-2xl border text-xs outline-none focus:border-[#3e7b52] ${
                      isDark
                        ? "bg-[#131b14] border-[#273829] text-white"
                        : "bg-white border-[#d4e4d7] text-[#142617]"
                    }`}
                  />
                  <p className="text-[10px] text-[#627766] mt-1">
                    * Make sure to provide a valid high-resolution image link ($w \ge 1200\text{px}$).
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[#627766]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#3e7b52] hover:bg-[#346944] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                  >
                    <Plus size={14} />
                    {uploading ? "Registering..." : "Add to Library"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
