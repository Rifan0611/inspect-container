const { Client } = require('ssh2');

const password = process.argv[2];
if (!password) {
  console.error('❌ Error: Password VPS harus dimasukkan! Contoh: node check.js <password>');
  process.exit(1);
}

const config = {
  host: '103.23.199.140',
  port: 22,
  username: 'adminral',
  password: password
};

const conn = new Client();
conn.on('ready', () => {
  console.log('✓ SSH Connected for check!');
  
  const cmd = `
    echo "=== Curl API response ==="
    curl -s -i http://localhost/api/accounts | head -n 15
  `;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect(config);
