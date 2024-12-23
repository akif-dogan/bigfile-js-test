const arweave = require('./config.js');
const fs = require('fs');

async function createWallet() {
    try {
        // Yeni cüzdan oluştur
        const jwk = await arweave.wallets.generate();
        
        // Cüzdanı JSON dosyası olarak kaydet
        fs.writeFileSync('wallet.json', JSON.stringify(jwk));
        
        // Cüzdan adresini al
        const address = await arweave.wallets.jwkToAddress(jwk);
        console.log('Cüzdan Adresi:', address);
        
        return address;
    } catch (error) {
        console.error('Cüzdan oluşturma hatası:', error);
    }
}

createWallet(); 