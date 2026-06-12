import React, { useState, useEffect, useRef } from "react";

export default function SearchSelect({ value, onChange, options, placeholder, disabled, style }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
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

  const filteredOptions = options.filter(opt =>
    (opt || "").toLowerCase().includes(search.toLowerCase())
  );

  const displayValue = value || placeholder || "";

  return (
    <div
      ref={dropdownRef}
      className="search-select-container"
      style={{
        position: "relative",
        width: "100%",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        ...style
      }}
    >
      {/* Trigger selection box */}
      <div
        className="search-select-trigger"
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
          color: value ? "#334155" : "#94a3b8",
          userSelect: "none",
          boxSizing: "border-box",
          minHeight: "40px"
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayValue}
        </span>
        {/* Chevron Triangle */}
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
            flexShrink: 0
          }}
        />
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="search-select-dropdown"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            zIndex: 9999,
            marginTop: "4px",
            backgroundColor: "#ffffff",
            border: "1px solid #1e88e5",
            borderRadius: "4px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            boxSizing: "border-box",
            overflow: "hidden"
          }}
        >
          {/* Search box container */}
          <div style={{ padding: "8px", borderBottom: "1px solid #f1f5f9", position: "relative", boxSizing: "border-box" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 32px 8px 10px",
                border: "1px solid #cbd5e1",
                borderRadius: "4px",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
              autoFocus
            />
            {/* Search Glass Icon */}
            <span
              style={{
                position: "absolute",
                right: "18px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
                fontSize: "14px",
                pointerEvents: "none"
              }}
            >
              🔍
            </span>
          </div>

          {/* Options container */}
          <div style={{ maxHeight: "200px", overflowY: "auto", boxSizing: "border-box" }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: "10px 14px", fontSize: "14px", color: "#94a3b8", textAlign: "center" }}>
                Tidak ada data
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt === value;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    style={{
                      padding: "10px 14px",
                      fontSize: "14px",
                      backgroundColor: isSelected ? "#3b82f6" : "#ffffff",
                      color: isSelected ? "#ffffff" : "#334155",
                      cursor: "pointer",
                      transition: "background-color 0.15s ease",
                      userSelect: "none",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.target.style.backgroundColor = "#e2e8f0";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.target.style.backgroundColor = "#ffffff";
                      }
                    }}
                  >
                    {opt}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const CATEGORIES = ["DRY", "REEFER", "TANK", "FLAT", "DG", "HQ"];

export const ISO_CODES = [
  "-ISO Code-",
  // Dry/General Purpose
  "22G0 - 20' General Purpose Container (passive vents)",
  "22G1 - 20' General Purpose Container (passive vents)",
  "23G1 - 20' General Purpose Container (openings/vents)",
  "25G0 - 20' High Cube General Purpose Container",
  "25G1 - 20' High Cube General Purpose Container",
  "42G0 - 40' General Purpose Container",
  "42G1 - 40' General Purpose Container",
  "45G0 - 40' High Cube Dry Container",
  "45G1 - 40' High Cube Dry Container",
  "L5G0 - 45' High Cube Dry Container",
  "L5G1 - 45' High Cube Dry Container",
  
  // Reefer (Refrigerated)
  "20R1 - 20' Reefer Container",
  "22R0 - 20' Refrigerated Container (reefer)",
  "22R1 - 20' Refrigerated Container (reefer)",
  "42R0 - 40' Refrigerated Container (reefer)",
  "42R1 - 40' Refrigerated Container (reefer)",
  "45R0 - 40' High Cube Reefer Container",
  "45R1 - 40' High Cube Reefer Container",
  
  // Flat Rack / Platform
  "22P0 - 20' Flat Rack Container (platform)",
  "22P1 - 20' Flat Rack Container (platform)",
  "22PC - 20' Collapsible Flat Rack Container",
  "22PF - 20' Fixed Ends Flat Rack Container",
  "42P0 - 40' Flat Rack Container (platform)",
  "42P1 - 40' Flat Rack Container (platform)",
  "42PC - 40' Collapsible Flat Rack Container",
  "42PF - 40' Fixed Ends Flat Rack Container",
  "45P0 - 40' High Cube Flat Rack Container",
  "45P1 - 40' High Cube Flat Rack Container",
  "45PC - 40' High Cube Collapsible Flat Rack",
  "45PF - 40' High Cube Fixed Ends Flat Rack",
  
  // Open Top
  "22U0 - 20' Open Top Container",
  "22U1 - 20' Open Top Container",
  "25U0 - 20' High Cube Open Top Container",
  "42U0 - 40' Open Top Container",
  "42U1 - 40' Open Top Container",
  "45U0 - 40' High Cube Open Top Container",
  
  // Tank
  "22T0 - 20' Tank Container (for non-hazardous liquids)",
  "22T1 - 20' Tank Container (for hazardous liquids)",
  "22T2 - 20' Tank Container (for hazardous liquids)",
  "22T3 - 20' Tank Container (for hazardous liquids)",
  "22T4 - 20' Tank Container (for hazardous liquids)",
  "22T5 - 20' Tank Container (for gases)",
  "22T6 - 20' Tank Container (for gases)",
  "22T7 - 20' Tank Container (for pressurized gases)",
  "22T8 - 20' Tank Container (for pressurized gases)",
  "42T0 - 40' Tank Container (for non-hazardous liquids)",
  "42T1 - 40' Tank Container (for hazardous liquids)",
  "42T2 - 40' Tank Container (for hazardous liquids)"
];
