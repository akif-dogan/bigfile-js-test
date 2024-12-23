const arweave = require('./config.js');
const fs = require('fs');

async function uploadData() {
    try {
        // Ana cüzdanı kullan (wallet.json)
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        
        // Önce bakiyeyi kontrol et
        const address = await arweave.wallets.jwkToAddress(wallet);
        const balance = await arweave.wallets.getBalance(address);
        
        console.log('\nCüzdan Bilgileri:');
        console.log('------------------------');
        console.log('Adres:', address);
        console.log('Bakiye:', arweave.ar.winstonToAr(balance), 'AR');
        
        // Örnek veri oluştur
        const data = {
            name: "BigFile Test Data",
            description: "First Data Upload Test",
            timestamp: Date.now(),
            creator: address,
            type: "test-upload"
        };
        
        // Transaction oluştur
        const transaction = await arweave.createTransaction({
            data: JSON.stringify(data)
        }, wallet);
        
        // Tag'leri ekle
        transaction.addTag('Network', 'bigfile.localnet');
        transaction.addTag('Content-Type', 'application/json');
        transaction.addTag('App-Name', 'BigFileTest');
        transaction.addTag('Type', 'Data');
        transaction.addTag('Version', '1.0');
        transaction.addTag('Timestamp', Date.now().toString());
        
        // İşlem ücretini görüntüle
        console.log('\nYükleme Detayları:');
        console.log('------------------------');
        console.log('Veri Boyutu:', Buffer.from(JSON.stringify(data)).length, 'bytes');
        console.log('İşlem Ücreti:', arweave.ar.winstonToAr(transaction.reward), 'AR');
        
        // İşlemi imzala
        await arweave.transactions.sign(transaction, wallet);
        
        // Custom headers ile gönder
        const uploadResponse = await arweave.transactions.post(transaction);
        
        if (uploadResponse.status !== 200) {
            throw new Error(`Upload failed with status ${uploadResponse.status}: ${uploadResponse.statusText}`);
        }
        
        console.log('\nSonuç:');
        console.log('------------------------');
        console.log('İşlem ID:', transaction.id);
        console.log('Status:', uploadResponse.status);
        
        // İşlem durumunu kontrol et
        let status;
        let retries = 5;
        while (retries > 0) {
            status = await arweave.transactions.getStatus(transaction.id);
            if (status.status === 200) break;
            console.log(`İşlem durumu kontrol ediliyor... (${retries} deneme kaldı)`);
            await new Promise(r => setTimeout(r, 2000));
            retries--;
        }
        
        if (uploadResponse.status === 200) {
            console.log('\nVeri Erişim:');
            console.log('------------------------');
            console.log('URL:', `http://thebigfile.info:1984/${transaction.id}`);
            console.log('\nVeri doğrulamak için:');
            console.log('------------------------');
            console.log('npm run check-tx-status # İşlem ID:', transaction.id);
        }
        
    } catch (error) {
        console.error('\nHata:', error);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

uploadData(); 