import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppRoutes from "./routes";
import { HelmetProvider } from "react-helmet-async";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <React.StrictMode>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <Toaster
                position='top-center'
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "#fff",
                    color: "#333",
                  },
                  success: {
                    style: {
                      border: "1px solid #00AE34",
                    },
                  },
                  error: {
                    style: {
                      border: "1px solid #ff4b4b",
                    },
                  },
                }}
              />
              <AppRoutes />
              <ReactQueryDevtools initialIsOpen={false} />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  </HelmetProvider>
);
