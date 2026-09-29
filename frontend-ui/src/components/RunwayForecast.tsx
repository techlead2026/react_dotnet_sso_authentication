// src/components/RunwayForecast.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

interface ForecastSnapshot {
  monthLabel: string;
  startingBalance: number;
  expensesIncurred: number;
  endingBalance: number;
  isDepleted: boolean;
}

interface ForecastReport {
  totalMonthlyBurnRate: number;
  totalRunwayMonthsCount: number;
  forecastTimeline: ForecastSnapshot[];
}

export default function RunwayForecast() {
  const { instance, accounts } = useMsal();

  // 1. LOCAL SIMULATION INPUT BUFFERS
  const [cashCushion, setCashCushion] = useState<string>("5000");
  const [monthsToProject, setMonthsToProject] = useState<string>("12");

  // --- AUTOMATED SIGNED NETWORK CLIENT CLIENT ---
  const fetchForecastData = async (
    cash: number,
    months: number,
  ): Promise<ForecastReport> => {
    const activeAccount = instance.getActiveAccount() || accounts[0];
    const tokenResult = await instance.acquireTokenSilent({
      ...loginRequest,
      account: activeAccount,
    });

    const targetUrl = `http://localhost:5000/api/runway/forecast?startingCash=${cash}&projectionMonths=${months}`;

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenResult.accessToken}`,
      },
    });

    if (!response.ok)
      throw new Error(
        "Forecasting engine rejected token authorization credentials.",
      );
    return response.json();
  };

  // 2. DEPENDENT QUERY INSTANTIATION
  const numericCash = parseFloat(cashCushion) || 0;
  const numericMonths = parseInt(monthsToProject) || 12;

  const {
    data: report,
    isLoading,
    error,
  } = useQuery<ForecastReport>({
    queryKey: ["runwayForecast", numericCash, numericMonths], // Dynamic key triggers cache changes instantly on input!
    queryFn: () => fetchForecastData(numericCash, numericMonths),
    enabled: accounts.length > 0 && numericMonths > 0,
  });

  return (
    <div
      style={{
        marginTop: "30px",
        background: "#ffffff",
        padding: "24px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        border: "1px solid #e2e8f0",
      }}
    >
      <h3>🔮 Predictive Cash Runway Simulation Matrix</h3>
      <p style={{ color: "#4a5568", fontSize: "0.95em" }}>
        Simulate time-series runway parameters using your remote C# core engine
        variables.
      </p>

      {/* INPUT CONTROLLER PARAMETERS */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          background: "#f7fafc",
          padding: "16px",
          borderRadius: "6px",
        }}
      >
        <div style={{ flex: "1" }}>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "6px",
              fontSize: "0.9em",
            }}
          >
            Liquid Cash Buffer (€):
          </label>
          <input
            type="number"
            value={cashCushion}
            onChange={(e) => setCashCushion(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #cbd5e0",
              borderRadius: "4px",
            }}
          />
        </div>
        <div style={{ flex: "1" }}>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "6px",
              fontSize: "0.9em",
            }}
          >
            Simulation Timeline (Months):
          </label>
          <input
            type="number"
            value={monthsToProject}
            onChange={(e) => setMonthsToProject(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #cbd5e0",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>

      {isLoading && <p>Processing time-series simulation grids...</p>}
      {error && (
        <p style={{ color: "red" }}>
          Simulation Error: {(error as Error).message}
        </p>
      )}

      {/* RENDER ANALYTICAL SCORECARDS */}
      {report && (
        <div>
          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <div
              style={{
                flex: "1",
                background: "#edf2f7",
                padding: "12px",
                borderRadius: "4px",
                textAlign: "center",
              }}
            >
              <small style={{ color: "#718096", textTransform: "uppercase" }}>
                Monthly Burn Rate
              </small>
              <h4
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "1.4em",
                  color: "#2d3748",
                }}
              >
                €{report.totalMonthlyBurnRate}
              </h4>
            </div>
            <div
              style={{
                flex: "1",
                background:
                  report.totalRunwayMonthsCount < 3 ? "#fed7d7" : "#c6f6d5",
                padding: "12px",
                borderRadius: "4px",
                textAlign: "center",
              }}
            >
              <small style={{ color: "#718096", textTransform: "uppercase" }}>
                Safe Capital Runway
              </small>
              <h4
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "1.4em",
                  color:
                    report.totalRunwayMonthsCount < 3 ? "#c53030" : "#22543d",
                }}
              >
                {report.totalRunwayMonthsCount} Months
              </h4>
            </div>
          </div>

          {/* TIMELINE SIMULATION DATA ROWS GRID */}
          <h4 style={{ marginBottom: "10px" }}>
            Chronological Budget Depletion Forecast Map
          </h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {report.forecastTimeline.map((snapshot, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderLeft: `4px solid ${snapshot.isDepleted ? "#e53e3e" : "#3182ce"}`,
                  background: snapshot.isDepleted ? "#fff5f5" : "#f7fafc",
                  borderRadius: "0 4px 4px 0",
                  fontSize: "0.9em",
                }}
              >
                <div>
                  <strong>{snapshot.monthLabel}</strong>
                  <span style={{ marginLeft: "12px", color: "#718096" }}>
                    Start: €{snapshot.startingBalance}
                  </span>
                </div>
                <div>
                  <span style={{ color: "#e53e3e", marginRight: "16px" }}>
                    Burn: -€{snapshot.expensesIncurred}
                  </span>
                  <span style={{ fontWeight: "bold" }}>
                    Remaining: €{snapshot.endingBalance}
                  </span>
                  {snapshot.isDepleted && (
                    <span
                      style={{
                        marginLeft: "8px",
                        background: "#e53e3e",
                        color: "#fff",
                        fontSize: "0.75em",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      CRITICAL CRASH
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
