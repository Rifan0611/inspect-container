const db = require("../config/db");

const logSecurityEvent = (eventType, description, ipAddress) => {
  const cleanIp = ipAddress ? ipAddress.replace("::ffff:", "") : "unknown";
  const query = "INSERT INTO security_logs (event_type, description, ip_address) VALUES (?, ?, ?)";
  db.query(query, [eventType, description, cleanIp], (err) => {
    if (err) {
      console.error("Failed to save security log:", err);
    }
  });
};

module.exports = { logSecurityEvent };
