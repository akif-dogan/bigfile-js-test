const arweave = require('./config.js');
const fs = require('fs');

async function testTransactionSpeed() {
    try {
        console.log('\nİşlem Hızı Testi:');
        console.log('------------------------');
        
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        const startTime = Date.now();
        
        // 5 ardışık işlem oluştur ve zamanla
        const transactions = [];
        
        for(let i = 0; i < 5; i++) {
            console.log(`\n${i+1}. İşlem Oluşturuluyor...`);
            
            const data = {
                test_id: `speed_test_${i}`,
                timestamp: Date.now()
            };
            
            const tx = await arweave.createTransaction({
                data: Buffer.from(JSON.stringify(data))
            }, wallet);
            
            tx.addTag('App-Name', 'SpeedTest');
            tx.addTag('Test-Number', i.toString());
            
            await arweave.transactions.sign(tx, wallet);
            const response = await arweave.transactions.post(tx);
            
            transactions.push({
                id: tx.id,
                status: response.status,
                time: Date.now() - startTime
            });
            
            console.log(`İşlem ID: ${tx.id}`);
            console.log(`Durum: ${response.status}`);
            console.log(`Geçen Süre: ${(Date.now() - startTime)/1000} saniye`);
        }
        
        console.log('\nTest Sonuçları:');
        console.log('------------------------');
        console.log('Toplam Süre:', (Date.now() - startTime)/1000, 'saniye');
        console.log('Ortalama İşlem Süresi:', ((Date.now() - startTime)/5000), 'saniye');
        console.log('İşlemler:', transactions);
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

testTransactionSpeed(); 