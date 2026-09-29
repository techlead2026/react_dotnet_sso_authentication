// src/components/AddBillForm.tsx
import React, { useState } from "react";

interface AddBillFormProps {
  onAddBill: (
    name: string,
    amount: number,
    dueDate: string,
    category: string,
  ) => void;
}

export default function AddBillForm({ onAddBill }: AddBillFormProps) {
  // 1. LOCAL STRING MEMORY BUFFERS FOR STATE TRACKING
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("Utilities");

  // 2. TRANSACTION EVENT HANDLER
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevents traditional browser page-reloading behavior

    // Basic data protection guarding against incomplete payloads
    if (!name || !amount || !dueDate) return;

    // Bubbles the validated raw data payload up to the parent orchestrator delegate
    onAddBill(name, parseFloat(amount), dueDate, category);

    // Flushes local state buffers clean to clear out the visual inputs for the next entry
    setName("");
    setAmount("");
    setDueDate("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginBottom: "24px",
        padding: "16px",
        border: "1px dashed #ccc",
        borderRadius: "6px",
        background: "#fafafa",
      }}
    >
      <h4>Log New Budget Obligation</h4>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        <input
          type="text"
          placeholder="Bill Description (e.g. Electric)"
          value={name}
          onChange={(e) => setName(e.target.value)} // CONTROLLED INPUT STATE BINDING
          style={{ padding: "8px", flex: "1 1 200px" }}
        />
        <input
          type="number"
          placeholder="Amount (€)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ padding: "8px", width: "100px" }}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{ padding: "8px" }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: "8px" }}
        >
          <option value="Utilities">Utilities</option>
          <option value="Housing">Housing</option>
          <option value="Entertainment">Entertainment</option>
        </select>
        <button
          type="submit"
          style={{
            padding: "8px 16px",
            background: "#2e7d32",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Append Transaction
        </button>
      </div>
    </form>
  );
}
