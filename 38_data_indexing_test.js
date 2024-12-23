const arweave = require('./config.js');
const fs = require('fs');

async function testDataIndexing() {
    try {
        console.log('\nVeri İndeksleme Testi:');
        console.log('------------------------');
        
        // Node bilgisini al
        const info = await arweave.network.getInfo();
        console.log('Node Bilgisi:', info);
        
        // Son blok bilgilerini al
        const currentBlock = info.height;
        console.log('\nBlok Bilgileri:');
        console.log('------------------------');
        console.log('Son Blok:', currentBlock);
        
        // Bilinen işlemleri kontrol et
        const knownTxs = [
            // Son başarılı işlemlerimizden birkaçını buraya ekleyelim
            'TRANSACTION_ID_1',
            'TRANSACTION_ID_2',
            'TRANSACTION_ID_3'
        ];
        
        console.log('\nİşlem Kontrolleri:');
        console.log('------------------------');
        
        const transactions = [];
        
        for (let txId of knownTxs) {
            try {
                const status = await arweave.transactions.getStatus(txId);
                if (status.status === 200 || status.status === 202) {
                    const tx = await arweave.transactions.get(txId);
                    const txInfo = {
                        id: txId,
                        status: status.status,
                        confirmed: status.confirmed,
                        tags: {}
                    };
                    
                    // Tag'leri parse et
                    tx.get('tags').forEach(tag => {
                        const key = tag.get('name', { decode: true, string: true });
                        const value = tag.get('value', { decode: true, string: true });
                        txInfo.tags[key] = value;
                    });
                    
                    transactions.push(txInfo);
                    console.log('\nİşlem Detayı:', txInfo);
                    
                    if (status.confirmed) {
                        console.log('Blok Yüksekliği:', status.confirmed.block_height);
                        console.log('Onay Sayısı:', status.confirmed.number_of_confirmations);
                    }
                }
            } catch (err) {
                console.log(`${txId} için hata:`, err.message);
            }
        }
        
        // İstatistikler
        const stats = {
            total: transactions.length,
            confirmed: transactions.filter(tx => tx.status === 200).length,
            pending: transactions.filter(tx => tx.status === 202).length,
            byType: {}
        };
        
        // İşlem tiplerini say
        transactions.forEach(tx => {
            const type = tx.tags.Type || 'Unknown';
            stats.byType[type] = (stats.byType[type] || 0) + 1;
        });
        
        console.log('\nİstatistikler:');
        console.log('------------------------');
        console.log('Toplam İşlem:', stats.total);
        console.log('Onaylanmış:', stats.confirmed);
        console.log('Bekleyen:', stats.pending);
        console.log('Tiplerine Göre:', stats.byType);
        
    } catch (error) {
        console.error('\nHata:', error);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

// Son başarılı işlemlerimizden birini kontrol edelim
const lastSuccessfulTx = process.argv[2] || 'DEFAULT_TX_ID';
testDataIndexing([lastSuccessfulTx]); 