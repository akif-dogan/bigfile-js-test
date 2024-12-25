const arweave = require('./config.js');
const fs = require('fs');

async function testPathManifest() {
    try {
        console.log('\nPath Manifest Testi:');
        console.log('------------------------');
        
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        
        // Manifest oluştur
        const manifest = {
            manifest: 'arweave/paths',
            version: '0.1.0',
            index: {
                path: 'index.html'
            },
            paths: {
                'index.html': {
                    'id': '' // HTML işlem ID'si
                },
                'style.css': {
                    'id': '' // CSS işlem ID'si
                },
                'app.js': {
                    'id': '' // JS işlem ID'si
                }
            }
        };

        // Dosyaları yükle
        const files = {
            'index.html': '<html><head><link rel="stylesheet" href="style.css"></head><body><script src="app.js"></script></body></html>',
            'style.css': 'body { background: #f0f0f0; }',
            'app.js': 'console.log("BigFile Test App");'
        };

        // Her dosyayı ayrı ayrı yükle
        for (let [filename, content] of Object.entries(files)) {
            const tx = await arweave.createTransaction({
                data: Buffer.from(content)
            }, wallet);

            tx.addTag('Content-Type', getMimeType(filename));
            await arweave.transactions.sign(tx, wallet);
            await arweave.transactions.post(tx);

            manifest.paths[filename].id = tx.id;
            console.log(`${filename} yüklendi:`, tx.id);
        }

        // Manifest'i yükle
        const manifestTx = await arweave.createTransaction({
            data: JSON.stringify(manifest)
        }, wallet);

        manifestTx.addTag('Content-Type', 'application/x.arweave-manifest+json');
        await arweave.transactions.sign(manifestTx, wallet);
        await arweave.transactions.post(manifestTx);

        console.log('\nManifest yüklendi:', manifestTx.id);
        console.log('URL:', `https://thebigfile.info:1984/${manifestTx.id}`);
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

function getMimeType(filename) {
    const ext = filename.split('.').pop();
    const types = {
        'html': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript'
    };
    return types[ext] || 'text/plain';
}

testPathManifest(); 