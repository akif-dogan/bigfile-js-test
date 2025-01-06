const arweave = require('./config.js');
const fs = require('fs');

async function uploadImage(imagePath) {
    try {
        // Node durumunu kontrol et
        const networkInfo = await arweave.network.getInfo();
        console.log('\nNode Durumu:');
        console.log('------------------------');
        console.log('Network:', networkInfo.network);
        console.log('Version:', networkInfo.version);
        console.log('Height:', networkInfo.height);
        console.log('Current Block:', networkInfo.current);
        console.log('Peers:', networkInfo.peers);
        
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        const address = await arweave.wallets.jwkToAddress(wallet);
        
        // Bakiye kontrolü
        const balance = await arweave.wallets.getBalance(address);
        console.log('\nCüzdan Bilgileri:');
        console.log('------------------------');
        console.log('Adres:', address);
        console.log('Bakiye:', arweave.ar.winstonToAr(balance), 'AR');
        
        // Resim verisi
        const imageData = fs.readFileSync(imagePath);
        const imageType = imagePath.split('.').pop().toLowerCase();
        
        // Transaction oluştur - sadece data ve wallet belirt
        const transaction = await arweave.createTransaction({
            data: imageData
        }, wallet);
        
        // Content-Type tag'i ekle
        transaction.addTag('Content-Type', `image/${imageType}`);
        
        // İşlemi imzala
        await arweave.transactions.sign(transaction, wallet);
        
        console.log('\nTransaction Detayları:');
        console.log('------------------------');
        console.log('Data Size:', transaction.data_size, 'bytes');
        console.log('Owner:', transaction.owner.slice(0, 50) + '...');
        console.log('Reward:', arweave.ar.winstonToAr(transaction.reward), 'AR');
        
        // İşlemi gönder
        console.log('\nİşlem gönderiliyor...');
        const response = await arweave.transactions.post(transaction);
        
        console.log('\nSonuç:');
        console.log('------------------------');
        console.log('TX ID:', transaction.id);
        console.log('Status:', response.status);
        
        if (response.status === 200) {
            console.log('URL:', `http://65.108.0.39:1984/${transaction.id}`);
            
            // Veriyi chunk chunk yükle
            console.log('\nVeri yükleniyor...');
            let uploader = await arweave.transactions.getUploader(transaction);
            
            while (!uploader.isComplete) {
                await uploader.uploadChunk();
                console.log(`Yükleme: ${uploader.pctComplete}% tamamlandı`);
                // Her chunk sonrası 1 saniye bekle
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } else {
            console.error('Sunucu Yanıtı:', response.data);
            console.error('\nHata Detayları:');
            console.error('------------------------');
            console.error('Transaction ID:', transaction.id);
            console.error('Data Size:', transaction.data_size);
            console.error('Reward:', transaction.reward);
        }
        
    } catch (error) {
        console.error('\nHata:', error);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

const imagePath = './test.png';
uploadImage(imagePath); 