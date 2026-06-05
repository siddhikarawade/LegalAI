import { useState } from "react";
import { addHearing, updateHearingOutcome } from "../services/hearingService";

export default function AddHearingForm({
  caseId,
  onAdded,
  user,
  caseStatus
}: {
  caseId: string;
  onAdded: () => void;
  user: any;
  caseStatus?: string;
}) {

  const [date, setDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [stage, setStage] = useState("");
  const [outcome, setOutcome] = useState("PENDING");
  const [loading, setLoading] = useState(false);

  // 🔒 BLOCK ACCESS
  if (!user || user.role !== "JUDGE" || caseStatus === "DISPOSED") {
    return null;
  }

  const purposes = [
    "ADMISSION",
    "EVIDENCE",
    "CROSS EXAMINATION",
    "ARGUMENT",
    "ORDER",
    "JUDGMENT",
  ];

  const isValid = date && purpose && stage;

  const submit = async () => {

    if (!isValid) {
      alert("Please fill all required fields");
      return;
    }

    // ❗ prevent past date
    if (new Date(date) < new Date(new Date().toDateString())) {
      alert("Hearing date cannot be in the past");
      return;
    }

    // ❗ prevent after disposal
    if (caseStatus === "DISPOSED") {
      alert("Case is disposed. Cannot add hearing.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Create hearing
      const hearing = await addHearing(
        caseId,
        date,
        purpose,
        stage,
        user.id
      );

      // 2️⃣ Optional outcome update
      if (outcome !== "PENDING") {
        await updateHearingOutcome(hearing.id, outcome);
      }

      // reset form
      setDate("");
      setPurpose("");
      setStage("");
      setOutcome("PENDING");

      onAdded();

    } catch (err) {
      console.error("Hearing error:", err);
      alert("Error adding hearing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

      {/* HEADER */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Schedule Hearing
        </h3>
        <p className="text-sm text-gray-500">
          Add hearing details and optionally set outcome
        </p>
      </div>

      {/* FORM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* DATE */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Hearing Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          />
        </div>

        {/* STAGE */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Stage
          </label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          >
            <option value="">Select Stage</option>
            <option value="ADMISSION">Admission</option>
            <option value="EVIDENCE">Evidence</option>
            <option value="ARGUMENT">Argument</option>
            <option value="JUDGMENT">Judgment</option>
          </select>
        </div>

        {/* PURPOSE */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Purpose
          </label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          >
            <option value="">Select Purpose</option>
            {purposes.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

      </div>

      {/* OUTCOME SECTION */}
      <div className="mt-4">
        <label className="text-xs text-gray-500 block mb-1">
          Optional: Set Outcome Immediately
        </label>

        <select
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full"
        >
          <option value="PENDING">Pending</option>
          <option value="ADJOURNED">Adjourned</option>
          <option value="RESOLVED">Resolved (Dispose Case)</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* ACTION BUTTON */}
      <div className="mt-5 flex justify-end">

        <button
          onClick={submit}
          disabled={!isValid || loading}
          className={`px-5 py-2 rounded-lg text-white font-semibold transition ${
            isValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {loading ? "Saving..." : "Save Hearing"}
        </button>

      </div>

    </div>
  );
}