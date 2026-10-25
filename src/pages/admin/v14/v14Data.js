// Authentic dataset for Dashboard V14 replicating the video reference

export const V14_WALLETS = [
  {
    currency: "USD",
    flag: "🇺🇸",
    balance: "$19,230.51",
    limit: "Limit is $10k a month",
    status: "Active",
    isActive: true,
  },
  {
    currency: "EUR",
    flag: "🇪🇺",
    balance: "€14,160.54",
    limit: "Limit is €8k a month",
    status: "Active",
    isActive: true,
  },
  {
    currency: "GBP",
    flag: "🇬🇧",
    balance: "£10,054.67",
    limit: "Limit is £7.5k a month",
    status: "Inactive",
    isActive: false,
  },
];

export const V14_KPI_CARDS = {
  earnings: {
    title: "Total Earnings",
    value: "$849",
    change: "+7%",
    period: "This month",
    isPositive: true,
  },
  spending: {
    title: "Total Spending",
    value: "$586",
    change: "-5%",
    period: "This month",
    isPositive: false,
  },
  income: {
    title: "Total Income",
    value: "$799",
    change: "+8%",
    period: "This month",
    isPositive: true,
  },
  revenue: {
    title: "Total Revenue",
    value: "$561",
    change: "+4%",
    period: "This month",
    isPositive: true,
  },
};

export const V14_BAR_CHART_DATA = [
  { month: "Jan", profit: 30, loss: 16, total: "30k" },
  { month: "Feb", profit: 36, loss: 14, total: "36k" },
  { month: "Mar", profit: 24, loss: 18, total: "24k" },
  { month: "Apr", profit: 28, loss: 12, total: "28k" },
  { month: "May", profit: 25, loss: 17, total: "25k" },
  { month: "Jun", profit: 16, loss: 24, total: "16k" },
  { month: "Jul", profit: 15, loss: 10, total: "15k" },
  { month: "Aug", profit: 11, loss: 8, total: "11k" },
];

export const V14_ACTIVITIES = [
  {
    id: "INV_000076",
    activity: "Mobile App Purchase",
    category: "Software License",
    price: "$25,500",
    status: "Completed",
    date: "17 Apr, 2026 03:45 PM",
    iconColor: "bg-blue-500",
  },
  {
    id: "INV_000075",
    activity: "Artemis Velvet Fabric Order",
    category: "Bespoke Furnishing",
    price: "$4,140",
    status: "Completed",
    date: "17 Apr, 2026 01:20 PM",
    iconColor: "bg-amber-500",
  },
  {
    id: "INV_000074",
    activity: "Cloud Server Hosting Renewal",
    category: "Infrastructure",
    price: "$1,850",
    status: "Pending",
    date: "16 Apr, 2026 11:15 AM",
    iconColor: "bg-purple-500",
  },
  {
    id: "INV_000073",
    activity: "Babylon Wallpaper Rolls (18x)",
    category: "Trade Account",
    price: "$3,330",
    status: "Completed",
    date: "15 Apr, 2026 04:10 PM",
    iconColor: "bg-emerald-500",
  },
  {
    id: "INV_000072",
    activity: "Design Studio Consultation",
    category: "Bespoke Services",
    price: "$850",
    status: "Completed",
    date: "14 Apr, 2026 10:00 AM",
    iconColor: "bg-rose-500",
  },
];

export const V14_POINTS_HISTORY = [
  {
    id: "PTS-01",
    title: "Flight Ticket Booking",
    date: "15 Apr",
    points: "+1,206",
    isPositive: true,
  },
  {
    id: "PTS-02",
    title: "Grocery Purchase",
    date: "14 Apr",
    points: "+1,004",
    isPositive: true,
  },
  {
    id: "PTS-03",
    title: "Redeemed — Lounge pass",
    date: "11 Apr",
    points: "-2,500",
    isPositive: false,
  },
  {
    id: "PTS-04",
    title: "Software License",
    date: "10 Apr",
    points: "+477",
    isPositive: true,
  },
  {
    id: "PTS-05",
    title: "Artemis Silk Cushion",
    date: "08 Apr",
    points: "+840",
    isPositive: true,
  },
];
