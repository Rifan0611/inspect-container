import os
import re

files_to_check = [
    'app/web/src/pages/office-dashboard/OfficeDashboard.jsx',
    'app/web/src/pages/Inspection.jsx',
    'app/web/src/components/HistoryTable.jsx',
    'app/web/src/App.jsx',
    'app/web/src/components/InspectionForm.jsx'
]

old_hotspots_regex = re.compile(
    r'\{\[\s*\{\s*val:\s*"Front/Depan",\s*label:\s*"Front \(Depan\)".*?y:\s*60\s*\},?\s*\]\}', 
    re.DOTALL
)

new_hotspots = '''{[
                { val: "Front/Depan", label: "Front (Depan)", x: 11, y: 45 },
                
                { val: "Left Side (Depan)", label: "Left (Depan)", x: 18, y: 38 },
                { val: "Left Side (Tengah)", label: "Left (Tengah)", x: 24, y: 45 },
                { val: "Left Side (Belakang)", label: "Left (Belakang)", x: 30, y: 52 },
                
                { val: "Bottom (Depan)", label: "Bawah (Depan)", x: 12, y: 65 },
                { val: "Bottom (Tengah)", label: "Bawah (Tengah)", x: 20, y: 70 },
                { val: "Bottom (Belakang)", label: "Bawah (Belakang)", x: 28, y: 75 },
                
                { val: "Inside/Dalam", label: "Inside (Dalam)", x: 50, y: 45 },
                
                { val: "Roof (Belakang)", label: "Atas (Belakang)", x: 75, y: 25 },
                { val: "Roof (Tengah)", label: "Atas (Tengah)", x: 83, y: 25 },
                { val: "Roof (Depan)", label: "Atas (Depan)", x: 91, y: 25 },
                
                { val: "Right Side (Belakang)", label: "Right (Belakang)", x: 80, y: 42 },
                { val: "Right Side (Tengah)", label: "Right (Tengah)", x: 86, y: 42 },
                { val: "Right Side (Depan)", label: "Right (Depan)", x: 92, y: 42 },
                
                { val: "Rear/Belakang", label: "Rear (Belakang)", x: 74, y: 58 },
              ]}'''

old_select_regex = re.compile(
    r'\{\[\s*"Front/Depan",\s*"Rear/Belakang",\s*"Left Side/Sisi Kiri",\s*"Right Side/Sisi Kanan",\s*"Roof/Atas",\s*"Bottom/Bawah",\s*"Inside/Dalam",?\s*\]\.map',
    re.DOTALL
)

new_select = '''{[
                  "Front/Depan",
                  "Left Side (Depan)",
                  "Left Side (Tengah)",
                  "Left Side (Belakang)",
                  "Bottom (Depan)",
                  "Bottom (Tengah)",
                  "Bottom (Belakang)",
                  "Inside/Dalam",
                  "Roof (Depan)",
                  "Roof (Tengah)",
                  "Roof (Belakang)",
                  "Right Side (Depan)",
                  "Right Side (Tengah)",
                  "Right Side (Belakang)",
                  "Rear/Belakang",
                ].map'''

for file_path in files_to_check:
    full_path = os.path.join(r"c:\Users\User\Desktop\inspect-container", file_path)
    if not os.path.exists(full_path):
        continue
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    if old_hotspots_regex.search(content):
        content = old_hotspots_regex.sub(new_hotspots, content)
        modified = True
        print(f"Matched old_hotspots in {file_path}")
        
    if old_select_regex.search(content):
        content = old_select_regex.sub(new_select, content)
        modified = True
        print(f"Matched old_select in {file_path}")
        
    if file_path.endswith('InspectionForm.jsx'):
        old_side = 'const SIDE_OPTIONS = ["Front/Depan", "Rear/Belakang", "Right Side/Sisi Kanan", "Left Side/Sisi Kiri", "Roof/Atas", "Bottom/Bawah", "Inside/Dalam", "Doors/Pintu", "Door Rods/Gagang Pintu", "Corner Castings"];'
        new_side = 'const SIDE_OPTIONS = ["Front/Depan", "Left Side (Depan)", "Left Side (Tengah)", "Left Side (Belakang)", "Bottom (Depan)", "Bottom (Tengah)", "Bottom (Belakang)", "Inside/Dalam", "Roof (Depan)", "Roof (Tengah)", "Roof (Belakang)", "Right Side (Depan)", "Right Side (Tengah)", "Right Side (Belakang)", "Rear/Belakang", "Doors/Pintu", "Door Rods/Gagang Pintu", "Corner Castings"];'
        if old_side in content:
            content = content.replace(old_side, new_side)
            modified = True
            print(f"Matched SIDE_OPTIONS in {file_path}")
            
    if modified:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {file_path}')
