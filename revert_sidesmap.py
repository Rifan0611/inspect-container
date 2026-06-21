import os

files_to_check = [
    'app/web/src/pages/office-dashboard/OfficeDashboard.jsx',
    'app/web/src/components/HistoryTable.jsx',
    'app/web/src/App.jsx',
    'app/web/src/pages/Inspection.jsx'
]

old_sidesMap = """    const sidesMap = [
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
    ];"""

new_sidesMap = """    const sidesMap = [
      { val: "Front/Depan", label: "Front (Depan)", x: 11, y: 45 },
      { val: "Left Side/Sisi Kiri", label: "Left Side (Kiri)", x: 24, y: 45 },
      { val: "Bottom/Bawah", label: "Bottom (Bawah)", x: 20, y: 70 },
      { val: "Inside/Dalam", label: "Inside (Dalam)", x: 50, y: 45 },
      { val: "Roof/Atas", label: "Roof (Atas)", x: 83, y: 25 },
      { val: "Right Side/Sisi Kanan", label: "Right Side (Kanan)", x: 86, y: 42 },
      { val: "Rear/Belakang", label: "Rear/Doors (Belakang)", x: 74, y: 58 },
    ];"""

for file_path in files_to_check:
    full_path = os.path.join(r"c:\Users\User\Desktop\inspect-container", file_path)
    if not os.path.exists(full_path):
        continue
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if old_sidesMap in content:
        content = content.replace(old_sidesMap, new_sidesMap)
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
