const fs = require('fs');

let code = fs.readFileSync('c:/Users/User/Desktop/inspect-container/app/web/src/App.jsx', 'utf8');

// We use parsing or simpler replacements.
// Since these functions are inside App, we can just replace their bodies with empty if we can't delete them.
// But wait, the easiest is:
code = code.replace(/const simpanData = async \(\) => \{[\s\S]*?setIsUploading\(false\);\r?\n\s+\}\r?\n\s+\};/m, '');
code = code.replace(/const cetakPdf = \(item\) => \{[\s\S]*?win\.print\(\);\r?\n\s+\};/m, '');
code = code.replace(/const cariContainer = \(value\) => \{[\s\S]*?setCategory\(\"\"\);\r?\n\s+\}\r?\n\s+\};/m, '');
code = code.replace(/const cariContainerLive = async \(\) => \{[\s\S]*?setIsScanning\(false\);\r?\n\s+\}\r?\n\s+\};/m, '');

// If the regex misses due to formatting, let's just use string operations:
const removeFunc = (codeStr, funcName) => {
    const startIdx = codeStr.indexOf(`const ${funcName} = `);
    if (startIdx === -1) return codeStr;
    
    let braceCount = 0;
    let foundFirstBrace = false;
    let endIdx = -1;
    
    for (let i = startIdx; i < codeStr.length; i++) {
        if (codeStr[i] === '{') {
            braceCount++;
            foundFirstBrace = true;
        } else if (codeStr[i] === '}') {
            braceCount--;
        }
        
        if (foundFirstBrace && braceCount === 0) {
            endIdx = i;
            break;
        }
    }
    
    if (endIdx !== -1) {
        // Find the semicolon if any
        if (codeStr[endIdx+1] === ';') endIdx++;
        console.log(`Removed ${funcName}`);
        return codeStr.substring(0, startIdx) + codeStr.substring(endIdx + 1);
    }
    return codeStr;
};

code = removeFunc(code, 'simpanData');
code = removeFunc(code, 'cetakPdf');
code = removeFunc(code, 'cariContainer');
code = removeFunc(code, 'cariContainerLive');
code = removeFunc(code, 'handleSearchContainer');
code = removeFunc(code, 'compressImageToBase64');
code = removeFunc(code, 'compressImage');

fs.writeFileSync('c:/Users/User/Desktop/inspect-container/app/web/src/App.jsx', code);
