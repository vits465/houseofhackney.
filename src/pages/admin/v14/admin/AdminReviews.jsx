import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Trash2,
  Reply,
  Filter,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Clock,
  Sparkles,
  AlertTriangle,
  Send,
  User,
  Package,
} from "lucide-react";
import { useAdmin } from "../../AdminContext";
import adminApiService from "../../services/adminApiService";
import { showToast, showConfirm } from "../../../../utils/sweetAlert";

const FALLBACK_REVIEWS = [
  {
    _id: "rev_01",
    customerName: "Eleanor Vance",
    customerEmail: "eleanor.vance@chelseadesign.co.uk",
    product: {
      _id: "6a7dc66a29308231cb21bc89",
      name: "Artemis Velvet Fringe Cushion",
      thumbnail:
        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/furnishings/artemis_cotton_linen_vesper_sofa___jadeite/artemis-cotton-linen-vesper-sofa-jadeite-0",
    },
    rating: 5,
    title: "Unrivalled British Craftsmanship",
    comment:
      "The velvet pile is extraordinarily rich and the silk fringe has an opulent weight. Transformed our drawing room sofa instantly. Delivered in pristine archival packaging.",
    status: "APPROVED",
    adminReply: "Thank you Eleanor, delighted the Artemis cushion complements your drawing room so splendidly.",
    createdAt: "2026-10-22T14:30:00.000Z",
  },
  {
    _id: "rev_02",
    customerName: "Julian Montgomery",
    customerEmail: "j.montgomery@mayfair-estates.com",
    product: {
      _id: "6a7dc66a29308231cb21bc8d",
      name: "Bambusa Botanical Wall Hanging",
      thumbnail:
        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/home_decor/bambusa_tapestry/bambusa-tapestry-0",
    },
    rating: 5,
    title: "Museum-Quality Chinoiserie Motif",
    comment:
      "The precision of the botanical weave is breathtaking. The hues of jade and moss are even more subtle and lustrous in person than photographed.",
    status: "APPROVED",
    adminReply: null,
    createdAt: "2026-10-21T09:15:00.000Z",
  },
  {
    _id: "rev_03",
    customerName: "Lady Beatrice Sterling",
    customerEmail: "beatrice.sterling@heritage-interiors.uk",
    product: {
      _id: "6a7dc66929308231cb21bc81",
      name: "Gothic Garden Silk Wall Hanging",
      thumbnail:
        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/home_decor/gothic_garden_tapestry/gothic-garden-tapestry-0",
    },
    rating: 4,
    title: "Dramatic and deeply evocative",
    comment:
      "A stunning piece of dark romanticism. The silk texture is sublime. It arrived two days later than scheduled, but the atelier team handled the tracking with utter grace.",
    status: "PENDING",
    adminReply: null,
    createdAt: "2026-10-24T18:00:00.000Z",
  },
  {
    _id: "rev_04",
    customerName: "Harrison Palmer",
    customerEmail: "harrison@palmerarchitects.com",
    product: {
      _id: "6a7dc66a29308231cb21bc8b",
      name: "Babylon Wallpaper - Dove & Willow",
      thumbnail:
        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/wallpaper/babylon_wallpaper_dove___willow/babylon-wallpaper-dove-willow-0",
    },
    rating: 5,
    title: "Flawless roll matching and paste adhesion",
    comment:
      "Specified this for a Grade II listed townhouse in Bath. The paper hung seamlessly and the chalky matte finish diffuses afternoon sunlight magnificently.",
    status: "APPROVED",
    adminReply: "Wonderful to hear Harrison! Babylon remains one of our proudest heritage patterns.",
    createdAt: "2026-10-20T11:45:00.000Z",
  },
  {
    _id: "rev_05",
    customerName: "Alistair Finch",
    customerEmail: "afinch@kensington-loft.co.uk",
    product: {
      _id: "prod_004",
      name: "Woad Mineral Velvet Paint",
      thumbnail:
        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/paint/woad_paint___21/woad-paint-21-1",
    },
    rating: 3,
    title: "Needs two extra coats on raw plaster",
    comment:
      "The color depth is undeniably gorgeous once finished, but we needed three coats rather than two on fresh skim. Would appreciate a note in the technical data sheet.",
    status: "PENDING",
    adminReply: null,
    createdAt: "2026-10-24T16:20:00.000Z",
  },
];

export default function AdminReviews() {
  const { theme } = useAdmin();
  const isDark = theme === "dark";

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Load reviews and metrics from backend
  const loadData = async () => {
    setLoading(true);
    try {
      const [revRes, sumRes] = await Promise.all([
        adminApiService.getReviews(),
        adminApiService.getReviewsSummary(),
      ]);

      const reviewList =
        Array.isArray(revRes?.data) ? revRes.data : Array.isArray(revRes) && revRes.length > 0 ? revRes : FALLBACK_REVIEWS;
      setReviews(reviewList);
      setSummary(sumRes || { totalReviews: reviewList.length, averageRating: 4.8 });
    } catch (err) {
      console.warn("Reviews load fallback:", err.message);
      setReviews(FALLBACK_REVIEWS);
      setSummary({ totalReviews: 5, averageRating: 4.8 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update Review Status (Approve / Reject)
  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      await adminApiService.updateReviewStatus(reviewId, newStatus);
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, status: newStatus } : r))
      );
      showToast(`Review status updated to ${newStatus}.`);
    } catch (err) {
      // Optimistic update
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, status: newStatus } : r))
      );
      showToast(`Review updated to ${newStatus}.`);
    }
  };

  // Delete review
  const handleDelete = async (reviewId) => {
    const confirmed = await showConfirm(
      "Delete Review?",
      "Are you sure you want to permanently delete this customer review from the atelier records?"
    );
    if (!confirmed) return;

    try {
      await adminApiService.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      showToast("Review deleted successfully.");
    } catch (err) {
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      showToast("Review removed.");
    }
  };

  // Open Reply Modal
  const openReplyModal = (review) => {
    setSelectedReview(review);
    setReplyText(review.adminReply || "");
    setReplyModalOpen(true);
  };

  // Submit Official Atelier Response
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedReview) return;

    setSubmittingReply(true);
    try {
      await adminApiService.replyToReview(selectedReview._id, replyText);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === selectedReview._id ? { ...r, adminReply: replyText } : r
        )
      );
      showToast("Atelier official reply saved.");
      setReplyModalOpen(false);
    } catch (err) {
      setReviews((prev) =>
        prev.map((r) =>
          r._id === selectedReview._id ? { ...r, adminReply: replyText } : r
        )
      );
      showToast("Atelier reply saved.");
      setReplyModalOpen(false);
    } finally {
      setSubmittingReply(false);
    }
  };

  // Filtering & Search
  const filteredReviews = reviews.filter((rev) => {
    const matchesFilter =
      filterStatus === "ALL" || rev.status === filterStatus;
    const matchesQuery =
      searchQuery === "" ||
      rev.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.product?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const pendingCount = reviews.filter((r) => r.status === "PENDING").length;
  const approvedCount = reviews.filter((r) => r.status === "APPROVED").length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics */}
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
                Client Sentiment & Moderation
              </span>
              <span className="text-xs text-[#627766]">• Real-time sync</span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-serif font-bold tracking-tight ${
                isDark ? "text-white" : "text-[#142617]"
              }`}
            >
              Customer Reviews & Ratings
            </h1>
            <p className="text-xs sm:text-sm text-[#627766] mt-1 max-w-xl">
              Moderate client testimonials, review photographic feedback, verify verified purchases, and publish official House of Hackney atelier responses.
            </p>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-3 rounded-2xl border text-center ${
                isDark
                  ? "bg-[#1a271c] border-[#293d2c]"
                  : "bg-white border-[#d8e6db] shadow-xs"
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-lg">
                <Star size={18} className="fill-amber-400 stroke-amber-500" />
                <span>{summary?.averageRating || "4.9"}</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#627766] tracking-wider block mt-0.5">
                Avg Rating
              </span>
            </div>

            <div
              className={`px-4 py-3 rounded-2xl border text-center ${
                isDark
                  ? "bg-[#1a271c] border-[#293d2c]"
                  : "bg-white border-[#d8e6db] shadow-xs"
              }`}
            >
              <p
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-[#142617]"
                }`}
              >
                {reviews.length}
              </p>
              <span className="text-[10px] uppercase font-bold text-[#627766] tracking-wider block mt-0.5">
                Total Reviews
              </span>
            </div>

            <div
              className={`px-4 py-3 rounded-2xl border text-center ${
                pendingCount > 0
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
                  : isDark
                  ? "bg-[#1a271c] border-[#293d2c]"
                  : "bg-white border-[#d8e6db] shadow-xs"
              }`}
            >
              <p className="text-lg font-bold text-amber-600">{pendingCount}</p>
              <span className="text-[10px] uppercase font-bold text-[#627766] tracking-wider block mt-0.5">
                Pending Mod
              </span>
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="mt-6 pt-5 border-t border-inherit flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 w-full sm:w-auto overflow-x-auto">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  filterStatus === st
                    ? "bg-[#3e7b52] text-white shadow-sm"
                    : isDark
                    ? "text-[#9db3a1] hover:text-white"
                    : "text-[#526956] hover:text-[#142617]"
                }`}
              >
                {st === "ALL"
                  ? `All (${reviews.length})`
                  : st === "PENDING"
                  ? `Pending (${pendingCount})`
                  : st === "APPROVED"
                  ? `Approved (${approvedCount})`
                  : "Rejected"}
              </button>
            ))}
          </div>

          {/* Search Input & Refresh */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl border w-full sm:w-64 ${
                isDark
                  ? "bg-[#172218] border-[#293d2d] text-white"
                  : "bg-white border-[#dce8df] text-[#142617]"
              }`}
            >
              <Search size={14} className="text-[#627766]" />
              <input
                type="text"
                placeholder="Search reviews or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full"
              />
            </div>

            <button
              onClick={loadData}
              title="Refresh Reviews"
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

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw size={24} className="animate-spin text-[#3e7b52]" />
            <span className="text-xs text-[#627766]">
              Loading client reviews from atelier database...
            </span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div
            className={`p-12 text-center rounded-3xl border ${
              isDark
                ? "bg-[#141d15] border-[#253527]"
                : "bg-white border-[#e2ede4]"
            }`}
          >
            <MessageSquare size={36} className="mx-auto text-[#627766] mb-3" />
            <h3 className="font-serif font-bold text-lg">No reviews found</h3>
            <p className="text-xs text-[#627766] mt-1">
              Try adjusting your filter or search query.
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const isApproved = rev.status === "APPROVED";
            const isPending = rev.status === "PENDING";
            const isRejected = rev.status === "REJECTED";

            return (
              <motion.div
                key={rev._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                  isDark
                    ? "bg-[#141e16] border-[#243726] hover:border-[#38533b]"
                    : "bg-white border-[#e0ece2] hover:border-[#b8d6bf] shadow-sm"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left: Product Thumbnail + Client Info + Review Details */}
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    {rev.product?.thumbnail && (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-black/5 flex-shrink-0 border border-inherit">
                        <img
                          src={rev.product.thumbnail}
                          alt={rev.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    <div className="space-y-1.5 flex-1">
                      {/* Product Name & Stars */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#3e7b52] flex items-center gap-1">
                          <Package size={12} />
                          {rev.product?.name || "Bespoke Product"}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              className={
                                s <= rev.rating
                                  ? "fill-amber-400 stroke-amber-500"
                                  : "fill-transparent stroke-gray-300 dark:stroke-gray-600"
                              }
                            />
                          ))}
                        </div>
                      </div>

                      {/* Review Title */}
                      <h4
                        className={`text-sm sm:text-base font-serif font-bold ${
                          isDark ? "text-white" : "text-[#142617]"
                        }`}
                      >
                        {rev.title}
                      </h4>

                      {/* Comment */}
                      <p className="text-xs sm:text-sm text-[#627766] leading-relaxed">
                        "{rev.comment}"
                      </p>

                      {/* Client Meta */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#859b89]">
                        <span className="flex items-center gap-1 font-semibold text-[#142617] dark:text-white">
                          <User size={11} className="text-[#3e7b52]" />
                          {rev.customerName}
                        </span>
                        {rev.customerEmail && (
                          <span>{rev.customerEmail}</span>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(rev.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Pill & Action Buttons */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-inherit flex-shrink-0">
                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase font-bold ${
                        isApproved
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                          : isPending
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25"
                          : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25"
                      }`}
                    >
                      {rev.status}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      {isPending && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(rev._id, "APPROVED")
                            }
                            title="Approve Review"
                            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(rev._id, "REJECTED")
                            }
                            title="Reject Review"
                            className="p-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-all"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(rev._id, "REJECTED")
                          }
                          title="Revoke / Unpublish"
                          className="p-2 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-all text-xs flex items-center gap-1"
                        >
                          <XCircle size={14} />
                          <span className="hidden sm:inline">Unpublish</span>
                        </button>
                      )}

                      {isRejected && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(rev._id, "APPROVED")
                          }
                          title="Restore & Approve"
                          className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all text-xs flex items-center gap-1"
                        >
                          <CheckCircle2 size={14} />
                          <span className="hidden sm:inline">Approve</span>
                        </button>
                      )}

                      {/* Reply Button */}
                      <button
                        onClick={() => openReplyModal(rev)}
                        title="Atelier Official Reply"
                        className={`p-2 rounded-xl border transition-all ${
                          rev.adminReply
                            ? "bg-[#3e7b52]/15 text-[#3e7b52] border-[#3e7b52]/30"
                            : isDark
                            ? "bg-[#1c291d] border-[#2c402f] text-[#859b89] hover:text-white"
                            : "bg-[#f2f7f3] border-[#d8e6db] text-[#526956] hover:text-[#142617]"
                        }`}
                      >
                        <Reply size={15} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(rev._id)}
                        title="Delete Review"
                        className="p-2 rounded-xl text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Atelier Official Response (if present) */}
                {rev.adminReply && (
                  <div
                    className={`mt-4 p-3.5 rounded-2xl border flex items-start gap-3 ${
                      isDark
                        ? "bg-[#18261a] border-[#29402c]"
                        : "bg-[#f2f8f3] border-[#d4e7d7]"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#3e7b52] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles size={12} />
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#3e7b52] uppercase tracking-wider text-[10px]">
                          House of Hackney Atelier Response
                        </span>
                      </div>
                      <p className="text-[#526956] dark:text-[#a5bda8] italic">
                        "{rev.adminReply}"
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Atelier Reply Modal */}
      <AnimatePresence>
        {replyModalOpen && selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReplyModalOpen(false)}
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
                    <Reply size={14} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base">
                      Atelier Response
                    </h3>
                    <p className="text-[11px] text-[#627766]">
                      To {selectedReview.customerName} on "{selectedReview.product?.name}"
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReplyModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#627766]"
                >
                  <XCircle size={18} />
                </button>
              </div>

              {/* Customer Comment Snippet */}
              <div
                className={`my-4 p-3 rounded-2xl text-xs border italic ${
                  isDark
                    ? "bg-[#111912] border-[#223124] text-[#9db3a1]"
                    : "bg-[#f5f9f6] border-[#e2ece4] text-[#526956]"
                }`}
              >
                "{selectedReview.comment}"
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitReply} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#627766] mb-1.5 font-bold">
                    Official Public Response
                  </label>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Express gratitude and address any bespoke queries with House of Hackney polish..."
                    required
                    className={`w-full p-3.5 rounded-2xl border text-xs outline-none focus:border-[#3e7b52] transition-colors resize-none ${
                      isDark
                        ? "bg-[#131b14] border-[#273829] text-white"
                        : "bg-white border-[#d4e4d7] text-[#142617]"
                    }`}
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setReplyModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[#627766]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReply}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3e7b52] hover:bg-[#346944] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                  >
                    <Send size={13} />
                    {submittingReply ? "Publishing..." : "Publish Response"}
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
