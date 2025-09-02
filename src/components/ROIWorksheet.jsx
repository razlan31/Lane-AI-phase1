import { useState } from "react";
import { computeROI } from "../utils/roi";

export default function ROIWorksheet() {
  const [initial, setInitial] = useState("1000");
  const [monthly, setMonthly] = useState("200");
  const [months, setMonths] = useState("12");
  const [roi, setRoi] = useState(null);
  const [status, setStatus] = useState("");

  const handleCompute = () => {
    const initVal = parseFloat(initial) || 0;
    const monthlyVal = parseFloat(monthly) || 0;
    const monthsVal = parseInt(months) || 0;

    const result = computeROI(initVal, monthlyVal, monthsVal);
    setRoi(result);
    setStatus("Computed successfully via src/utils/roi.js");
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-semibold mb-4">ROI Worksheet</h2>

      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium">Initial Investment</span>
          <input
            type="number"
            value={initial}
            onChange={(e) => setInitial(e.target.value)}
            className="border rounded p-2 w-full"
            placeholder="e.g. 1000"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Monthly Contribution</span>
          <input
            type="number"
            value={monthly}
            onChange={(e) => setMonthly(e.target.value)}
            className="border rounded p-2 w-full"
            placeholder="e.g. 200"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Months</span>
          <input
            type="number"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            className="border rounded p-2 w-full"
            placeholder="e.g. 12"
          />
        </label>

        <button
          onClick={handleCompute}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Compute ROI
        </button>
      </div>

      {roi !== null && (
        <p className="mt-4">
          ROI: <span className="font-semibold">{roi.toFixed(2)}%</span>
        </p>
      )}

      {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
    </div>
  );
}
