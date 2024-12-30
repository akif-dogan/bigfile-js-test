const arweave = require('./config.js');
const fs = require('fs');
const https = require('https');

async function verifySvgDownload(txId, originalFilePath) {
    try {
        console.log('\nSVG Doğrulama Testi:');
        console.log('------------------------');

        // Orijinal dosyayı oku
        const originalSvg = fs.readFileSync(originalFilePath, 'utf8');
        console.log('Orijinal SVG boyutu:', originalSvg.length, 'bytes');

        // Transaction detaylarını al
        const tx = await arweave.transactions.get(txId);
        console.log('\nTransaction Bilgileri:');
        console.log('------------------------');
        
        // Tag'leri kontrol et
        const tags = {};
        tx.get('tags').forEach(tag => {
            const key = tag.get('name', { decode: true, string: true });
            const value = tag.get('value', { decode: true, string: true });
            tags[key] = value;
        });
        console.log('Content-Type:', tags['Content-Type']);
        console.log('File-Type:', tags['File-Type']);

        // SVG'yi indir
        console.log('\nSVG indiriliyor...');
        const downloadedSvg = await downloadSvg(txId);
        
        // İndirilen dosyayı kaydet
        const downloadPath = `downloaded_${txId}.svg`;
        fs.writeFileSync(downloadPath, downloadedSvg);
        console.log('İndirilen SVG kaydedildi:', downloadPath);

        // Dosyaları karşılaştır
        console.log('\nDoğrulama:');
        console.log('------------------------');
        console.log('Orijinal boyut:', originalSvg.length, 'bytes');
        console.log('İndirilen boyut:', downloadedSvg.length, 'bytes');
        
        const isIdentical = originalSvg === downloadedSvg;
        console.log('Dosyalar aynı mı?:', isIdentical ? 'EVET ✅' : 'HAYIR ❌');

        if (!isIdentical) {
            console.log('\nFarklar:');
            console.log('------------------------');
            compareSvgFiles(originalSvg, downloadedSvg);
        }

        return isIdentical;

    } catch (error) {
        console.error('\nHata:', error);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
        return false;
    }
}

function downloadSvg(txId) {
    return new Promise((resolve, reject) => {
        const url = `https://thebigfile.info:1984/${txId}`;
        
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve(data);
            });
            
        }).on('error', (err) => {
            reject(err);
        });
    });
}

function compareSvgFiles(original, downloaded) {
    // Basit fark analizi
    if (original.length !== downloaded.length) {
        console.log('Boyut farkı:', Math.abs(original.length - downloaded.length), 'bytes');
    }

    // İlk farklı karakteri bul
    for (let i = 0; i < Math.min(original.length, downloaded.length); i++) {
        if (original[i] !== downloaded[i]) {
            console.log('İlk fark pozisyonu:', i);
            console.log('Orijinal:', original.slice(i, i + 50));
            console.log('İndirilen:', downloaded.slice(i, i + 50));
            break;
        }
    }
}

// Kullanım parametreleri
const txId = process.argv[2];
const originalFilePath = process.argv[3] || './testsvg.svg';

if (!txId) {
    console.error('Lütfen transaction ID belirtin:');
    console.error('npm run verify-svg TX_ID [orijinal_dosya_yolu]');
    process.exit(1);
}

verifySvgDownload(txId, originalFilePath); 