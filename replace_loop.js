const fs = require('fs');

const filePath = 'app/web/src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the start and end of the loop
const startMarker = 'for (const photoObj of photosList) {';
const endMarker = 'const uploadedPhotoUrl = uploadedUrls.join("|");';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `const base64Results = await Promise.all(
          photosList.map(async (photoObj) => {
            if (photoObj.file) {
              return await new Promise((resolve) => {
                compressImageToBase64(photoObj.file, resolve);
              });
            }
            return photoObj.url;
          })
        );
        uploadedUrls.push(...base64Results);
        
        `;
        
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully replaced loop with Promise.all in App.jsx');
} else {
  console.log('Could not find markers in App.jsx');
}
