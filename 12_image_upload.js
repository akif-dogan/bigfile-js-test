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
        console.log('Release:', networkInfo.release);
        console.log('Height:', networkInfo.height);
        console.log('Current Block:', networkInfo.current);
        console.log('Queue Length:', networkInfo.queue_length);
        console.log('Node State Latency:', networkInfo.node_state_latency);

        // Cüzdan ve dosya kontrolü
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        const imageData = fs.readFileSync(imagePath);
        const address = await arweave.wallets.jwkToAddress(wallet);
        const balance = await arweave.wallets.getBalance(address);

        console.log('\nCüzdan Bilgileri:');
        console.log('------------------------');
        console.log('Adres:', address);
        console.log('Bakiye:', arweave.big.winstonToBIG(balance), 'BIG');

        // İşlem oluştur
        const transaction = await arweave.createTransaction({
            data: imageData
        }, wallet);

        // İşlem detayları
        console.log('\nİşlem Detayları:');
        console.log('------------------------');
        console.log('Data Boyutu:', transaction.data_size, 'bytes');
        console.log('Mevcut Bakiye:', arweave.big.winstonToBIG(balance), 'BIG');
        console.log('Gerekli Ücret:', arweave.big.winstonToBIG(transaction.reward), 'BIG');

        // Bakiye kontrolü
        if (Number(balance) < Number(transaction.reward)) {
            throw new Error(`Yetersiz bakiye! 
                Gerekli: ${arweave.big.winstonToBIG(transaction.reward)} BIG
                Mevcut: ${arweave.big.winstonToBIG(balance)} BIG
                Lütfen önce cüzdanı fonlayın.`);
        }

        // Dosya türünü belirle
        const fileType = imagePath.split('.').pop().toLowerCase();
        transaction.addTag('Network', 'bigfile.V.1.testnet');
        transaction.addTag('Content-Type', `image/${fileType}`);
        transaction.addTag('App-Name', 'BigFileTest');
        transaction.addTag('Type', 'Image');
        transaction.addTag('Version', '5');
        transaction.addTag('Release', '78');
        transaction.addTag('File-Type', fileType);
        transaction.addTag('Upload-Date', new Date().toISOString());

        // İşlemi imzala
        await arweave.transactions.sign(transaction, wallet);

        console.log('\nTransaction Bilgileri:');
        console.log('------------------------');
        console.log('Transaction ID:', transaction.id);
        console.log('İşlem Ücreti:', arweave.big.winstonToBIG(transaction.reward), 'BIG');
        console.log('Data Size:', transaction.data_size);

        // İşlemi gönder
        console.log('\nİşlem gönderiliyor...');
        const response = await arweave.transactions.post(transaction);

        console.log('\nSonuç:');
        console.log('------------------------');
        console.log('TX ID:', transaction.id);
        console.log('Status:', response.status);
        
        if (response.status === 200 || response.status === 202) {
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

            // İşlem durumunu kontrol et
            let status;
            let retries = 10;
            while (retries > 0) {
                status = await arweave.transactions.getStatus(transaction.id);
                if (status.status === 200) break;
                console.log(`İşlem durumu kontrol ediliyor... (${retries} deneme kaldı)`);
                await new Promise(r => setTimeout(r, 2000));
                retries--;
            }

            console.log('\nİşlem durumu:', status.status);
            if (status.confirmed) {
                console.log('Blok Yüksekliği:', status.confirmed.block_height);
                console.log('Onay Sayısı:', status.confirmed.number_of_confirmations);
            }
        } else {
            console.error('Sunucu Yanıtı:', response.data);
            console.error('\nHata Detayları:');
            console.error('------------------------');
            console.error('Transaction ID:', transaction.id);
            console.error('Data Size:', transaction.data_size);
            console.error('Reward:', arweave.big.winstonToBIG(transaction.reward), 'BIG');
            throw new Error('İşlem başarısız oldu');
        }
        
    } catch (error) {
        console.error('\nResim Yükleme Hatası:', error.message);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

// Komut satırından resim yolu al
const imagePath = process.argv[2] || 'test.png';
uploadImage(imagePath); 