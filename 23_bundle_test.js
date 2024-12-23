const arweave = require('./config.js');
const fs = require('fs');

async function testBundleOperations() {
    try {
        console.log('\nBundle İşlemleri Testi:');
        console.log('------------------------');
        
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        
        // Birden fazla veri hazırla
        const items = [
            { data: 'Veri 1', tags: [{ name: 'Type', value: 'Test1' }] },
            { data: 'Veri 2', tags: [{ name: 'Type', value: 'Test2' }] },
            { data: 'Veri 3', tags: [{ name: 'Type', value: 'Test3' }] }
        ];
        
        // Bundle oluştur
        const bundleTx = await arweave.createTransaction({
            data: Buffer.from('Bundle Data')
        }, wallet);
        
        bundleTx.addTag('Bundle-Format', 'binary');
        bundleTx.addTag('Bundle-Version', '2.0.0');
        
        // Her veriyi bundle'a ekle
        for (let item of items) {
            const itemTx = await arweave.createTransaction({
                data: item.data
            }, wallet);
            
            for (let tag of item.tags) {
                itemTx.addTag(tag.name, tag.value);
            }
            
            await arweave.transactions.sign(itemTx, wallet);
            // Bundle'a ekle
            // Not: Gerçek bundle işlemi için arweave-bundles paketi gerekli
        }
        
        await arweave.transactions.sign(bundleTx, wallet);
        await arweave.transactions.post(bundleTx);
        
        console.log('Bundle ID:', bundleTx.id);
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

testBundleOperations(); 