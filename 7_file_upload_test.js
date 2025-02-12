const arweave = require('./config.js');
const fs = require('fs');

async function uploadFile(filePath) {
    try {
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        
        // Dosyayı oku
        const fileData = fs.readFileSync(filePath);
        
        // Dosya türünü belirle
        const fileType = filePath.split('.').pop();
        
        // İşlemi oluştur
        const transaction = await arweave.createTransaction({
            data: fileData
        }, wallet);
        
        // Dosya bilgilerini tag olarak ekle
        transaction.addTag('Content-Type', `file/${fileType}`);
        transaction.addTag('File-Name', filePath.split('/').pop());
        transaction.addTag('Upload-Date', new Date().toISOString());
        
        // İşlem maliyetini hesapla
        console.log('Dosya Boyutu:', fileData.length, 'bytes');
        console.log('İşlem Ücreti:', arweave.big.winstonToBIG(transaction.reward), 'BIG');
        
        // İşlemi imzala
        await arweave.transactions.sign(transaction, wallet);
        
        // İşlemi gönder
        const uploader = await arweave.transactions.getUploader(transaction);
        
        while (!uploader.isComplete) {
            await uploader.uploadChunk();
            console.log(`Yükleme: ${uploader.pctComplete}% tamamlandı`);
        }
        
        console.log('Dosya Yükleme İşlem ID:', transaction.id);
        
    } catch (error) {
        console.error('Dosya yükleme hatası:', error);
    }
}

// Test için bir dosya yolu belirtin
uploadFile('./test.txt'); 