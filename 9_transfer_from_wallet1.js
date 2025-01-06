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
        console.log('Gönderen (Wallet1) Bakiye:', arweave.ar.winstonToAr(sourceBalance), 'AR');
        
        // Transaction oluştur - reward'ı node'a bırak
        const transaction = await arweave.createTransaction({
            target: targetAddress,
            quantity: arweave.ar.arToWinston('1000000'), // 1M AR
            data: Buffer.from('Transfer: 1M AR from Wallet1')
        }, sourceWallet);
        
        // Tag'leri ekle
        transaction.addTag('App-Name', 'BigFileTest');
        transaction.addTag('Type', 'Large-Transfer');
        transaction.addTag('Amount', '1000000');
        transaction.addTag('From', sourceAddress);
        transaction.addTag('To', targetAddress);
        
        // İşlem ücretini görüntüle
        console.log('\nİşlem Detayları:');
        console.log('------------------------');
        console.log('Gönderen:', sourceAddress);
        console.log('Alıcı:', targetAddress);
        console.log('Transfer Miktarı:', '1,000,000 AR');
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
            console.log('URL:', `http://65.108.0.39:1984/${transaction.id}`);
            console.log('\nİşlemi kontrol etmek için:');
            console.log(`npm run check-tx-status ${transaction.id}`);
        } else {
            console.error('Sunucu Yanıtı:', response.data);
            throw new Error(`Transfer başarısız: ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('\nTransfer Hatası:', error.message);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

transferFromWallet1(); 