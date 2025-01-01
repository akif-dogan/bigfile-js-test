const arweave = require('./config.js');
const fs = require('fs');

async function checkWallet1Balance() {
    try {
        // wallet1.json dosyasını oku
        const wallet = JSON.parse(fs.readFileSync('wallet1.json'));
        
        // Cüzdan adresini al
        const address = await arweave.wallets.jwkToAddress(wallet);
        console.log('\nWallet1 Bilgileri:');
        console.log('------------------------');
        console.log('Cüzdan Adresi:', address);
        
        // Bakiyeyi kontrol et
        const balance = await arweave.wallets.getBalance(address);
        console.log('Ham Bakiye (winston):', balance);
        console.log('Bakiye (AR):', arweave.ar.winstonToAr(balance));
        
        // Son işlemleri getir
        console.log('\nSon İşlemler:');
        console.log('------------------------');
        
        // Gelen işlemler
        const incomingTxs = await arweave.arql({
            op: "equals",
            expr1: "to",
            expr2: address
        });
        
        // Giden işlemler
        const outgoingTxs = await arweave.arql({
            op: "equals",
            expr1: "from",
            expr2: address
        });
        
        console.log('Gelen İşlem Sayısı:', incomingTxs.length);
        console.log('Giden İşlem Sayısı:', outgoingTxs.length);
        
        if (incomingTxs.length > 0) {
            console.log('\nSon Gelen İşlemler:', incomingTxs.slice(0, 5));
        }
        
        if (outgoingTxs.length > 0) {
            console.log('\nSon Giden İşlemler:', outgoingTxs.slice(0, 5));
        }
        
        console.log('Network URL:', 'http://65.108.0.39:1984');
        
    } catch (error) {
        console.error('Wallet1 bakiye kontrol hatası:', error);
    }
}

checkWallet1Balance(); 