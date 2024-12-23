const arweave = require('./config.js');
const fs = require('fs');

async function checkBalance() {
    try {
        // Cüzdan bilgilerini oku
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        
        // Cüzdan adresini al
        const address = await arweave.wallets.jwkToAddress(wallet);
        console.log('Cüzdan Adresi:', address);
        
        // Bakiyeyi kontrol et
        const balance = await arweave.wallets.getBalance(address);
        console.log('Ham Bakiye (winston):', balance);
        console.log('Bakiye (AR):', arweave.ar.winstonToAr(balance));
        
        // Son işlemleri kontrol et
        const transactions = await arweave.arql({
            op: "equals",
            expr1: "from",
            expr2: address
        });
        
        console.log('Son İşlemler:', transactions);
        
    } catch (error) {
        console.error('Bakiye kontrol hatası:', error);
    }
}

checkBalance(); 