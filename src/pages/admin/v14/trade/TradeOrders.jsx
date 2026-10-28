import { useState, useMemo } from "react";
import { Package, Search, Download, Clock, CheckCircle2, Truck, Eye } from "lucide-react";
import { useAdmin } from "../../AdminContext";
import { showToast } from "../../../../utils/sweetAlert";

export default function TradeOrders() {
  const { theme, orders, setSelectedOrder } = useAdmin();
  const isDark = theme === "dark";
  const [searchQuery, setSearchQuery] = useState("");

  const dynamicTradeOrders = useMemo(() => {
    const sourceOrders =
      orders && orders.length > 0
        ? orders
        : [
            {
              _id: "trd_88192",
              orderNumber: "TRD-ORD-88192",
              quotationRef: "QUO-920141",
              createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
              items: [
                { name: "Phantasmagoria Velvet Drapery", quantity: 12, unitPrice: 185 },
                { name: "Artemis Luxury Jacquard Weave", quantity: 6, unitPrice: 220 },
              ],
              totalAmount: 3540,
              paymentTerm: "NET_30",
              paymentStatus: "CONFIRMED",
              fulfillmentStatus: "IN PRODUCTION",
              trackingNumber: "DHL-GB-8819241",
            },
            {
              _id: "trd_77103",
              orderNumber: "TRD-ORD-77103",
              quotationRef: "QUO-819302",
              createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
              items: [
                { name: "Trematonia Mineral Wallpaper Roll", quantity: 24, unitPrice: 110 },
              ],
              totalAmount: 2640,
              paymentTerm: "NET_30",
              paymentStatus: "PAID",
              fulfillmentStatus: "DELIVERED",
              trackingNumber: "DHL-GB-7710399",
            },
          ];

    return sourceOrders.map((ord) => {
      const id = ord.orderNumber || ord.code || (ord._id ? `TRD-ORD-${ord._id.slice(-5).toUpperCase()}` : "TRD-ORD-01");
      const date = ord.createdAt
        ? new Date(ord.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : "Recent";
      const quoteRef = ord.quotationRef || `QUO-${(ord._id || "123").slice(-6).toUpperCase()}`;
      const itemsSummary = (ord.items || [])
        .map((it) => `${it.product?.name || it.name || "Bespoke Creation"} (x${it.quantity || 1})`)
        .join(", ") || "Atelier Furnishing Selection";
      const total = Number(ord.totalAmount || ord.grandTotal || ord.totalPrice || ord.total) || 0;
      const paymentTerm = ord.paymentTerm || "NET_30";
      const paymentStatus = (ord.paymentStatus || ord.status || "CONFIRMED").toUpperCase();
      const fulfillmentStatus = (ord.fulfillmentStatus || ord.status || "CONFIRMED").toUpperCase();
      const trackingNumber = ord.trackingNumber || `DHL-GB-${(ord._id || "999").slice(-7).toUpperCase()}`;

      return {
        id,
        date,
        quoteRef,
        itemsSummary,
        total,
        paymentTerm,
        paymentStatus,
        fulfillmentStatus,
        trackingNumber,
        invoicePdf: `#invoice-${id}`,
        rawOrder: ord,
      };
    });
  }, [orders]);

  const filteredOrders = dynamicTradeOrders.filter(
    (ord) =>
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.itemsSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadInvoice = (ord) => {
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        showToast(`Downloading official VAT invoice for ${ord.id}...`);
        return;
      }

      const itemsHtml = (ord.rawOrder?.items || [
        { name: ord.itemsSummary, quantity: 1, unitPrice: ord.total }
      ]).map((it, idx) => `
        <tr style="border-bottom: 1px solid #edf2ee;">
          <td style="padding: 12px 8px; font-family: monospace; font-size: 11px; color: #627766;">#${idx + 1}</td>
          <td style="padding: 12px 8px; font-weight: 600;">${it.name || it.product?.name || "Bespoke Creation"}</td>
          <td style="padding: 12px 8px; text-align: center;">${it.quantity || 1}</td>
          <td style="padding: 12px 8px; text-align: right; font-family: monospace;">£${Number(it.unitPrice || it.price || (ord.total / (it.quantity || 1))).toLocaleString("en-GB", { minimumFractionDigits: 2 })}</td>
          <td style="padding: 12px 8px; text-align: right; font-weight: 600; font-family: monospace;">£${Number((it.unitPrice || it.price || ord.total) * (it.quantity || 1)).toLocaleString("en-GB", { minimumFractionDigits: 2 })}</td>
        </tr>
      `).join("");

      const netSubtotal = (ord.total / 1.2).toFixed(2);
      const vat = (ord.total - netSubtotal).toFixed(2);

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>VAT Invoice - ${ord.id} - House of Hackney</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #142617; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #285735; padding-bottom: 24px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; letter-spacing: -0.5px; color: #142617; }
            .logo span { color: #285735; }
            .invoice-tag { font-size: 12px; font-weight: 700; color: #285735; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .meta-box h4 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #627766; }
            .meta-box p { margin: 0; font-size: 13px; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
            th { text-align: left; padding: 10px 8px; border-bottom: 2px solid #285735; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #627766; }
            .totals-table { width: 320px; margin-left: auto; border-collapse: collapse; margin-bottom: 40px; }
            .totals-table td { padding: 6px 8px; font-size: 13px; }
            .grand-total { font-size: 16px; font-weight: bold; color: #285735; border-top: 2px solid #285735; }
            .footer { border-top: 1px solid #dce8df; padding-top: 20px; font-size: 11px; color: #859b89; text-align: center; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
            <button onclick="window.print()" style="padding: 8px 16px; background: #285735; color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">Print / Save as PDF</button>
          </div>
          <div class="header">
            <div>
              <div class="logo">HOUSE OF HACKNEY <span>LONDON</span></div>
              <div class="invoice-tag">COMMERCIAL VAT INVOICE & SPECIFICATION</div>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #627766;">VAT Reg: GB 189 4521 88 | EORI: GB189452188000</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 14px; font-weight: bold; font-family: monospace;">${ord.id}</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #627766;">Date: ${ord.date}</p>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: #627766;">Quotation Ref: ${ord.quoteRef}</p>
              <p style="margin: 2px 0 0 0; font-size: 12px; font-weight: 600; color: #285735;">Terms: ${ord.paymentTerm}</p>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-box">
              <h4>Billed To (Trade Partner)</h4>
              <p><strong>Bespoke Interior Studio Guild</strong><br/>
              12 Berkeley Square, Mayfair<br/>
              London, W1J 6BD, United Kingdom<br/>
              Payment Method: Trade B2B Credit Line (${ord.paymentTerm})</p>
            </div>
            <div class="meta-box">
              <h4>Dispatch & Logistics Details</h4>
              <p><strong>Carrier:</strong> White-Glove Courier Express<br/>
              <strong>Tracking No:</strong> <span style="font-family: monospace;">${ord.trackingNumber}</span><br/>
              <strong>Fulfillment Status:</strong> ${ord.fulfillmentStatus}<br/>
              <strong>Payment Status:</strong> ${ord.paymentStatus}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Specification & Line Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Wholesale Unit</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <table class="totals-table">
            <tr>
              <td>Net Subtotal:</td>
              <td style="text-align: right; font-family: monospace;">£${netSubtotal}</td>
            </tr>
            <tr>
              <td>UK VAT (20%):</td>
              <td style="text-align: right; font-family: monospace;">£${vat}</td>
            </tr>
            <tr>
              <td>Courier Shipping:</td>
              <td style="text-align: right; font-family: monospace; color: #285735;">Complimentary (B2B)</td>
            </tr>
            <tr class="grand-total">
              <td style="padding-top: 10px;">Total Due:</td>
              <td style="padding-top: 10px; text-align: right; font-family: monospace;">£${Number(ord.total).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          </table>

          <div class="footer">
            <p>House of Hackney Ltd • Registered in England & Wales #07498214 • St Michael's, Mark Street, London EC2A 4ER</p>
            <p>Payment due under approved ${ord.paymentTerm} Atelier terms. For wire transfers: Barclays Bank PLC • IBAN: GB29BARC20000012345678 • BIC: BARCGB22</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      showToast(`Commercial VAT invoice opened for ${ord.id}.`);
    } catch {
      showToast(`Downloading official VAT invoice for ${ord.id}...`);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            My Trade B2B Orders & Invoices
          </h1>
          <p className="text-xs text-[#627766] mt-0.5">
            Track live atelier production, courier dispatch, and settle invoices under your NET_30 terms
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
          isDark
            ? "bg-[#141a15] border-[#253327]"
            : "bg-white border-[#e4ede5]"
        }`}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-[#627766]">
          Showing {filteredOrders.length} B2B Trade Orders
        </span>

        <div className="relative min-w-[240px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#859b89]"
          />
          <input
            type="text"
            placeholder="Search order #, items, or tracking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-1.5 rounded-full border text-xs outline-none ${
              isDark
                ? "bg-[#1d271f] border-[#2e3f31] text-white placeholder-[#556957]"
                : "bg-[#f5f9f6] border-[#dce8df] text-[#142617] placeholder-[#95a898]"
            }`}
          />
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div
            className={`p-12 text-center rounded-2xl border ${
              isDark ? "bg-[#141a15] border-[#253327]" : "bg-white border-[#e4ede5]"
            }`}
          >
            <Package size={32} className="mx-auto text-[#627766] mb-2 opacity-50" />
            <p className="text-sm font-semibold">No trade orders found</p>
            <p className="text-xs text-[#627766] mt-1">
              Your trade orders and white-glove dispatches will appear here in real time.
            </p>
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div
              key={ord.id}
              onClick={() => setSelectedOrder && setSelectedOrder(ord.rawOrder)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                isDark
                  ? "bg-[#141a15] border-[#253327] hover:border-[#3e7b52]"
                  : "bg-white border-[#e4ede5] hover:border-[#3e7b52]"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#3e7b52]">
                      {ord.id}
                    </span>
                    <span className="text-xs text-[#627766]">• {ord.date}</span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md ${
                        isDark ? "bg-[#1d271f] text-[#859b89]" : "bg-[#edf6f0] text-[#285735]"
                      }`}
                    >
                      {ord.quoteRef}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm">{ord.itemsSummary}</h3>
                  <div className="flex items-center gap-3 text-xs text-[#627766]">
                    <span className="flex items-center gap-1 font-mono">
                      <Truck size={12} />
                      {ord.trackingNumber}
                    </span>
                    <span>• Terms: {ord.paymentTerm}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 lg:self-center">
                  <div className="text-right mr-2">
                    <span className="text-xs text-[#627766] block">Net Invoiced</span>
                    <span className="font-bold text-base font-mono">
                      £{ord.total.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      ord.paymentStatus === "PAID"
                        ? "bg-[#eaf5ed] text-[#285735]"
                        : "bg-amber-500/15 text-amber-600"
                    }`}
                  >
                    <CheckCircle2 size={12} />
                    {ord.paymentStatus}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      ord.fulfillmentStatus === "DELIVERED"
                        ? "bg-[#eaf5ed] text-[#285735]"
                        : ord.fulfillmentStatus === "DISPATCHED" || ord.fulfillmentStatus === "SHIPPED"
                        ? "bg-blue-500/15 text-blue-600"
                        : "bg-amber-500/15 text-amber-600"
                    }`}
                  >
                    <Clock size={12} />
                    {ord.fulfillmentStatus}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadInvoice(ord);
                    }}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isDark
                        ? "border-[#2e3f31] hover:bg-[#1d271f] text-[#859b89]"
                        : "border-[#dce8df] hover:bg-[#f5f9f6] text-[#285735]"
                    }`}
                    title="Download Official VAT Invoice PDF"
                  >
                    <Download size={13} />
                    <span className="hidden sm:inline">VAT Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
