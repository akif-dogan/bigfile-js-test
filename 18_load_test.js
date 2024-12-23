const arweave = require('./config.js');
const fs = require('fs');

async function testLoadHandling() {
    try {
        console.log('\nYük Testi:');
        console.log('------------------------');
        
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        const startTime = Date.now();
        
        // Paralel işlem gönderimi
        const promises = [];
        const TOTAL_TRANSACTIONS = 10;
        
        console.log(`${TOTAL_TRANSACTIONS} paralel işlem gönderiliyor...`);
        
        for(let i = 0; i < TOTAL_TRANSACTIONS; i++) {
            const data = {
                test_id: `load_test_${i}`,
                timestamp: Date.now(),
                data: 'x'.repeat(1000) // 1KB veri
            };
            
            const promise = (async () => {
                const tx = await arweave.createTransaction({
                    data: Buffer.from(JSON.stringify(data))
                }, wallet);
                
                tx.addTag('App-Name', 'LoadTest');
                tx.addTag('Test-Number', i.toString());
                
                await arweave.transactions.sign(tx, wallet);
                const response = await arweave.transactions.post(tx);
                
                return {
                    id: tx.id,
                    status: response.status,
                    time: Date.now() - startTime
                };
            })();
            
            promises.push(promise);
        }
        
        const results = await Promise.allSettled(promises);
        
        console.log('\nTest Sonuçları:');
        console.log('------------------------');
        console.log('Başarılı İşlemler:', results.filter(r => r.status === 'fulfilled').length);
        console.log('Başarısız İşlemler:', results.filter(r => r.status === 'rejected').length);
        console.log('Toplam Süre:', (Date.now() - startTime)/1000, 'saniye');
        
        results.forEach((result, index) => {
            if(result.status === 'fulfilled') {
                console.log(`\nİşlem ${index + 1}:`, result.value);
            } else {
                console.log(`\nİşlem ${index + 1} Hatası:`, result.reason);
            }
        });
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

testLoadHandling(); 