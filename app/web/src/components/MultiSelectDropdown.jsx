import React, { useState, useEffect, useRef } from "react";

export default function MultiSelectDropdown({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    // Determine the new value array
    let newValue;
    if (value.includes(optValue)) {
      newValue = value.filter((v) => v !== optValue);
    } else {
      newValue = [...value, optValue];
    }
    onChange(newValue, optValue); // Pass the toggled value as second argument so parent can handle special cases like "GOOD"
  };

  const displayValue =
    value.length === 0
      ? placeholder
      : value.length <= 2
        ? value.join(", ")
        : `${value.length} opsi terpilih`;

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
            const isChecked = value.includes(opt.val);
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
                  onChange={() => handleToggle(opt.val)}
                  style={{
                    marginRight: "10px",
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                  }}
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
