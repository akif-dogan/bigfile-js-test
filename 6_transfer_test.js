const arweave = require('./config.js');
const fs = require('fs');

async function testTransfer() {
    try {
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        const targetAddress = 'HEDEF_CUZDAN_ADRESI'; // Test için hedef adres
        
        // Transfer miktarı (örneğin 0.1 BIG)
        const amount = arweave.big.bigToWinston('0.1');
        
        // Transfer işlemi oluştur
        const transaction = await arweave.createTransaction({
            target: targetAddress,
            quantity: amount
        }, wallet);
        
        // İşlem ücretini görüntüle
        console.log('Transfer Miktarı:', arweave.big.winstonToBig(amount), 'BIG');
        console.log('İşlem Ücreti:', arweave.big.winstonToBig(transaction.reward), 'BIG');
        
        // İşlemi imzala
        await arweave.transactions.sign(transaction, wallet);
        
        // İşlemi gönder
        const response = await arweave.transactions.post(transaction);
        
        console.log('Transfer İşlem ID:', transaction.id);
        console.log('Transfer Durumu:', response.status);
        
    } catch (error) {
        console.error('Transfer hatası:', error);
    }
}

testTransfer(); 