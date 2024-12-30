const arweave = require('./config.js');
const fs = require('fs');

async function verifyAndDownload(txId) {
    try {
        // İşlem durumunu kontrol et
        const status = await arweave.transactions.getStatus(txId);
        if (status.status !== 200) {
            throw new Error(`İşlem henüz onaylanmamış. Status: ${status.status}`);
        }

        // Transaction bilgilerini al
        const tx = await arweave.transactions.get(txId);
        const tags = {};
        tx.get('tags').forEach(tag => {
            const key = tag.get('name', { decode: true, string: true });
            const value = tag.get('value', { decode: true, string: true });
            tags[key] = value;
        });

        // Dosya türünü belirle
        const contentType = tags['Content-Type'];
        const extension = contentType ? contentType.split('/')[1] : 'png';
        const outputPath = `./downloaded_${txId.slice(0,8)}.${extension}`;

        console.log('\nDosya Bilgileri:');
        console.log('------------------------');
        console.log('TX ID:', txId);
        console.log('Boyut:', tx.data_size, 'bytes');
        console.log('Tür:', contentType);
        console.log('Owner:', await arweave.wallets.ownerToAddress(tx.owner));

        // Veriyi indir
        console.log('\nDosya indiriliyor...');
        const data = await arweave.transactions.getData(txId, {
            decode: true,
            string: false
        });

        // Dosyayı kaydet
        const buffer = Buffer.from(data);
        fs.writeFileSync(outputPath, buffer);

        console.log('\nİndirme Tamamlandı!');
        console.log('------------------------');
        console.log('Kayıt yolu:', outputPath);
        console.log('Dosya boyutu:', buffer.length, 'bytes');
        console.log('İşlem URL:', `http://213.239.206.178:1984/${txId}`);

        // Dosya bütünlüğünü kontrol et
        if (buffer.length === tx.data_size) {
            console.log('Dosya bütünlüğü: OK');
        } else {
            console.warn('Uyarı: Dosya boyutu eşleşmiyor!');
        }

    } catch (error) {
        console.error('\nHata:', error.message);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

// TX ID'yi komut satırından al
const txId = process.argv[2] || 'Db_lpeWjUvDj_gRLJ4NnuL6cqU9ckGlWAXKrogXRCb4';

if (!txId) {
    console.error('\nHata: TX ID belirtilmedi');
    console.log('Kullanım: node 12_image_verify.js <TX_ID>');
    process.exit(1);
}

verifyAndDownload(txId); 