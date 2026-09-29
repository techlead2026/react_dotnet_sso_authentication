// src/components/Dashboard.tsx
import { useState, useEffect } from "react";
import type { BillItem } from "./types";
import AddBillForm from "./AddBillForm";

export default function Dashboard() {
  // 1. STATE BOUNDARIES FOR DATA AND SYSTEM LIFECYCLES
  const [bills, setBills] = useState<BillItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const API_BASE_URL = "http://localhost:5000/api/bills";

  // 2. NETWORK HANDLER: INITIAL DATA ASYNC FETCH (Equivalent to Page_Load Async)
  const fetchObligationsDataset = async () => {
    try {
      setIsLoading(true);
      setNetworkError(null);

      const response = await fetch(API_BASE_URL);

      if (!response.ok) {
        throw new Error(
          `Server returned HTTP Error Status: ${response.status}`,
        );
      }

      const jsonPayload = await response.json();

      // Senior JSON Mapping Note: C# records default properties to PascalCase (IsPaid, DueDate).
      // We explicitly normalize them to camelCase here to enforce client contract alignment.
      const normalizedData: BillItem[] = jsonPayload.map((b: any) => ({
        id: b.id,
        name: b.name,
        amount: b.amount,
        dueDate: b.dueDate,
        isPaid: b.isPaid,
        category: b.category,
      }));

      setBills(normalizedData);
    } catch (error: any) {
      setNetworkError(
        error.message || "Fatal connection failure tracking outbound API.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Triggers automatically exactly ONCE when the React component engine initializes into the browser
  useEffect(() => {
    fetchObligationsDataset();
  }, []);

  // 3. NETWORK HANDLER: POST NEW TRANSACTION OBLIGATION
  const handleAddBill = async (
    name: string,
    amount: number,
    dueDate: string,
    category: string,
  ) => {
    try {
      const payloadDto = { name, amount, dueDate, category };

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadDto),
      });

      if (!response.ok)
        throw new Error(
          "Failed to post new target obligation to server database.",
        );

      // Refresh local model cache state by re-querying the verified data source
      await fetchObligationsDataset();
    } catch (error: any) {
      alert(error.message);
    }
  };

  // 4. NETWORK HANDLER: PATCH TOGGLE STATE MUTATION
  const handleTogglePaidStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/toggle`, {
        method: "PATCH",
      });

      if (!response.ok)
        throw new Error("Server rejected mutation state modification request.");

      // Optimistic UI updates can be used here, but for absolute consistency, we re-query database reality
      await fetchObligationsDataset();
    } catch (error: any) {
      alert(error.message);
    }
  };

  // 5. COMPUTED METRICS LAYER (Dynamically computed on the live API state layer cache)
  const totalOwed = bills.reduce((sum, item) => sum + item.amount, 0);
  const totalPaid = bills
    .filter((item) => item.isPaid)
    .reduce((sum, item) => sum + item.amount, 0);
  const remainingCashObligation = totalOwed - totalPaid;

  // 6. DECLARATIVE UI STATUS RENDERING CONDITIONAL BLOCKS
  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <strong>Loading live ledger context blocks across port 5000...</strong>
      </div>
    );
  }

  if (networkError) {
    return (
      <div
        style={{
          padding: "20px",
          border: "2px solid #d32f2f",
          background: "#ffebee",
          borderRadius: "6px",
          color: "#d32f2f",
        }}
      >
        <h4>Network Integration Error Boundary Triggered</h4>
        <p>{networkError}</p>
        <button
          onClick={fetchObligationsDataset}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          Retry Pipeline Connection
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "24px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      <h2>Subscription & Runway Orchestrator Core</h2>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "24px",
          background: "#f0f4f8",
          padding: "16px",
          borderRadius: "6px",
        }}
      >
        <div>
          <strong>Total Tracked Obligations:</strong> €{totalOwed}
        </div>
        <div>
          <strong>Total Cleared/Paid:</strong> €{totalPaid}
        </div>
        <div
          style={{ color: remainingCashObligation > 0 ? "#d32f2f" : "#2e7d32" }}
        >
          <strong>Remaining Cash Runway Drain:</strong> €
          {remainingCashObligation}
        </div>
      </div>

      <AddBillForm onAddBill={handleAddBill} />

      <h3>Active Ledger Transactions (Fetched Live From C#)</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {bills.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            No active balance metrics records located on host memory bank
            server.
          </p>
        ) : (
          bills.map((bill) => (
            <div
              key={bill.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
                backgroundColor: bill.isPaid ? "#e8f5e9" : "#ffffff",
              }}
            >
              <div>
                <strong>{bill.name}</strong>{" "}
                <span style={{ fontSize: "0.85em", color: "#666" }}>
                  ({bill.category})
                </span>
                <br />
                <span style={{ fontSize: "0.9em" }}>
                  Amount: €{bill.amount} | Due: {bill.dueDate}
                </span>
              </div>

              <button
                onClick={() => handleTogglePaidStatus(bill.id)}
                style={{
                  padding: "8px 12px",
                  backgroundColor: bill.isPaid ? "#2e7d32" : "#1976d2",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {bill.isPaid ? "Mark Unpaid" : "Mark As Paid"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
