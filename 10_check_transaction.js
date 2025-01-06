const arweave = require('./config.js');

async function checkTransaction(txId) {
    try {
        // Node durumunu kontrol et
        const networkInfo = await arweave.network.getInfo();
        console.log('\nNode Durumu:');
        console.log('------------------------');
        console.log('Height:', networkInfo.height);
        console.log('Current:', networkInfo.current);
        console.log('Network:', networkInfo.network);
        
        console.log('\nİşlem Kontrol:');
        console.log('------------------------');
        console.log('İşlem ID:', txId);

        // İşlem durumunu kontrol et
        const status = await arweave.transactions.getStatus(txId);
        console.log('\nDurum Bilgisi:');
        console.log('------------------------');
        console.log('Status Code:', status.status);
        
        switch (status.status) {
            case 200:
                console.log('Durum: İşlem onaylandı ve blok zincirine eklendi');
                break;
            case 202:
                console.log('Durum: İşlem havuzda, işleniyor');
                console.log('Lütfen birkaç dakika bekleyin...');
                return;
            case 404:
                console.log('Durum: İşlem bulunamadı');
                console.log('Node senkronizasyonu tamamlanana kadar bekleyin.');
                return;
            default:
                console.log('Durum: Beklenmeyen durum kodu');
                return;
        }
        
        try {
            // İşlem detaylarını al
            const tx = await arweave.transactions.get(txId);
            if (tx) {
                console.log('\nİşlem Detayları:');
                console.log('------------------------');
                console.log('Data Size:', tx.data_size, 'bytes');
                console.log('Owner:', await arweave.wallets.ownerToAddress(tx.owner));
                console.log('Reward:', arweave.ar.winstonToAr(tx.reward), 'AR');
                
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
                console.log(`http://65.108.0.39:1984/${txId}`);
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

// Kontrol edilecek işlem ID'si
const txId = process.argv[2] || 'f-g4FSNYQFeiC9nuaz51_0yNVBg7W9muWE2s6Mrwzbc';

if (!txId) {
    console.error('\nHata: TX ID belirtilmedi');
    console.log('Kullanım: npm run check-tx-status <TX_ID>');
    process.exit(1);
}

checkTransaction(txId); 