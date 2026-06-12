import React, { useEffect, useState } from "react";

export default function Toast({ message, type, onClose, duration = 3000 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message && !visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: `translate(-50%, ${visible ? "0" : "-20px"})`,
        opacity: visible ? 1 : 0,
        transition: "all 0.3s ease-in-out",
        zIndex: 9999,
        padding: "12px 24px",
        borderRadius: "8px",
        backgroundColor: type === "error" ? "#fee2e2" : "#dcfce7",
        border: `1px solid ${type === "error" ? "#fca5a5" : "#86efac"}`,
        color: type === "error" ? "#991b1b" : "#166534",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        maxWidth: "90%",
        width: "max-content",
        textAlign: "center"
      }}
    >
      {type === "error" ? "⚠️" : "✅"}
      <span style={{ fontSize: "14px" }}>{message}</span>
    </div>
  );
}
