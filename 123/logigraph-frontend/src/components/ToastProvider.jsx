import { Toaster } from "react-hot-toast";

function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#363636",
          color: "#fff",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
        },
        success: {
          style: {
            background: "#10b981",
          },
          icon: "✓",
        },
        error: {
          style: {
            background: "#ef4444",
          },
          icon: "✕",
        },
      }}
    />
  );
}

export default ToastProvider;
