import React, { useState, useEffect, useRef } from "react";

export default function MultiSelectDropdown({
  options = [],
  value = [],
  selectedValues,
  onChange,
  placeholder,
  disabled,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Use either value or selectedValues (for backwards compatibility)
  const actualValue = value || selectedValues || [];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (optValue) => {
    let newValue;
    if (actualValue.includes(optValue)) {
      newValue = actualValue.filter((v) => v !== optValue);
    } else {
      newValue = [...actualValue, optValue];
    }
    onChange(newValue, optValue); 
  };

  const displayValue =
    actualValue.length === 0
      ? placeholder
      : actualValue.length <= 2
        ? actualValue.join(", ")
        : `${actualValue.length} opsi terpilih`;

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 14px",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          backgroundColor: disabled ? "#f1f5f9" : "#ffffff",
          cursor: disabled ? "not-allowed" : "pointer",
          fontSize: "14px",
          color: value.length > 0 ? "#334155" : "#94a3b8",
          userSelect: "none",
          minHeight: "40px",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayValue}
        </span>
        <span
          style={{
            display: "inline-block",
            width: 0,
            height: 0,
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: isOpen ? "none" : "5px solid #64748b",
            borderBottom: isOpen ? "5px solid #64748b" : "none",
            marginLeft: "8px",
          }}
        />
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            zIndex: 9999,
            marginTop: "4px",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            maxHeight: "250px",
            overflowY: "auto",
          }}
        >
          {options.map((opt, idx) => {
            const isObject = typeof opt === "object" && opt !== null;
            const optValue = isObject ? opt.val : opt;
            const optLabel = isObject ? opt.label : opt;
            const isChecked = actualValue.includes(optValue);
            return (
              <label
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#334155",
                  borderBottom:
                    idx < options.length - 1 ? "1px solid #f1f5f9" : "none",
                  margin: 0,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f8fafc")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggle(optValue)}
                  style={{
                    marginRight: "10px",
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                  }}
                />
                {optLabel}
              </label>
            );
          })}
          <div
            style={{
              padding: "8px 12px",
              borderTop: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              textAlign: "right",
              position: "sticky",
              bottom: 0,
              zIndex: 10,
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              style={{
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                width: "100%",
              }}
            >
              ✓ OK / Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
