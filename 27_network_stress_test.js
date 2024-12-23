const arweave = require('./config.js');
const fs = require('fs');

async function networkStressTest() {
    try {
        console.log('\nAğ Stres Testi:');
        console.log('------------------------');
        
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        
        // 1. Bağlantı Testi
        console.log('\n1. Bağlantı Testi:');
        const networkInfo = await arweave.network.getInfo();
        console.log('Ağ Durumu:', networkInfo);
        
        // 2. Paralel İşlem Testi
        console.log('\n2. Paralel İşlem Testi:');
        const parallelTxs = 20; // 20 paralel işlem
        const promises = [];
        
        for(let i = 0; i < parallelTxs; i++) {
            const promise = (async () => {
                const tx = await arweave.createTransaction({
                    data: `Test Data ${i}`
                }, wallet);
                
                await arweave.transactions.sign(tx, wallet);
                return arweave.transactions.post(tx);
            })();
            promises.push(promise);
        }
        
        const results = await Promise.allSettled(promises);
        console.log('Başarılı İşlemler:', results.filter(r => r.status === 'fulfilled').length);
        console.log('Başarısız İşlemler:', results.filter(r => r.status === 'rejected').length);
        
        // 3. Blok Üretim Hızı Testi
        console.log('\n3. Blok Üretim Testi:');
        const startBlock = await arweave.blocks.getCurrent();
        console.log('Başlangıç Blok:', startBlock.height);
        
        // 5 dakika bekle
        const BLOCK_TEST_DURATION = 300000; // 5 dakika
        await new Promise(resolve => setTimeout(resolve, BLOCK_TEST_DURATION));
        
        const endBlock = await arweave.blocks.getCurrent();
        console.log('Bitiş Blok:', endBlock.height);
        console.log('Blok Üretim Hızı:', (endBlock.height - startBlock.height), 'blok/dakika');
        
        // 4. Node Senkronizasyon Testi
        console.log('\n4. Node Senkronizasyon Testi:');
        const peers = await arweave.network.getPeers();
        for(let peer of peers) {
            try {
                const peerInfo = await arweave.api.get(`http://${peer}/info`);
                console.log(`Peer ${peer}:`, peerInfo.data.height);
            } catch (err) {
                console.log(`Peer ${peer}: Erişilemedi`);
            }
        }
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

networkStressTest(); 