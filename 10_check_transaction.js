const arweave = require('./config.js');

async function checkTransaction(txId) {
    try {
        // İşlem durumunu kontrol et
        const status = await arweave.transactions.getStatus(txId);
        
        console.log('\nİşlem Durumu:');
        console.log('------------------------');
        console.log('Status:', status.status);
        
        if (status.status === 404) {
            console.log('\nİşlem henüz onaylanmamış veya bulunamadı');
            console.log('Lütfen birkaç dakika bekleyip tekrar deneyin');
            return;
        }
        
        if (status.confirmed) {
            console.log('\nOnay Bilgileri:');
            console.log('------------------------');
            console.log('Blok Yüksekliği:', status.confirmed.block_height);
            console.log('Onay Sayısı:', status.confirmed.number_of_confirmations);
        }
        
        try {
            // İşlem detaylarını al
            const tx = await arweave.transactions.get(txId);
            if (tx) {
                console.log('\nİşlem Detayları:');
                console.log('------------------------');
                console.log('Data Size:', tx.data_size, 'bytes');
                console.log('Owner:', await arweave.wallets.ownerToAddress(tx.owner));
                console.log('Reward:', arweave.big.winstonToBIG(tx.reward), 'BIG');
                
                // Tag'leri göster
                const tags = {};
                tx.get('tags').forEach(tag => {
                    const key = tag.get('name', { decode: true, string: true });
                    const value = tag.get('value', { decode: true, string: true });
                    tags[key] = value;
                });
                console.log('\nTag\'ler:', tags);

                // İşlem URL'ini göster
                console.log('\nİşlem URL:');
                console.log('------------------------');
                console.log(`https://thebigfile.info:1984/${txId}`);
            }
        } catch (txError) {
            console.log('\nİşlem detayları henüz hazır değil');
            console.log('Hata:', txError.message);
        }
        
    } catch (error) {
        console.error('\nHata:', error);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

// Kontrol edilecek işlem ID'sini parametre olarak al
const txId = process.argv[2];
if (!txId) {
    console.error('\nLütfen kontrol edilecek işlem ID\'sini belirtin');
    console.error('Örnek: node check_transaction.js TX_ID');
    process.exit(1);
}

checkTransaction(txId); 