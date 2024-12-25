const arweave = require('./config.js');

async function checkTransaction(txId) {
    try {
        console.log('\nİşlem Kontrol:');
        console.log('------------------------');
        console.log('İşlem ID:', txId);

        // İşlem durumunu kontrol et
        const status = await arweave.transactions.getStatus(txId);
        console.log('\nDurum Bilgisi:');
        console.log('------------------------');
        console.log('Status Code:', status.status);
        
        if (status.confirmed) {
            console.log('Blok Yüksekliği:', status.confirmed.block_height);
            console.log('Onay Sayısı:', status.confirmed.number_of_confirmations);
        }

        try {
            // İşlem detaylarını al
            const tx = await arweave.transactions.get(txId);
            console.log('\nİşlem Detayları:');
            console.log('------------------------');
            console.log('Gönderen:', await arweave.wallets.ownerToAddress(tx.owner));
            
            // Tag'leri kontrol et
            const tags = {};
            tx.get('tags').forEach(tag => {
                const key = tag.get('name', { decode: true, string: true });
                const value = tag.get('value', { decode: true, string: true });
                tags[key] = value;
            });
            
            console.log('\nTag Bilgileri:');
            console.log('------------------------');
            console.log(tags);
            
            // İşlem tipine göre detayları göster
            if (tags['Type'] === 'Transfer') {
                console.log('\nTransfer Detayları:');
                console.log('------------------------');
                console.log('Alıcı:', tx.target);
                console.log('Miktar:', arweave.ar.winstonToAr(tx.quantity), 'AR');
            } else {
                console.log('\nVeri Detayları:');
                console.log('------------------------');
                console.log('Veri Boyutu:', tx.data_size, 'bytes');
                if (tags['Content-Type'] === 'application/json') {
                    const data = tx.get('data', { decode: true, string: true });
                    console.log('JSON Veri:', JSON.parse(data));
                }
            }
            
            console.log('\nMaliyet Bilgileri:');
            console.log('------------------------');
            console.log('İşlem Ücreti:', arweave.ar.winstonToAr(tx.reward), 'AR');
            
            // Erişim URL'i
            console.log('\nVeri Erişim:');
            console.log('------------------------');
            console.log('URL:', `https://thebigfile.info:1984/${txId}`);
            
        } catch (txError) {
            console.log('\nİşlem detayları henüz hazır değil');
            console.log('Hata:', txError.message);
        }
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

// Son işlem ID'sini buraya yapıştırın
const txId = 'FaiGT0SW53EhEbzhgOi5LTAphHh1uAu2nUu8mdjvmhs';
checkTransaction(txId); 