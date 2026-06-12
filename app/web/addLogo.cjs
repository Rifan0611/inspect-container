const fs = require('fs');

let code = fs.readFileSync('c:/Users/User/Desktop/inspect-container/app/web/src/App.jsx', 'utf8');

code = code.replace(
  '<h1 style={title}>CONTAINER INSPECTION</h1>',
  '<img src="/logo.jpg" alt="Logo" style={{ margin: "0 auto 24px auto", display: "block", width: "120px" }} />\n          <h1 style={title}>CONTAINER INSPECTION</h1>'
);

code = code.replace(
  '<h1 style={title}>DASHBOARD</h1>',
  '<img src="/logo.jpg" alt="Logo" style={{ margin: "0 auto 24px auto", display: "block", width: "120px" }} />\n          <h1 style={title}>DASHBOARD</h1>'
);

fs.writeFileSync('c:/Users/User/Desktop/inspect-container/app/web/src/App.jsx', code);
console.log('App.jsx fixed successfully!');
