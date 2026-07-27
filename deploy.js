const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');
const { ZipArchive } = require('archiver');

const password = process.argv[2];
if (!password) {
  console.error('❌ Error: Password VPS harus dimasukkan! Contoh: node deploy.js <password>');
  process.exit(1);
}

const config = {
  host: '103.23.199.140',
  port: 22,
  username: 'adminral',
  password: password
};

async function main() {
  try {
    console.log('1. Memulai build frontend React...');
    execSync('npm run build', { cwd: path.join(__dirname, 'app/web'), stdio: 'inherit' });
    console.log('✓ Build frontend sukses!');

    console.log('2. Membuat arsip file proyek (deploy.zip)...');
    await createArchive();
    console.log('✓ Pembuatan arsip deploy.zip sukses!');

    console.log('3. Menghubungkan ke VPS via SSH...');
    const conn = new Client();
    conn.on('ready', () => {
      console.log('✓ Koneksi SSH berhasil terhubung!');
      
      console.log('4. Mengunggah deploy.zip ke VPS...');
      conn.sftp((err, sftp) => {
        if (err) {
          console.error('SFTP Error:', err);
          conn.end();
          return;
        }
        
        const readStream = fs.createReadStream(path.join(__dirname, 'deploy.zip'));
        const writeStream = sftp.createWriteStream('/home/adminral/deploy.zip');
        
        writeStream.on('close', () => {
          console.log('✓ Pengunggahan file deploy.zip selesai!');
          
          console.log('5. Menjalankan instalasi & konfigurasi di VPS...');
          runRemoteCommands(conn);
        });
        
        writeStream.on('error', (err) => {
          console.error('SFTP Write Error:', err);
          conn.end();
        });
        
        readStream.pipe(writeStream);
      });
    }).on('error', (err) => {
      console.error('SSH Connection Error:', err);
    }).connect(config);

  } catch (error) {
    console.error('❌ Terjadi kesalahan saat deploy:', error);
  }
}

function createArchive() {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(path.join(__dirname, 'deploy.zip'));
    const archive = new ZipArchive({ zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`✓ Zip file created. Total size: ${archive.pointer()} bytes`);
      resolve();
    });
    archive.on('error', err => reject(err));

    archive.pipe(output);

    // Tambahkan file backend (exclude node_modules dan logs)
    archive.directory('app/backend/', 'app/backend', (entry) => {
      if (
        entry.name.includes('node_modules') || 
        entry.name.includes('logs') || 
        entry.name.includes('.git')
      ) {
        return false;
      }
      return entry;
    });

    // Tambahkan file frontend build
    archive.directory('app/web/dist/', 'frontend');

    archive.finalize();
  });
}

function runRemoteCommands(conn) {
  const sudoPass = config.password;
  
  const setupScript = `
set -e
echo "==== Memulai setup di server VPS ===="

run_sudo() {
  echo "${sudoPass}" | sudo -S "$@"
}

echo "Menginstal paket dasar (unzip, nginx, curl)..."
run_sudo apt-get update -y
run_sudo apt-get install -y curl unzip nginx

if ! command -v node &> /dev/null; then
  echo "Menginstal Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x -o setup_node.sh
  run_sudo bash setup_node.sh
  rm -f setup_node.sh
  run_sudo apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
  echo "Menginstal PM2..."
  run_sudo npm install -g pm2
fi

echo "Mengekstrak file project..."
run_sudo mkdir -p /var/www/inspect-container
run_sudo chown -R adminral:adminral /var/www/inspect-container
unzip -o ~/deploy.zip -d /var/www/inspect-container/

cd /var/www/inspect-container
if [ -d "app/backend" ]; then
  rm -rf backend
  mv app/backend backend
  rm -rf app
fi

echo "Menginstal dependensi backend di server..."
cd /var/www/inspect-container/backend
npm install --production

echo "Mengonfigurasi Nginx..."
cat << 'EOF' > /tmp/inspect-nginx.conf
server {
    listen 80;
    server_name containerinspection.my.id www.containerinspection.my.id inspect-container.my.id www.inspect-container.my.id _;

    root /var/www/inspect-container/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

run_sudo mv /tmp/inspect-nginx.conf /etc/nginx/sites-available/inspect-container
run_sudo ln -sf /etc/nginx/sites-available/inspect-container /etc/nginx/sites-enabled/
run_sudo rm -f /etc/nginx/sites-enabled/default
run_sudo systemctl restart nginx

echo "Menginstal SSL Certbot (HTTPS) agar kamera HP dapat diakses secara aman..."
run_sudo apt-get install -y certbot python3-certbot-nginx
run_sudo certbot --nginx -d containerinspection.my.id -d www.containerinspection.my.id -d inspect-container.my.id -d www.inspect-container.my.id --expand --non-interactive --agree-tos -m rianagung2509@gmail.com || true
run_sudo systemctl reload nginx

echo "Menjalankan aplikasi Node backend dengan PM2..."
pm2 delete inspect-backend || true
pm2 start server.js --name "inspect-backend" --watch --ignore-watch="uploads logs"
pm2 save

run_sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u adminral --hp /home/adminral || true

rm -f ~/deploy.zip

echo "==== DEPLOYMENT SUKSES ==== "
echo "Aplikasi berjalan di http://103.23.199.140"
`;

  conn.exec(setupScript, (err, stream) => {
    if (err) {
      console.error('SSH Exec Error:', err);
      conn.end();
      return;
    }
    
    stream.on('close', (code, signal) => {
      console.log(`✓ Proses selesai dengan exit code: ${code}`);
      conn.end();
      process.exit(code);
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}

main();
