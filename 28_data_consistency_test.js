const arweave = require('./config.js');
const fs = require('fs');
const crypto = require('crypto');

async function verifyTxData(txId) {
    let retries = 20;
    const waitTime = 10000;
    
    while (retries > 0) {
        try {
            const status = await arweave.transactions.getStatus(txId);
            console.log(`İşlem Durumu: ${status.status}`);
            
            if (status.status === 200 && status.confirmed) {
                console.log(`Blok Yüksekliği: ${status.confirmed.block_height}`);
                console.log(`Onay Sayısı: ${status.confirmed.number_of_confirmations}`);
                
                if (status.confirmed.number_of_confirmations >= 2) {
                    try {
                        const data = await arweave.transactions.getData(txId, {
                            decode: true,
                            string: false
                        });
                        return data;
                    } catch (chunkError) {
                        console.log("Chunk hatası, gateway'e soruluyor...");
                        const response = await fetch(`http://thebigfile.info:1984/${txId}`);
                        if (!response.ok) throw new Error("Gateway yanıt vermedi");
                        const buffer = await response.arrayBuffer();
                        return Buffer.from(buffer);
                    }
                }
            }
            
            console.log(`Bekleniyor... (${retries} deneme kaldı)`);
            console.log("En az 2 blok onayı bekleniyor...");
            await new Promise(r => setTimeout(r, waitTime));
            retries--;
        } catch (err) {
            console.log(`Deneme ${21-retries}/20: Başarısız - ${err.message}`);
            retries--;
            if (retries === 0) throw err;
            await new Promise(r => setTimeout(r, waitTime));
        }
    }
    throw new Error("Veri alınamadı - Maksimum bekleme süresi aşıldı");
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function dataConsistencyTest() {
    try {
        console.log('\nVeri Tutarlılık Testi:');
        console.log('------------------------');
        
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        
        const testSizes = [512];
        
        for(let size of testSizes) {
            console.log(`\nTest: ${size/1024} KB Veri`);
            
            const data = crypto.randomBytes(size);
            const originalHash = crypto.createHash('sha256').update(data).digest('hex');
            
            const tx = await arweave.createTransaction({
                data: data
            }, wallet);
            
            tx.addTag('Test-Size', size.toString());
            tx.addTag('Original-Hash', originalHash);
            tx.addTag('Content-Type', 'application/octet-stream');
            tx.addTag('Test-Type', 'Data-Consistency');
            
            await arweave.transactions.sign(tx, wallet);
            const response = await arweave.transactions.post(tx);
            
            console.log('TX ID:', tx.id);
            console.log('Post Response:', response.status);
            
            console.log('Veri doğrulanıyor...');
            console.log('İşlem onayı bekleniyor (bu işlem birkaç dakika sürebilir)...');
            
            try {
                const verifiedData = await verifyTxData(tx.id);
                const verifyHash = crypto.createHash('sha256').update(verifiedData).digest('hex');
                
                console.log('\nDoğrulama Sonuçları:');
                console.log('Original Hash:', originalHash);
                console.log('Verify Hash:', verifyHash);
                console.log('Hash Eşleşmesi:', originalHash === verifyHash);
                
                if (originalHash !== verifyHash) {
                    console.error('HATA: Hash değerleri eşleşmiyor!');
                }
            } catch (err) {
                console.error('Veri Doğrulama Hatası:', err.message);
            }
            
            await sleep(30000);
        }
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

dataConsistencyTest(); 