const fs = require('fs');

const filesToOptimize = [
  'app/web/src/App.jsx',
  'app/web/src/pages/office-dashboard/OfficeDashboard.jsx'
];

for (const filePath of filesToOptimize) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');

  // Change maxDim to 600
  content = content.replace(/const maxDim = 800;/g, 'const maxDim = 600;');
  
  // Change quality to 0.5
  content = content.replace(/\.toDataURL\("image\/jpeg", 0\.7\)/g, '.toDataURL("image/jpeg", 0.5)');

  if (filePath === 'app/web/src/App.jsx') {
    // Replace sequential loop with Promise.all
    const sequentialLoop = `        for (const photoObj of photosList) {
          if (photoObj.file) {
            const base64Str = await new Promise((resolve) => {
              compressImageToBase64(photoObj.file, (result) => resolve(result));
            });
            uploadedUrls.push(base64Str);
          } else {
            uploadedUrls.push(photoObj.url);
          }
        }`;

    const parallelLoop = `        const base64Results = await Promise.all(
          photosList.map(async (photoObj) => {
            if (photoObj.file) {
              return await new Promise((resolve) => {
                compressImageToBase64(photoObj.file, resolve);
              });
            }
            return photoObj.url;
          })
        );
        uploadedUrls.push(...base64Results);`;

    content = content.replace(sequentialLoop, parallelLoop);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Optimized ${filePath}`);
}
