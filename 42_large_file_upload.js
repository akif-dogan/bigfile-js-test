const arweave = require('./config.js');
const fs = require('fs');
const path = require('path');

async function uploadLargeFile() {
    try {
        console.log('\nBüyük Dosya Yükleme Testi:');
        console.log('------------------------');

        const filePath = './bitcoin.pdf';

        // Ana cüzdanı kullan
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        const address = await arweave.wallets.jwkToAddress(wallet);
        
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
        
        // Bakiye kontrolü
        const balance = await arweave.wallets.getBalance(address);
        console.log('Cüzdan Bakiyesi:', arweave.big.winstonToBIG(balance), 'BIG');

        // Dosya bilgilerini al
        const fileStats = fs.statSync(filePath);
        const fileName = path.basename(filePath);
        const fileSize = fileStats.size;
        const fileType = path.extname(filePath).slice(1);

        console.log('\nDosya Bilgileri:');
        console.log('------------------------');
        console.log('Dosya Adı:', fileName);
        console.log('Boyut:', (fileSize / (1024 * 1024)).toFixed(2), 'MB');
        console.log('Tür:', fileType);

        // Transaction oluştur
        console.log('\nTransaction hazırlanıyor...');
        const transaction = await arweave.createTransaction({
            data: fs.readFileSync(filePath)
        }, wallet);

        // Tag'leri ekle
        transaction.addTag('Network', 'bigfile.V.1.testnet');
        transaction.addTag('Content-Type', 'application/pdf');
        transaction.addTag('App-Name', 'BigFileTest');
        transaction.addTag('Type', 'LargeFile');
        transaction.addTag('File-Name', fileName);
        transaction.addTag('File-Size', fileSize.toString());
        transaction.addTag('File-Type', fileType);
        transaction.addTag('Upload-Date', new Date().toISOString());
        transaction.addTag('Version', '5');
        transaction.addTag('Release', '78');

        // İşlem maliyetini hesapla
        console.log('\nMaliyet Bilgileri:');
        console.log('------------------------');
        console.log('İşlem Ücreti:', arweave.big.winstonToBIG(transaction.reward), 'BIG');
        console.log('Dosya Boyutu:', fileSize, 'bytes');
        console.log('Chunk Size:', Math.ceil(fileSize / (256 * 1024)), 'chunks');

        // Kullanıcı onayı
        console.log('\nDevam etmek istiyor musunuz? (Y/N)');
        const response = await new Promise(resolve => {
            process.stdin.once('data', data => {
                resolve(data.toString().trim().toLowerCase());
            });
        });

        if (response !== 'y') {
            console.log('İşlem iptal edildi');
            return;
        }

        // İşlemi imzala
        await arweave.transactions.sign(transaction, wallet);
        
        // Chunk chunk yükleme başlat
        let uploader = await arweave.transactions.getUploader(transaction);
        console.log('\nDosya yükleniyor...');
        console.log('------------------------');

        // Progress bar için değişkenler
        let lastPct = 0;
        const progressBarWidth = 50;

        while (!uploader.isComplete) {
            await uploader.uploadChunk();
            
            // Progress bar güncelle
            const pct = uploader.pctComplete;
            if (pct > lastPct) {
                const filled = Math.floor((progressBarWidth * pct) / 100);
                const empty = progressBarWidth - filled;
                const progressBar = '█'.repeat(filled) + '░'.repeat(empty);
                
                process.stdout.write(`\rYükleme: [${progressBar}] ${pct.toFixed(2)}%`);
                lastPct = pct;
            }

            // Her chunk sonrası ağ durumunu kontrol et
            if (networkInfo.queue_length > 100) {
                // Eğer işlem kuyruğu çok uzunsa biraz bekle
                await new Promise(r => setTimeout(r, 2000));
            } else {
                await new Promise(r => setTimeout(r, 500));
            }
        }

        console.log('\n\nYükleme tamamlandı!');
        
        // İşlem durumunu kontrol et
        console.log('\nİşlem durumu kontrol ediliyor...');
        let status;
        let retries = 10;
        
        while (retries > 0) {
            status = await arweave.transactions.getStatus(transaction.id);
            if (status.status === 200) break;
            console.log(`Durum kontrolü... (${retries} deneme kaldı)`);
            await new Promise(r => setTimeout(r, 2000));
            retries--;
        }

        console.log('\nSonuç:');
        console.log('------------------------');
        console.log('İşlem ID:', transaction.id);
        console.log('Status:', status.status);
        console.log('URL:', `http://65.108.0.39:1984/${transaction.id}`);
        
        // İşlem detaylarını kaydet
        const txInfo = {
            id: transaction.id,
            fileName,
            fileSize,
            fileType,
            network: networkInfo.network,
            version: networkInfo.version,
            release: networkInfo.release,
            uploadDate: new Date().toISOString(),
            status: status.status
        };

        fs.writeFileSync(
            `tx_${transaction.id}.json`,
            JSON.stringify(txInfo, null, 2)
        );

        console.log('\nİşlem detayları kaydedildi:', `tx_${transaction.id}.json`);
        
    } catch (error) {
        console.error('\nHata:', error);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

uploadLargeFile(); 