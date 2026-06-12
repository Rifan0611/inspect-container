const fs = require('fs');

const filePath = 'app/web/src/pages/office-dashboard/OfficeDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add compressImageToBase64 if it doesn't exist
if (!content.includes('const compressImageToBase64')) {
  const compressFn = `
const compressImageToBase64 = (file, callback) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const maxDim = 800;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      callback(dataUrl);
    };
  };
};
`;
  // Add it before "export default function OfficeDashboard"
  content = content.replace('export default function OfficeDashboard', compressFn + '\nexport default function OfficeDashboard');
}

// 2. Add editPhoto2 state
if (!content.includes('const [editPhoto2, setEditPhoto2]')) {
  content = content.replace(
    'const [editDate, setEditDate] = useState("");',
    'const [editDate, setEditDate] = useState("");\n  const [editPhoto2, setEditPhoto2] = useState("");'
  );
}

// 3. Update useEffect
content = content.replace(
  'setEditDate(adjustedDate.toISOString().slice(0, 16));\n        } else {\n          setEditDate("");\n        }',
  'setEditDate(adjustedDate.toISOString().slice(0, 16));\n        } else {\n          setEditDate("");\n        }\n        setEditPhoto2(editingInspection.photo2 || "");'
);

// 4. Update PUT payload
content = content.replace(
  'date: editDate,',
  'date: editDate,\n              photo2: editPhoto2,'
);

// 5. Update local state
content = content.replace(
  'date: editDate,\n              };',
  'date: editDate,\n                photo2: editPhoto2,\n              };'
);

// 6. Update edit button condition
content = content.replace(
  '{user?.username === "adminRAL" && (\n                            <button\n                              className="edit-btn"',
  '{(user?.username === "adminRAL" || user?.role !== "PETUGAS") && (\n                            <button\n                              className="edit-btn"'
);

// 7. Add input for editPhoto2 in the modal
const newPhotoInput = `
                  <div className="form-group-edit" style={{ display: "flex", flexDirection: "column", gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "6px", color: "#475569" }}>
                      Update Foto Damage (Opsional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          compressImageToBase64(file, (base64) => {
                            setEditPhoto2(base64);
                          });
                        }
                      }}
                      style={{
                        padding: "8px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13px",
                      }}
                    />
                    {editPhoto2 && (
                      <div style={{ marginTop: "10px" }}>
                        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Preview Foto:</p>
                        <img src={editPhoto2} alt="Preview" style={{ maxWidth: "200px", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                      </div>
                    )}
                  </div>
`;

content = content.replace(
  '<div\n                  className="edit-form-grid"',
  '<div\n                  className="edit-form-grid"'
);

// Add it before the action buttons inside the form
content = content.replace(
  '<div\n                  className="modal-actions"',
  newPhotoInput + '\n                <div\n                  className="modal-actions"'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Script completed.');
