import React, { useState } from "react";
import { computeROI } from "../../packages/core/calc_engine/roi";
import { supabase } from "../lib/supabaseClient";

export default function ROIWorksheet() {
  const [initial, setInitial] = useState("");
  const [monthly, setMonthly] = useState("");
  const [months, setMonths] = useState("");
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleCalculate() {
    const roi = computeROI({
      initialInvestment: Number(initial),
      monthlyGain: Number(monthly),
      months: Number(months),
    });
    setResult(roi);

    setSaving(true);
    try {
      const { error } = await supabase.from("worksheets").insert([
        {
          user_id: "demo-user",
          type: "roi",
          inputs: { initial, monthly, months },
          outputs: roi,
        },
      ]);
      if (error) console.error("Supabase insert error:", error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">ROI Worksheet</h2>
      <div className="grid gap-2 mb-4">
        <input
          className="border p-2 rounded"
          placeholder="Initial Investment"
          value={initial}
          onChange={(e) => setInitial(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Monthly Gain"
          value={monthly}
          onChange={(e) => setMonthly(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Months"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
        />
      </div>
      <button
        onClick={handleCalculate}
        disabled={saving}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {saving ? "Saving..." : "Calculate ROI"}
      </button>
      {result && (
        <div className="mt-4 border p-2 rounded bg-gray-50">
          <div>Final Value: {result.finalValue}</div>
          <div>ROI %: {result.roiPercent}</div>
        </div>
      )}
    </div>
  );
}
