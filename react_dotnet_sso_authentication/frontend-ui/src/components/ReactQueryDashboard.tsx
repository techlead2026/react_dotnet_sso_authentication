// src/components/ReactQueryDashboard.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMsal } from "@azure/msal-react";
import type { BillItem } from "./types";
import AddBillForm from "./AddBillForm";

const API_BASE_URL = "http://localhost:5000/api/bills";

export default function ReactQueryDashboard() {
  const queryClient = useQueryClient();
  const { instance, accounts, inProgress } = useMsal();

  const sessionRaw = localStorage.getItem("current_session");
  const activeUserSession = sessionRaw ? JSON.parse(sessionRaw) : null;

  // --- AUTOMATED BEARER TOKEN RESOLUTION WORKER HELPER ---

  const fetchWithToken = async (url: string, options: RequestInit = {}) => {
    // 1. Retrieve our dynamic session payload object
    const sessionData = localStorage.getItem("current_session");

    if (!sessionData) {
      throw new Error("No active identity session detected.");
    }

    // 2. Parse the session metadata to grab the dynamic token value
    const { token } = JSON.parse(sessionData);

    const headersMap: Record<string, string> = {
      Authorization: `Bearer ${token}`, // Natively works for either token type!
    };

    if (options.body) {
      headersMap["Content-Type"] = "application/json";
    }

    const finalHeaders = {
      ...headersMap,
      ...(options.headers as Record<string, string>),
    };

    return fetch(url, { ...options, headers: finalHeaders });
  };

  // PLACE THE LOGOUT FUNCTION HERE (Inside the component body)
  const handleAbsoluteLogout = async () => {
    const sessionData = localStorage.getItem("current_session");
    const parsed = sessionData ? JSON.parse(sessionData) : null;

    // Clear our unique application storage session first
    localStorage.removeItem("current_session");

    if (parsed?.authType === "Microsoft") {
      // If it was a corporate account, also notify Entra to drop its active cookies
      // FIXED: Pass the exact target context profile to bypass the "Pick an account" grid screen
      const activeAccount = instance.getActiveAccount() || accounts[0];
      instance.logoutRedirect({
        account: activeAccount,
        postLogoutRedirectUri: window.location.origin,
      });
    } else {
      // For Google or other standalone clients, a quick reload resets the view instantly
      window.location.reload();
    }
  };

  // --- EXACT DATA CACHE STORAGE & RETRIEVAL ---
  const {
    data: bills = [],
    isLoading,
    error,
  } = useQuery<BillItem[]>({
    // 1. THE STATIC DATA KEY: Stored in React Query's memory under this unique name.
    // It is 100% unique to the app, not user-specific or login-specific.
    queryKey: ["billsLedger"],

    // 2. THE RETRIEVAL FUNCTION: Runs the network request to fetch your data payload
    queryFn: async (): Promise<BillItem[]> => {
      const response = await fetchWithToken(API_BASE_URL);
      if (!response.ok) {
        throw new Error(
          "API server boundary rejected token signature parameters.",
        );
      }
      return response.json();
    },

    // 3. THE FIXED FIX: Simply delete "accounts.length > 0".
    // The cache query runs immediately when the component mounts, regardless of the login provider!
    enabled: inProgress === "none",
  });

  // --- MUTATION ACTIONS REWIRED WITH SIGNED TOKENS ---
  const addBillMutation = useMutation({
    mutationFn: async (newBill: {
      name: string;
      amount: number;
      dueDate: string;
      category: string;
    }) => {
      const response = await fetchWithToken(API_BASE_URL, {
        method: "POST",
        body: JSON.stringify(newBill),
      });
      if (!response.ok) {
        throw new Error(
          "Post authorization rejected by security gateway layer.",
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billsLedger"] });
    },
  });

  const togglePaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchWithToken(`${API_BASE_URL}/${id}/toggle`, {
        method: "PATCH",
      });
      if (!response.ok) {
        throw new Error("State adjustment request rejected by Entra gates.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billsLedger"] });
    },
  });

  // COMPUTED ANALYTICAL METRICS LAYER
  const totalOwed = bills.reduce((sum, item) => sum + item.amount, 0);
  const totalPaid = bills
    .filter((item) => item.isPaid)
    .reduce((sum, item) => sum + item.amount, 0);
  const remainingCashObligation = totalOwed - totalPaid;

  // DEFENSIVE RENDERING GATEWAYS
  // FIXED: Only block rendering on MSAL status loops if the user is NOT a Google Auth user
  if (inProgress !== "none") {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <strong>Synchronizing corporate secure single sign-on tokens...</strong>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <strong>Loading live ledger context blocks...</strong>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        <strong>Security Intercept Error: {(error as Error).message}</strong>
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
      {/* HEADER SECTION LAYOUT BLOCK WITH USER PROFILE DETAILS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          borderBottom: "1px solid #edf2f7",
          paddingBottom: "16px",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Subscription & Runway Orchestrator Core</h2>
        </div>

        {/* 2. DYNAMIC PROFILE VISUAL DISPLAY LAYER */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {activeUserSession && (
            <div
              style={{
                textAlign: "right",
                backgroundColor: "#f1f5f9",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "bold",
                  color: "#1e293b",
                }}
              >
                {activeUserSession.name}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                {activeUserSession.email} •{" "}
                <span
                  style={{
                    color:
                      activeUserSession.authType === "Google"
                        ? "#db4437"
                        : "#0078d4",
                    fontWeight: "bold",
                  }}
                >
                  {activeUserSession.authType}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleAbsoluteLogout}
            style={{
              background: "#d32f2f",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "13px",
            }}
          >
            Sign Out Session
          </button>
        </div>
      </div>

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

      <AddBillForm
        onAddBill={(name, amount, dueDate, category) =>
          addBillMutation.mutate({ name, amount, dueDate, category })
        }
      />

      <h3>Active Ledger Transactions (Protected App Gateway)</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {bills.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            No active balance metrics records located on host cloud server
            nodes.
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
              <div style={{ flexGrow: 1 }}>
                <strong>{bill.name}</strong>{" "}
                <span style={{ fontSize: "0.85em", color: "#666" }}>
                  ({bill.category})
                </span>
                <br />
                <span style={{ fontSize: "0.85em", color: "#4a5568" }}>
                  Due: {bill.dueDate} — <strong>€{bill.amount}</strong>
                </span>
              </div>
              <button
                onClick={() => togglePaidMutation.mutate(bill.id)}
                style={{
                  background: bill.isPaid ? "#757575" : "#2e7d32",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {bill.isPaid ? "Mark Unpaid" : "Mark Paid"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
