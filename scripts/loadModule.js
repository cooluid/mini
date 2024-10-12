const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const moduleMap = {
    'javbus-scraper': './services/scrapers/JavbusScraper',
};

const SECRET_KEY = 'yrcoolio.!'.padEnd(32, '0'); // 将密钥填充到32字节

function decrypt(text) {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

async function loadModule(moduleName) {
    const encryptedPath = moduleMap[moduleName] + '.enc';
    if (!fs.existsSync(encryptedPath)) {
        throw new Error(`Encrypted module not found: ${encryptedPath}`);
    }
    const encryptedContent = fs.readFileSync(encryptedPath, 'utf8');
    const decryptedCode = decrypt(encryptedContent);
    const module = { exports: {} };
    const wrapper = Function('module', 'exports', decryptedCode);
    wrapper(module, module.exports);
    return module.exports;
}

module.exports = { loadModule };