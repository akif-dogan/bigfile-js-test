const arweave = require('./config.js');
const fs = require('fs');

async function testWalletOperations() {
    try {
        console.log('\nCüzdan İşlemleri Testi:');
        console.log('------------------------');
        
        // Yeni cüzdan oluştur
        console.log('\n1. Yeni Cüzdan Oluşturma:');
        const newWallet = await arweave.wallets.generate();
        const newAddress = await arweave.wallets.jwkToAddress(newWallet);
        console.log('Yeni Cüzdan Adresi:', newAddress);
        
        // Mevcut cüzdanları kontrol et
        console.log('\n2. Mevcut Cüzdanlar:');
        
        // wallet.json kontrol
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        const address = await arweave.wallets.jwkToAddress(wallet);
        const balance = await arweave.wallets.getBalance(address);
        console.log('Wallet.json Adresi:', address);
        console.log('Bakiye:', arweave.ar.winstonToAr(balance), 'AR');
        
        // wallet1.json kontrol
        const wallet1 = JSON.parse(fs.readFileSync('wallet1.json'));
        const address1 = await arweave.wallets.jwkToAddress(wallet1);
        const balance1 = await arweave.wallets.getBalance(address1);
        console.log('\nWallet1.json Adresi:', address1);
        console.log('Bakiye:', arweave.ar.winstonToAr(balance1), 'AR');
        
        // Son işlemleri kontrol et
        console.log('\n3. Son İşlemler:');
        const lastTx = await arweave.wallets.getLastTransactionID(address);
        console.log('Wallet.json Son İşlem:', lastTx);
        
        const lastTx1 = await arweave.wallets.getLastTransactionID(address1);
        console.log('Wallet1.json Son İşlem:', lastTx1);
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

testWalletOperations(); 