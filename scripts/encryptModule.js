const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const SECRET_KEY = 'yrcoolio.!'.padEnd(32, '0'); // 将密钥填充到32字节
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function encryptFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`文件不存在，跳过加密: ${filePath}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const encrypted = encrypt(content);
  const encryptedPath = filePath + '.enc';
  fs.writeFileSync(encryptedPath, encrypted);
  console.log(`已加密 ${filePath} 到 ${encryptedPath}`);
}

const rootDir = path.resolve(__dirname, '..');
const filesToEncrypt = [
  path.join(rootDir, 'dist_electron', 'services', 'scrapers', 'JavbusScraper.js'),
  // 添加其他需要加密的文件...
];

filesToEncrypt.forEach(encryptFile);