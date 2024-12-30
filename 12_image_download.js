const arweave = require('./config.js');
const fs = require('fs');

async function downloadImage(txId, outputPath) {
    try {
        console.log('\nResim İndirme:');
        console.log('------------------------');
        console.log('TX ID:', txId);

        // Transaction bilgilerini al
        const tx = await arweave.transactions.get(txId);
        if (!tx) {
            throw new Error('Transaction bulunamadı');
        }

        // Tag'leri kontrol et
        const tags = {};
        tx.get('tags').forEach(tag => {
            const key = tag.get('name', { decode: true, string: true });
            const value = tag.get('value', { decode: true, string: true });
            tags[key] = value;
        });

        console.log('\nDosya Bilgileri:');
        console.log('------------------------');
        console.log('Boyut:', tx.data_size, 'bytes');
        console.log('Tür:', tags['Content-Type'] || 'bilinmiyor');

        // Veriyi indir
        console.log('\nDosya indiriliyor...');
        const data = await arweave.transactions.getData(txId, {
            decode: true,
            string: false
        });

        // Buffer'a çevir ve kaydet
        const buffer = Buffer.from(data);
        fs.writeFileSync(outputPath, buffer);

        console.log('\nİndirme tamamlandı!');
        console.log('------------------------');
        console.log('Kayıt yolu:', outputPath);
        console.log('Dosya boyutu:', buffer.length, 'bytes');

        // Dosya türünü kontrol et
        const fileType = tags['Content-Type'];
        if (fileType && fileType.startsWith('image/')) {
            console.log('Görüntü türü:', fileType);
        }

    } catch (error) {
        console.error('\nHata:', error);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

// Örnek kullanım:
const txId = process.argv[2]; // Terminal'den TX ID al
const outputPath = process.argv[3] || './downloaded_image.png'; // Varsayılan kayıt yolu

if (!txId) {
    console.error('\nHata: TX ID belirtilmedi');
    console.log('Kullanım: node 12_image_download.js <TX_ID> [KAYIT_YOLU]');
    process.exit(1);
}

downloadImage(txId, outputPath); 