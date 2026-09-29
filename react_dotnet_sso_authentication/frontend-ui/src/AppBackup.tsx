// // src/App.tsx
// import React from "react";
// import { MsalAuthenticationTemplate } from "@azure/msal-react";
// import { InteractionType } from "@azure/msal-browser";
// import { loginRequest } from "./components/authConfig";
// import ReactQueryDashboard from "./components/ReactQueryDashboard";

// export default function App_old() {
//   // Loading view displayed while MSAL handles redirect tokens [INDEX]
//   const loadingDisplay = (
//     <div
//       style={{ textAlign: "center", padding: "40px", fontFamily: "sans-serif" }}
//     >
//       <strong>Connecting securely to Microsoft Entra ID...</strong>
//     </div>
//   );

//   // Error boundary fallback layout
//   const errorDisplay = ({ error }: any) => (
//     <div
//       style={{
//         padding: "20px",
//         color: "red",
//         fontFamily: "sans-serif",
//         textAlign: "center",
//       }}
//     >
//       <h3>Identity Verification Failed</h3>
//       <p>
//         {error?.message ||
//           "Please refresh and authenticate using your corporate account."}
//       </p>
//     </div>
//   );

//   return (
//     <div
//       style={{
//         maxWidth: "850px",
//         margin: "40px auto",
//         padding: "0 20px",
//         fontFamily: "sans-serif",
//       }}
//     >
//       <header
//         style={{
//           marginBottom: "20px",
//           borderBottom: "2px solid #eaeaea",
//           paddingBottom: "10px",
//         }}
//       >
//         <h1>Financial Runway Management Dashboard</h1>
//         <small style={{ color: "#718096", fontWeight: "bold" }}>
//           🔒 Enterprise Identity Access Secure
//         </small>
//       </header>

//       {/*
//         FIXED: Switched interactionType to InteractionType.Redirect.
//         This completely bypasses browser popup blockers by executing a clean page transition!
//       */}
//       <MsalAuthenticationTemplate
//         interactionType={InteractionType.Redirect}
//         authenticationRequest={loginRequest}
//         loadingComponent={() => loadingDisplay}
//         errorComponent={errorDisplay}
//       >
//         <ReactQueryDashboard />
//       </MsalAuthenticationTemplate>
//     </div>
//   );
// }
