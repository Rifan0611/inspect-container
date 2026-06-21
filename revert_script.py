import os
import re

files_to_check = [
    'app/web/src/pages/office-dashboard/OfficeDashboard.jsx',
    'app/web/src/pages/Inspection.jsx',
    'app/web/src/components/HistoryTable.jsx',
    'app/web/src/App.jsx',
    'app/web/src/components/InspectionForm.jsx'
]

new_hotspots = '''{[
                { val: "Front/Depan", label: "Front (Depan)", x: 11, y: 45 },
                { val: "Left Side/Sisi Kiri", label: "Left Side (Kiri)", x: 24, y: 45 },
                { val: "Bottom/Bawah", label: "Bottom (Bawah)", x: 20, y: 70 },
                { val: "Inside/Dalam", label: "Inside (Dalam)", x: 50, y: 45 },
                { val: "Roof/Atas", label: "Roof (Atas)", x: 83, y: 25 },
                { val: "Right Side/Sisi Kanan", label: "Right Side (Kanan)", x: 86, y: 42 },
                { val: "Rear/Belakang", label: "Rear/Doors (Belakang)", x: 74, y: 58 },
              ]'''

new_select = '''{[
                  "Front/Depan",
                  "Rear/Belakang",
                  "Left Side/Sisi Kiri",
                  "Right Side/Sisi Kanan",
                  "Roof/Atas",
                  "Bottom/Bawah",
                  "Inside/Dalam",
                ].map'''

new_sidesmap = '''const sidesMap = [
      { val: "Front/Depan", label: "Front (Depan)", x: 11, y: 45 },
      { val: "Left Side/Sisi Kiri", label: "Left Side (Kiri)", x: 24, y: 45 },
      { val: "Bottom/Bawah", label: "Bottom (Bawah)", x: 20, y: 70 },
      { val: "Inside/Dalam", label: "Inside (Dalam)", x: 50, y: 45 },
      { val: "Roof/Atas", label: "Roof (Atas)", x: 83, y: 25 },
      { val: "Right Side/Sisi Kanan", label: "Right Side (Kanan)", x: 86, y: 42 },
      { val: "Rear/Belakang", label: "Rear/Doors (Belakang)", x: 74, y: 58 },
    ];'''

for file_path in files_to_check:
    full_path = os.path.join(r"c:\Users\User\Desktop\inspect-container", file_path)
    if not os.path.exists(full_path):
        continue
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # Replace Hotspots in Inspection.jsx and App.jsx
    start_str = '{['
    marker = 'val: "Front/Depan"'
    end_str = '].map('
    
    parts = []
    idx = 0
    while True:
        s_idx = content.find(start_str, idx)
        if s_idx == -1:
            parts.append(content[idx:])
            break
            
        e_idx = content.find(end_str, s_idx)
        if e_idx != -1 and marker in content[s_idx:e_idx]:
            parts.append(content[idx:s_idx])
            parts.append(new_hotspots)
            idx = e_idx
            modified = True
        else:
            parts.append(content[idx:s_idx + len(start_str)])
            idx = s_idx + len(start_str)
            
    content = "".join(parts)
    
    # Replace sidesMap
    start_str_sm = 'const sidesMap = ['
    end_str_sm = '];'
    parts_sm = []
    idx_sm = 0
    while True:
        s_idx = content.find(start_str_sm, idx_sm)
        if s_idx == -1:
            parts_sm.append(content[idx_sm:])
            break
            
        e_idx = content.find(end_str_sm, s_idx)
        if e_idx != -1 and marker in content[s_idx:e_idx]:
            parts_sm.append(content[idx_sm:s_idx])
            parts_sm.append(new_sidesmap)
            idx_sm = e_idx + len(end_str_sm)
            modified = True
        else:
            parts_sm.append(content[idx_sm:s_idx + len(start_str_sm)])
            idx_sm = s_idx + len(start_str_sm)
            
    content = "".join(parts_sm)
    
    # Replace old select regex (App.jsx and Inspection.jsx)
    old_select_regex = re.compile(r'\{\[\s*"Front/Depan",\s*"Left Side \(Depan\)".*?\]\.map', re.DOTALL)
    if old_select_regex.search(content):
        content = old_select_regex.sub(new_select, content)
        modified = True
        
    # Replace SIDE_OPTIONS in InspectionForm.jsx
    old_side = 'const SIDE_OPTIONS = ["Front/Depan", "Left Side (Depan)", "Left Side (Tengah)", "Left Side (Belakang)", "Bottom (Depan)", "Bottom (Tengah)", "Bottom (Belakang)", "Inside/Dalam", "Roof (Depan)", "Roof (Tengah)", "Roof (Belakang)", "Right Side (Depan)", "Right Side (Tengah)", "Right Side (Belakang)", "Rear/Belakang", "Doors/Pintu", "Door Rods/Gagang Pintu", "Corner Castings"];'
    new_side = 'const SIDE_OPTIONS = ["Front/Depan", "Rear/Belakang", "Right Side/Sisi Kanan", "Left Side/Sisi Kiri", "Roof/Atas", "Bottom/Bawah", "Inside/Dalam", "Doors/Pintu", "Door Rods/Gagang Pintu", "Corner Castings"];'
    if old_side in content:
        content = content.replace(old_side, new_side)
        modified = True
        
    if modified:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
