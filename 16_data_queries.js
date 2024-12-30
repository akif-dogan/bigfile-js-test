const arweave = require('./config.js');

async function testQueries() {
    try {
        console.log('\nVeri Sorgulama Testi:');
        console.log('------------------------');

        // 1. Ağ durumunu al
        const networkInfo = await arweave.network.getInfo();
        console.log('\nAğ Durumu:');
        console.log('------------------------');
        console.log('Son Blok:', networkInfo.height);
        console.log('Peers:', networkInfo.peers);
        console.log('Kuyruk:', networkInfo.queue_length);
        console.log('Ağ:', networkInfo.network);
        console.log('Versiyon:', networkInfo.version);
        console.log('Release:', networkInfo.release);

        // 2. Son işlemleri kontrol et
        console.log('\nSon İşlemler:');
        console.log('------------------------');
        
        try {
            // Son bloğu almayı dene
            const block = await arweave.blocks.getCurrent();
            if (block && block.txs && block.txs.length > 0) {
                console.log('Blok Hash:', block.indep_hash);
                console.log('İşlem Sayısı:', block.txs.length);
                
                // Son 5 işlemi göster
                for (let i = 0; i < Math.min(5, block.txs.length); i++) {
                    try {
                        const txId = block.txs[i];
                        const tx = await arweave.transactions.get(txId);
                        const status = await arweave.transactions.getStatus(txId);
                        
                        const tags = {};
                        tx.get('tags').forEach(tag => {
                            const key = tag.get('name', { decode: true, string: true });
                            const value = tag.get('value', { decode: true, string: true });
                            tags[key] = value;
                        });

                        console.log('\nİşlem:', txId);
                        console.log('Durum:', status.status);
                        console.log('Tip:', tags['Content-Type'] || 'Belirtilmemiş');
                        console.log('Boyut:', tx.data_size, 'bytes');
                    } catch (txError) {
                        console.log('\nİşlem bilgisi alınamadı:', txError.message);
                    }
                }
            } else {
                console.log('Blokta işlem bulunamadı');
            }
        } catch (blockError) {
            console.log('Blok bilgisi alınamadı:', blockError.message);
        }

        // 3. Node durumu
        console.log('\nNode Durumu:');
        console.log('------------------------');
        console.log('Toplam Blok:', networkInfo.blocks);
        console.log('Node State Latency:', networkInfo.node_state_latency);
        console.log('Mine Rate:', networkInfo.mine_rate);

    } catch (error) {
        console.error('\nHata:', error);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

testQueries(); 