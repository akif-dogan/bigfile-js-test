const arweave = require('./config.js');
const fs = require('fs');

async function testLargeFileUpload(filePath) {
    try {
        console.log('\nBüyük Dosya Transfer Testi:');
        console.log('------------------------');
        
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        const fileData = fs.readFileSync(filePath);
        
        console.log('Dosya Boyutu:', (fileData.length / (1024 * 1024)).toFixed(2), 'MB');
        
        const startTime = Date.now();
        
        // Transaction oluştur
        console.log('\nİşlem oluşturuluyor...');
        const transaction = await arweave.createTransaction({
            data: fileData
        }, wallet);
        
        transaction.addTag('Content-Type', 'application/octet-stream');
        transaction.addTag('App-Name', 'LargeFileTest');
        transaction.addTag('File-Size', fileData.length.toString());
        
        // İşlem ücretini hesapla
        console.log('İşlem Ücreti:', arweave.ar.winstonToAr(transaction.reward), 'AR');
        
        // İşlemi imzala
        console.log('İşlem imzalanıyor...');
        await arweave.transactions.sign(transaction, wallet);
        
        // Chunk chunk yükle
        console.log('\nDosya yükleniyor...');
        let uploader = await arweave.transactions.getUploader(transaction);
        const totalChunks = uploader.totalChunks;
        const chunkSize = Math.ceil(fileData.length / totalChunks);
        
        while (!uploader.isComplete) {
            await uploader.uploadChunk();
            const uploadedSize = (uploader.uploadedChunks * chunkSize) / (1024 * 1024);
            console.log(`Yükleme: ${uploader.pctComplete}% tamamlandı`);
            console.log(`Yüklenen: ${uploadedSize.toFixed(2)}MB / ${(fileData.length / (1024 * 1024)).toFixed(2)}MB`);
            
            // Her chunk sonrası 500ms bekle (hızı artırmak için)
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const totalTime = (Date.now() - startTime) / 1000;
        const speedMBps = (fileData.length / (1024 * 1024)) / totalTime;
        
        console.log('\nTest Sonuçları:');
        console.log('------------------------');
        console.log('İşlem ID:', transaction.id);
        console.log('Toplam Süre:', totalTime.toFixed(2), 'saniye');
        console.log('Ortalama Hız:', speedMBps.toFixed(2), 'MB/s');
        console.log('URL:', `http://thebigfile.info:1984/${transaction.id}`);
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

// Test için 10MB'lık rastgele bir dosya oluştur
const testFile = './test_large_file';
const fileSize = 10 * 1024 * 1024; // 10MB
fs.writeFileSync(testFile, Buffer.alloc(fileSize));

testLargeFileUpload(testFile); 