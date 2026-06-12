import React from "react";

export default function HistoryTable({ history }) {
  const getConditionColor = (cond) => {
    const c = (cond || "").toLowerCase();
    if (c === "good") return { bg: "#dcfce7", text: "#15803d" };
    return { bg: "#ffe4e6", text: "#b91c1c" };
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <table className="w-full border-collapse bg-white text-sm text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-600 w-12 text-center">No</th>
            <th className="px-4 py-3 font-semibold text-slate-600 min-w-[120px]">Container</th>
            <th className="px-4 py-3 font-semibold text-slate-600 min-w-[150px]">Kapal</th>
            <th className="px-4 py-3 font-semibold text-slate-600 text-center">Kondisi</th>
            <th className="px-4 py-3 font-semibold text-slate-600 min-w-[150px]">Sisi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {history.slice(0, 5).map((item, index) => {
             const condColor = getConditionColor(item.condition);
             return (
              <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 text-slate-500 text-center">{index + 1}</td>
                <td className="px-4 py-3 font-bold text-blue-600">{item.container}</td>
                <td className="px-4 py-3 text-slate-700">{item.shipName || "-"}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: condColor.bg, color: condColor.text }}>
                    {item.condition}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{item.side || "General"}</td>
              </tr>
            );
          })}
          {history.length === 0 && (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-slate-400 italic">
                Belum ada riwayat transaksi inspeksi.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
