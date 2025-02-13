const arweave = require('./config.js');
const fs = require('fs');

async function transferToWallet1() {
    try {
        // Ana cüzdanı oku (wallet.json)
        const sourceWallet = JSON.parse(fs.readFileSync('wallet.json'));
        
        // Hedef cüzdanı oku (wallet1.json)
        const targetWallet = JSON.parse(fs.readFileSync('wallet1.json'));
        
        // Hedef adresi al
        const targetAddress = await arweave.wallets.jwkToAddress(targetWallet);
        
        // Kaynak cüzdan bakiyesini kontrol et
        const sourceAddress = await arweave.wallets.jwkToAddress(sourceWallet);
        const sourceBalance = await arweave.wallets.getBalance(sourceAddress);
        
        console.log('\nTransfer Öncesi Bakiyeler:');
        console.log('------------------------');
        console.log('Kaynak Cüzdan Bakiyesi:', arweave.big.winstonToBig(sourceBalance), 'BIG');
        
        // Transfer miktarı: 1 milyon BIG
        const transferAmount = '1000000';
        
        // Transfer işlemi oluştur
        const transaction = await arweave.createTransaction({
            target: targetAddress,
            quantity: arweave.big.bigToWinston(transferAmount)
        }, sourceWallet);
        
        // Network ve işlem tag'lerini ekle
        transaction.addTag('Network', 'bigfile.localnet');
        transaction.addTag('Type', 'Transfer');
        transaction.addTag('App-Name', 'BigFileTest');
        transaction.addTag('Version', '1.0');
        
        // İşlem ücretini görüntüle
        console.log('\nTransfer Detayları:');
        console.log('------------------------');
        console.log('Transfer Miktarı:', '1000000 BIG');
        console.log('İşlem Ücreti:', arweave.big.winstonToBig(transaction.reward), 'BIG');
        console.log('Hedef Adres:', targetAddress);
        
        // Toplam maliyet kontrolü
        const totalCost = Number(arweave.big.bigToWinston(transferAmount)) + Number(transaction.reward);
        if (Number(sourceBalance) < totalCost) {
            throw new Error('Yetersiz bakiye! Transfer + işlem ücreti için yeterli BIG yok.');
        }
        
        // İşlemi imzala
        await arweave.transactions.sign(transaction, sourceWallet);
        
        // İşlemi gönder
        const response = await arweave.transactions.post(transaction);
        
        console.log('\nTransfer Durumu:');
        console.log('------------------------');
        console.log('İşlem ID:', transaction.id);
        console.log('Durum:', response.status === 200 ? 'Başarılı' : 'Başarısız');
        console.log('Status Code:', response.status);
        
    } catch (error) {
        console.error('\nTransfer Hatası:', error.message);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

transferToWallet1(); 