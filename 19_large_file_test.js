const arweave = require('./config.js');
const fs = require('fs');

async function testLargeFileUpload(filePath) {
    try {
        // Node durumunu kontrol et
        const networkInfo = await arweave.network.getInfo();
        console.log('\nNode Durumu:');
        console.log('------------------------');
        console.log('Network:', networkInfo.network);
        console.log('Height:', networkInfo.height);
        console.log('Peers:', networkInfo.peers);

        // Cüzdan bilgileri
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        const address = await arweave.wallets.jwkToAddress(wallet);
        const balance = await arweave.wallets.getBalance(address);
        
        console.log('\nCüzdan Bilgileri:');
        console.log('------------------------');
        console.log('Adres:', address);
        console.log('Bakiye:', arweave.ar.winstonToAr(balance), 'AR');

        // Dosya bilgileri
        const fileData = fs.readFileSync(filePath);
        const fileSize = fileData.length;
        const fileType = filePath.split('.').pop().toLowerCase();
        
        console.log('\nDosya Bilgileri:');
        console.log('------------------------');
        console.log('Boyut:', (fileSize / (1024 * 1024)).toFixed(2), 'MB');
        console.log('Tür:', fileType);

        // Transaction oluştur
        const transaction = await arweave.createTransaction({
            data: fileData
        }, wallet);

        // Tag'leri ekle
        transaction.addTag('Content-Type', `application/${fileType}`);
        transaction.addTag('App-Name', 'BigFileTest');
        transaction.addTag('File-Size', fileSize.toString());
        transaction.addTag('Upload-Type', 'large-file');

        // İşlemi imzala
        await arweave.transactions.sign(transaction, wallet);
        
        console.log('\nTransaction Detayları:');
        console.log('------------------------');
        console.log('TX ID:', transaction.id);
        console.log('Data Size:', transaction.data_size, 'bytes');
        console.log('Reward:', arweave.ar.winstonToAr(transaction.reward), 'AR');

        // İşlemi gönder
        console.log('\nİşlem gönderiliyor...');
        const response = await arweave.transactions.post(transaction);
        
        if (response.status === 200) {
            console.log('Transaction başarıyla gönderildi.');
            console.log('URL:', `http://213.239.206.178:1984/${transaction.id}`);
            
            // Chunk yükleme
            console.log('\nDosya yükleniyor...');
            let uploader = await arweave.transactions.getUploader(transaction);
            
            while (!uploader.isComplete) {
                await uploader.uploadChunk();
                console.log(`Yükleme: ${uploader.pctComplete}% tamamlandı`);
                
                // Her chunk sonrası küçük bir bekleme
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            console.log('\nYükleme tamamlandı!');
            console.log('------------------------');
            console.log('TX ID:', transaction.id);
            console.log('URL:', `http://213.239.206.178:1984/${transaction.id}`);
            
        } else {
            console.error('\nHata:', response.status);
            console.error('Sunucu Yanıtı:', response.data);
        }

    } catch (error) {
        console.error('\nHata:', error);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

// Test için büyük bir dosya yolu belirtin
const filePath = './test_200mb.dat'; // veya başka bir büyük dosya
testLargeFileUpload(filePath); 