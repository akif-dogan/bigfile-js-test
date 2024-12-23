const arweave = require('./config.js');
const fs = require('fs');

async function testANS104() {
    try {
        console.log('\nANS-104 Testi:');
        console.log('------------------------');
        
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        
        // Büyük veri oluştur
        const data = Buffer.alloc(1024 * 1024); // 1MB
        
        // ANS-104 formatında işlem oluştur
        const tx = await arweave.createTransaction({
            data: data
        }, wallet);
        
        tx.addTag('Protocol', 'ANS-104');
        tx.addTag('Content-Type', 'application/octet-stream');
        
        // Chunk bilgilerini hesapla
        const chunks = Math.ceil(data.length / (256 * 1024));
        tx.addTag('Chunks', chunks.toString());
        
        await arweave.transactions.sign(tx, wallet);
        
        // Chunk chunk yükle
        let uploader = await arweave.transactions.getUploader(tx);
        
        while (!uploader.isComplete) {
            await uploader.uploadChunk();
            console.log(`Yükleme: ${uploader.pctComplete}%`);
        }
        
        console.log('İşlem ID:', tx.id);
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

testANS104(); 