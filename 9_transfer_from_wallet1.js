const arweave = require('./config.js');
const fs = require('fs');

async function transferFromWallet1() {
    try {
        console.log('\nTransfer Bilgileri:');
        console.log('------------------------');
        
        // Wallet1'i kaynak olarak kullan
        const sourceWallet = JSON.parse(fs.readFileSync('wallet1.json'));
        const sourceAddress = await arweave.wallets.jwkToAddress(sourceWallet);
        
        // Ana cüzdanı hedef olarak kullan
        const targetWallet = JSON.parse(fs.readFileSync('wallet.json'));
        const targetAddress = await arweave.wallets.jwkToAddress(targetWallet);
        
        // Bakiyeleri kontrol et
        const sourceBalance = await arweave.wallets.getBalance(sourceAddress);
        console.log('Gönderen Bakiye:', arweave.ar.winstonToAr(sourceBalance), 'AR');
        
        // Transfer miktarı: 1000 AR
        const transferAmount = arweave.ar.arToWinston('1000');
        
        // Transaction oluştur
        const transaction = await arweave.createTransaction({
            target: targetAddress,
            quantity: transferAmount,
            data: Buffer.from('Transfer from Wallet1')
        }, sourceWallet);
        
        // Tag'leri ekle
        transaction.addTag('App-Name', 'BigFileTest');
        transaction.addTag('Type', 'Transfer');
        transaction.addTag('Version', '1.0');
        transaction.addTag('Network', 'bigfile.localnet');
        transaction.addTag('Network-Type', 'testnet');
        
        // İşlem ücretini görüntüle
        console.log('\nİşlem Detayları:');
        console.log('------------------------');
        console.log('Gönderen:', sourceAddress);
        console.log('Alıcı:', targetAddress);
        console.log('Transfer Miktarı:', '1000 AR');
        console.log('İşlem Ücreti:', arweave.ar.winstonToAr(transaction.reward), 'AR');
        
        // İşlemi imzala
        await arweave.transactions.sign(transaction, sourceWallet);
        
        // İşlemi gönder
        const response = await arweave.transactions.post(transaction);
        
        console.log('\nSonuç:');
        console.log('------------------------');
        console.log('İşlem ID:', transaction.id);
        console.log('Status:', response.status);
        
        if (response.status === 200) {
            console.log('Transfer başarıyla gönderildi');
            console.log('\nİşlemi kontrol etmek için:');
            console.log(`npm run check-tx-status # TX ID: ${transaction.id}`);
        } else {
            throw new Error(`Transfer başarısız: ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('\nTransfer Hatası:', error.message);
        if (error.response) {
            console.error('Sunucu Yan��tı:', error.response.data);
        }
    }
}

transferFromWallet1(); 