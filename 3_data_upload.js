const arweave = require('./config.js');
const fs = require('fs');

async function uploadData() {
    try {
        // Cüzdan bilgilerini oku
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        
        // Test verisi oluştur
        const testData = 'BigFile Test Verisi';
        
        // Önce bakiyeyi kontrol et
        const address = await arweave.wallets.jwkToAddress(wallet);
        const balance = await arweave.wallets.getBalance(address);
        console.log('Cüzdan Bakiyesi:', arweave.big.winstonToBIG(balance), 'BIG');

        // Veriyi yükle
        const transaction = await arweave.createTransaction({
            data: testData
        }, wallet);

        // İşlem ücretini görüntüle
        console.log('İşlem Ücreti:', arweave.big.winstonToBIG(transaction.reward), 'BIG');
        
        if (Number(balance) < Number(transaction.reward)) {
            throw new Error('Yetersiz bakiye! Lütfen test token alın.');
        }
        
        // İşlemi imzala
        await arweave.transactions.sign(transaction, wallet);
        
        // İşlemi gönder
        const response = await arweave.transactions.post(transaction);
        
        console.log('İşlem ID:', transaction.id);
        console.log('Yükleme Durumu:', response.status);
        
    } catch (error) {
        console.error('Veri yükleme hatası:', error.message);
    }
}

uploadData(); 