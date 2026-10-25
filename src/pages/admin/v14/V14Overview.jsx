import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  MoreVertical,
  Search,
  Filter,
  Wallet,
  ShoppingBag,
  FileText,
  DollarSign,
} from "lucide-react";
import { useAdmin } from "../AdminContext";
import {
  V14_WALLETS,
  V14_KPI_CARDS,
  V14_BAR_CHART_DATA,
  V14_ACTIVITIES,
} from "./v14Data";
import { showToast } from "../../../utils/sweetAlert";

export default function V14Overview() {
  const { theme } = useAdmin();
  const isDark = theme === "dark";

  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [hoveredBar, setHoveredBar] = useState(null);
  const [searchActivity, setSearchActivity] = useState("");

  const filteredActivities = V14_ACTIVITIES.filter(
    (a) =>
      a.activity.toLowerCase().includes(searchActivity.toLowerCase()) ||
      a.id.toLowerCase().includes(searchActivity.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting from Video */}
      <div>
        <h1
          className={`text-2xl sm:text-3xl font-sans font-bold tracking-tight ${
            isDark ? "text-[#f2f7f3]" : "text-[#142617]"
          }`}
        >
          Good morning, Code XR
        </h1>
        <p
          className={`text-xs sm:text-sm mt-1 font-sans ${
            isDark ? "text-[#9db3a1]" : "text-[#526956]"
          }`}
        >
          Stay on top of your tasks, monitor progress, and track status.
        </p>
      </div>

      {/* 2. Top Row: 3 Columns (Total Balance | 2x2 KPIs | Total Income Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Column 1: Total Balance Card (4 cols) */}
        <div
          className={`lg:col-span-4 p-6 rounded-3xl border flex flex-col justify-between transition-all duration-200 shadow-sm ${
            isDark
              ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]"
              : "bg-white border-[#e2ece5] text-[#142617]"
          }`}
        >
          <div>
            {/* Top row: Label + Currency Dropdown */}
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-sans font-medium ${
                  isDark ? "text-[#9db3a1]" : "text-[#526956]"
                }`}
              >
                Total Balance
              </span>

              <div className="relative">
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className={`text-xs font-sans font-semibold py-1 px-3 rounded-full border focus:outline-none cursor-pointer transition-colors ${
                    isDark
                      ? "bg-[#212c23] border-[#344737] text-[#f2f7f3]"
                      : "bg-[#f5f9f6] border-[#d8e6dc] text-[#285735]"
                  }`}
                >
                  <option value="USD">🇺🇸 USD</option>
                  <option value="EUR">🇪🇺 EUR</option>
                  <option value="GBP">🇬🇧 GBP</option>
                </select>
              </div>
            </div>

            {/* Big Balance Number */}
            <h2
              className={`text-3xl font-sans font-bold tracking-tight ${
                isDark ? "text-[#f2f7f3]" : "text-[#142617]"
              }`}
            >
              {selectedCurrency === "USD"
                ? "$622,341.59"
                : selectedCurrency === "EUR"
                ? "€584,120.40"
                : "£495,210.85"}
            </h2>

            {/* Percentage Growth Badge */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-0.5 text-[11px] font-sans font-bold px-2 py-0.5 rounded-full bg-[#eaf5ed] text-[#2e6d3f]">
                <ArrowUpRight size={12} className="stroke-[3]" />
                5%
              </span>
              <span
                className={`text-xs font-sans ${
                  isDark ? "text-[#9db3a1]" : "text-[#526956]"
                }`}
              >
                than last month
              </span>
            </div>

            {/* Transfer & Request Pill Buttons (Light Green and White - NO BLACK!) */}
            <div className="grid grid-cols-2 gap-3 my-5">
              <button
                onClick={() => showToast("Opening Transfer Dialog...")}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-[#3e7b52] hover:bg-[#346945] text-white text-xs font-sans font-semibold transition-colors shadow-sm shadow-[#3e7b52]/20"
              >
                <ArrowLeftRight size={14} />
                <span>Transfer</span>
              </button>

              <button
                onClick={() => showToast("Payment Request Created.")}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full border text-xs font-sans font-semibold transition-colors ${
                  isDark
                    ? "bg-[#212c23] border-[#344737] text-[#f2f7f3] hover:bg-[#2a382d]"
                    : "bg-[#edf6f0] border-[#cce3d2] text-[#285735] hover:bg-[#e2f0e6]"
                }`}
              >
                <ArrowLeftRight size={14} className="rotate-180" />
                <span>Request</span>
              </button>
            </div>
          </div>

          {/* Wallets Row from Video */}
          <div className="pt-4 border-t border-current/10">
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-xs font-sans font-medium ${
                  isDark ? "text-[#8a9d8e]" : "text-[#627766]"
                }`}
              >
                Wallets | Total 6 wallets
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {V14_WALLETS.map((w, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-2xl border transition-all ${
                    isDark
                      ? "bg-[#141a15] border-[#253327]"
                      : "bg-[#fcfdfc] border-[#e7f0e9]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-sans mb-1">
                    <span className="font-bold flex items-center gap-1">
                      <span>{w.flag}</span>
                      <span>{w.currency}</span>
                    </span>
                    <MoreVertical size={11} className="opacity-40" />
                  </div>

                  <p className="font-sans font-bold text-xs truncate">
                    {w.balance}
                  </p>

                  <p
                    className={`text-[9px] truncate mt-0.5 ${
                      isDark ? "text-[#7f9183]" : "text-[#8a9c8e]"
                    }`}
                  >
                    {w.limit}
                  </p>

                  <div className="mt-1.5">
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${
                        w.isActive
                          ? "bg-[#eaf5ed] text-[#347847]"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: 2x2 Metric Cards Grid from Video (4 cols) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          {/* Card 1: Total Earnings (Light Green Botanical Luxury Gradient from Video) */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#3b6d49] via-[#4d865c] to-[#629970] text-white flex flex-col justify-between shadow-md">
            <div className="flex items-start justify-between">
              <span className="text-xs font-sans font-medium text-white/90">
                Total Earnings
              </span>
              <div className="p-1.5 rounded-xl bg-white/20 text-white backdrop-blur-sm">
                <Wallet size={15} />
              </div>
            </div>

            <div className="my-2">
              <h3 className="text-3xl font-sans font-bold tracking-tight">
                {V14_KPI_CARDS.earnings.value}
              </h3>
            </div>

            <div>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                <ArrowUpRight size={12} className="stroke-[3]" />
                {V14_KPI_CARDS.earnings.change}{" "}
                <span className="font-normal opacity-90 ml-1">
                  {V14_KPI_CARDS.earnings.period}
                </span>
              </span>
            </div>
          </div>

          {/* Card 2: Total Spending (Pure White Card) */}
          <div
            className={`p-4 rounded-3xl border flex flex-col justify-between transition-all duration-200 shadow-sm ${
              isDark
                ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]"
                : "bg-white border-[#e2ece5] text-[#142617]"
            }`}
          >
            <div className="flex items-start justify-between">
              <span
                className={`text-xs font-sans font-medium ${
                  isDark ? "text-[#9db3a1]" : "text-[#526956]"
                }`}
              >
                Total Spending
              </span>
              <div
                className={`p-1.5 rounded-xl ${
                  isDark
                    ? "bg-[#212c23] text-[#7ec792]"
                    : "bg-[#edf6f0] text-[#2e6d3f]"
                }`}
              >
                <ShoppingBag size={15} />
              </div>
            </div>

            <div className="my-2">
              <h3 className="text-3xl font-sans font-bold tracking-tight">
                {V14_KPI_CARDS.spending.value}
              </h3>
            </div>

            <div>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500">
                <ArrowDownRight size={12} className="stroke-[3]" />
                {V14_KPI_CARDS.spending.change}{" "}
                <span className="font-normal opacity-90 ml-1">
                  {V14_KPI_CARDS.spending.period}
                </span>
              </span>
            </div>
          </div>

          {/* Card 3: Total Income (Pure White Card) */}
          <div
            className={`p-4 rounded-3xl border flex flex-col justify-between transition-all duration-200 shadow-sm ${
              isDark
                ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]"
                : "bg-white border-[#e2ece5] text-[#142617]"
            }`}
          >
            <div className="flex items-start justify-between">
              <span
                className={`text-xs font-sans font-medium ${
                  isDark ? "text-[#9db3a1]" : "text-[#526956]"
                }`}
              >
                Total Income
              </span>
              <div
                className={`p-1.5 rounded-xl ${
                  isDark
                    ? "bg-[#212c23] text-[#7ec792]"
                    : "bg-[#edf6f0] text-[#2e6d3f]"
                }`}
              >
                <FileText size={15} />
              </div>
            </div>

            <div className="my-2">
              <h3 className="text-3xl font-sans font-bold tracking-tight">
                {V14_KPI_CARDS.income.value}
              </h3>
            </div>

            <div>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full bg-[#eaf5ed] text-[#2e6d3f]">
                <ArrowUpRight size={12} className="stroke-[3]" />
                {V14_KPI_CARDS.income.change}{" "}
                <span className="font-normal opacity-90 ml-1">
                  {V14_KPI_CARDS.income.period}
                </span>
              </span>
            </div>
          </div>

          {/* Card 4: Total Revenue (Pure White Card) */}
          <div
            className={`p-4 rounded-3xl border flex flex-col justify-between transition-all duration-200 shadow-sm ${
              isDark
                ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]"
                : "bg-white border-[#e2ece5] text-[#142617]"
            }`}
          >
            <div className="flex items-start justify-between">
              <span
                className={`text-xs font-sans font-medium ${
                  isDark ? "text-[#9db3a1]" : "text-[#526956]"
                }`}
              >
                Total Revenue
              </span>
              <div
                className={`p-1.5 rounded-xl ${
                  isDark
                    ? "bg-[#212c23] text-[#7ec792]"
                    : "bg-[#edf6f0] text-[#2e6d3f]"
                }`}
              >
                <DollarSign size={15} />
              </div>
            </div>

            <div className="my-2">
              <h3 className="text-3xl font-sans font-bold tracking-tight">
                {V14_KPI_CARDS.revenue.value}
              </h3>
            </div>

            <div>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full bg-[#eaf5ed] text-[#2e6d3f]">
                <ArrowUpRight size={12} className="stroke-[3]" />
                {V14_KPI_CARDS.revenue.change}{" "}
                <span className="font-normal opacity-90 ml-1">
                  {V14_KPI_CARDS.revenue.period}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Column 3: Total Income Chart Card (4 cols) */}
        <div
          className={`lg:col-span-4 p-6 rounded-3xl border flex flex-col justify-between transition-all duration-200 shadow-sm ${
            isDark
              ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]"
              : "bg-white border-[#e2ece5] text-[#142617]"
          }`}
        >
          {/* Header */}
          <div>
            <h3
              className={`font-sans font-bold text-base ${
                isDark ? "text-[#f2f7f3]" : "text-[#142617]"
              }`}
            >
              Total Income
            </h3>
            <p
              className={`text-xs mt-0.5 ${
                isDark ? "text-[#9db3a1]" : "text-[#526956]"
              }`}
            >
              View your income in a certain period of time
            </p>

            <div className="flex items-center justify-between mt-3 text-xs">
              <span
                className={`font-sans font-semibold ${
                  isDark ? "text-[#f2f7f3]" : "text-[#142617]"
                }`}
              >
                Profit and Loss
              </span>
              <div className="flex items-center gap-3 text-[11px] font-sans">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3e7b52]" />
                  <span className={isDark ? "text-[#9db3a1]" : "text-[#526956]"}>
                    Profit
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isDark ? "bg-[#2d4633]" : "bg-[#b2d9bc]"
                    }`}
                  />
                  <span className={isDark ? "text-[#9db3a1]" : "text-[#526956]"}>
                    Loss
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization with Smooth Framer Motion Grow */}
          <div className="my-4">
            <div className="flex items-end justify-between h-40 pt-4 px-1 gap-2">
              {/* Y-axis labels */}
              <div
                className={`flex flex-col justify-between h-full text-[10px] font-mono pr-2 ${
                  isDark ? "text-[#7f9183]" : "text-[#7b9180]"
                }`}
              >
                <span>50k</span>
                <span>40k</span>
                <span>30k</span>
                <span>20k</span>
                <span>10k</span>
                <span>00</span>
              </div>

              {/* 8 Monthly Dual-Color Bars in Light Green & Soft Mint (NO BLACK!) */}
              {V14_BAR_CHART_DATA.map((bar, idx) => {
                const isHovered = hoveredBar === idx;
                const totalHeight = ((bar.profit + bar.loss) / 55) * 100;
                const lossFraction = (bar.loss / (bar.profit + bar.loss)) * 100;
                const profitFraction = 100 - lossFraction;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                  >
                    {/* Floating Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-10 bg-[#2b5838] text-white text-[10px] font-sans font-medium px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap z-20">
                        Profit: ${bar.profit}k • Loss: ${bar.loss}k
                      </div>
                    )}

                    {/* Dual Stacked Rounded Bar with Smooth Height Animation */}
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{
                        duration: 0.55,
                        delay: idx * 0.04,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="w-full max-w-[20px] rounded-full overflow-hidden flex flex-col justify-end transition-transform duration-200 group-hover:scale-105 origin-bottom"
                      style={{ height: `${totalHeight}%` }}
                    >
                      {/* Top Part: Profit (Primary Light Green) */}
                      <div
                        className="w-full bg-[#3e7b52] rounded-t-full transition-colors"
                        style={{ height: `${profitFraction}%` }}
                      />
                      {/* Bottom Part: Loss (Light Mint Green - NO BLACK!) */}
                      <div
                        className={`w-full ${
                          isDark ? "bg-[#2d4633]" : "bg-[#b2d9bc]"
                        } rounded-b-full transition-colors`}
                        style={{ height: `${lossFraction}%` }}
                      />
                    </motion.div>

                    {/* Month Label */}
                    <span
                      className={`text-[10px] font-sans mt-2 transition-colors ${
                        isHovered
                          ? "text-[#3e7b52] font-bold"
                          : isDark
                          ? "text-[#7f9183]"
                          : "text-[#7b9180]"
                      }`}
                    >
                      {bar.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Monthly Spending Limit (4 cols) & Recent Activities Table (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Bottom Card: Monthly Spending Limit with Striped Hatch Pattern */}
        <div
          className={`lg:col-span-4 p-6 rounded-3xl border flex flex-col justify-between transition-all duration-200 shadow-sm ${
            isDark
              ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]"
              : "bg-white border-[#e2ece5] text-[#142617]"
          }`}
        >
          <div>
            <h3
              className={`font-sans font-bold text-base ${
                isDark ? "text-[#f2f7f3]" : "text-[#142617]"
              }`}
            >
              Monthly Spending Limit
            </h3>
            <p
              className={`text-xs mt-0.5 ${
                isDark ? "text-[#9db3a1]" : "text-[#526956]"
              }`}
            >
              Real-time expenditure against allocated atelier budget
            </p>
          </div>

          <div className="my-6">
            {/* The signature striped diagonal hatch progress bar in Light Green from video */}
            <div
              className={`w-full h-4 rounded-full overflow-hidden p-0.5 border ${
                isDark
                  ? "bg-[#141a15] border-[#253327]"
                  : "bg-[#edf6f0] border-[#cce3d2]"
              }`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "28%" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full"
                style={{
                  background:
                    "repeating-linear-gradient(-45deg, #3e7b52, #3e7b52 6px, #a8dcb5 6px, #a8dcb5 12px)",
                }}
              />
            </div>

            {/* Spent out of text */}
            <div className="flex items-center justify-between text-xs font-sans mt-3">
              <span className="font-medium">
                <strong
                  className={`font-bold text-sm ${
                    isDark ? "text-[#f2f7f3]" : "text-[#142617]"
                  }`}
                >
                  $1,210.39
                </strong>{" "}
                <span className={isDark ? "text-[#9db3a1]" : "text-[#526956]"}>
                  spent out of
                </span>
              </span>
              <span className="font-bold text-sm font-mono text-[#3e7b52] dark:text-[#7ec792]">
                $5,500.00
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-current/10 flex items-center justify-between text-[11px]">
            <span className={isDark ? "text-[#7f9183]" : "text-[#7b9180]"}>
              Resets in 7 days
            </span>
            <button
              onClick={() => showToast("Adjusting Monthly Spending Limit...")}
              className="text-[#3e7b52] dark:text-[#7ec792] hover:underline font-semibold"
            >
              Edit Limit
            </button>
          </div>
        </div>

        {/* Right Bottom Card: Recent Activities Table from Video (8 cols) */}
        <div
          className={`lg:col-span-8 p-6 rounded-3xl border transition-all duration-200 shadow-sm ${
            isDark
              ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]"
              : "bg-white border-[#e2ece5] text-[#142617]"
          }`}
        >
          {/* Header with Search and Filter button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3
              className={`font-sans font-bold text-base ${
                isDark ? "text-[#f2f7f3]" : "text-[#142617]"
              }`}
            >
              Recent Activities
            </h3>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search
                  size={14}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isDark ? "text-[#7f9183]" : "text-[#7b9180]"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchActivity}
                  onChange={(e) => setSearchActivity(e.target.value)}
                  className={`pl-8 pr-3 py-1.5 text-xs rounded-full border font-sans focus:outline-none transition-colors ${
                    isDark
                      ? "bg-[#141a15] border-[#253327] text-[#f2f7f3] focus:border-[#4a8b5e]"
                      : "bg-[#f5f9f6] border-[#d8e6dc] text-[#142617] focus:border-[#3e7b52]"
                  }`}
                />
              </div>

              <button
                onClick={() => showToast("Filter toggled.")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-sans font-medium transition-colors ${
                  isDark
                    ? "bg-[#141a15] border-[#253327] text-[#9db3a1] hover:bg-[#212c23] hover:text-white"
                    : "bg-[#edf6f0] border-[#cce3d2] text-[#285735] hover:bg-[#e2f0e6]"
                }`}
              >
                <span>Filter</span>
                <Filter size={12} />
              </button>
            </div>
          </div>

          {/* Table from Video */}
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr
                  className={`border-b text-[11px] font-sans font-semibold uppercase ${
                    isDark
                      ? "border-[#293a2c] text-[#9db3a1]"
                      : "border-[#e2ece5] text-[#526956]"
                  }`}
                >
                  <th className="py-2.5 px-3 w-8">
                    <input type="checkbox" className="rounded accent-[#3e7b52]" />
                  </th>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Activity</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right"></th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? "divide-[#212c23]" : "divide-[#edf4ee]"
                }`}
              >
                {filteredActivities.map((act) => (
                  <tr
                    key={act.id}
                    className={`transition-colors cursor-pointer ${
                      isDark ? "hover:bg-[#1f2921]" : "hover:bg-[#f7faf8]"
                    }`}
                  >
                    <td className="py-3 px-3">
                      <input type="checkbox" className="rounded accent-[#3e7b52]" />
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-[#2f6f43] dark:text-[#7ec792]">
                      {act.id}
                    </td>
                    <td className="py-3 px-3 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${act.iconColor}`} />
                      <span
                        className={`font-semibold ${
                          isDark ? "text-[#f2f7f3]" : "text-[#142617]"
                        }`}
                      >
                        {act.activity}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-3 font-mono font-bold ${
                        isDark ? "text-[#f2f7f3]" : "text-[#142617]"
                      }`}
                    >
                      {act.price}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          act.status === "Completed"
                            ? "bg-[#eaf5ed] text-[#285735]"
                            : "bg-amber-500/15 text-amber-600"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {act.status}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-3 text-[11px] ${
                        isDark ? "text-[#9db3a1]" : "text-[#526956]"
                      }`}
                    >
                      {act.date}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button className="p-1 rounded hover:bg-current/10">
                        <MoreVertical size={13} className="opacity-50" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
