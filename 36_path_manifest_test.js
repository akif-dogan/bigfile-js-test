const arweave = require('./config.js');
const fs = require('fs');

async function testPathManifest() {
    try {
        console.log('\nPath Manifest Testi:');
        console.log('------------------------');

        const wallet = JSON.parse(fs.readFileSync('wallet.json'));

        // HTML dosyası yükle
        const htmlTx = await arweave.createTransaction({
            data: '<html><body><h1>Test</h1></body></html>'
        }, wallet);
        htmlTx.addTag('Content-Type', 'text/html');
        await arweave.transactions.sign(htmlTx, wallet);
        await arweave.transactions.post(htmlTx);
        console.log('index.html yüklendi:', htmlTx.id);

        // CSS dosyası yükle
        const cssTx = await arweave.createTransaction({
            data: 'body { background: #f0f0f0; }'
        }, wallet);
        cssTx.addTag('Content-Type', 'text/css');
        await arweave.transactions.sign(cssTx, wallet);
        await arweave.transactions.post(cssTx);
        console.log('style.css yüklendi:', cssTx.id);

        // JS dosyası yükle
        const jsTx = await arweave.createTransaction({
            data: 'console.log("Test");'
        }, wallet);
        jsTx.addTag('Content-Type', 'application/javascript');
        await arweave.transactions.sign(jsTx, wallet);
        await arweave.transactions.post(jsTx);
        console.log('app.js yüklendi:', jsTx.id);

        // Manifest oluştur
        const manifest = {
            manifest: 'arweave/paths',
            version: '0.1.0',
            paths: {
                'index.html': {
                    'id': htmlTx.id
                },
                'style.css': {
                    'id': cssTx.id
                },
                'app.js': {
                    'id': jsTx.id
                }
            }
        };

        // Manifest'i yükle
        const manifestTx = await arweave.createTransaction({
            data: JSON.stringify(manifest)
        }, wallet);
        manifestTx.addTag('Content-Type', 'application/x.arweave-manifest+json');
        await arweave.transactions.sign(manifestTx, wallet);
        await arweave.transactions.post(manifestTx);

        console.log('\nManifest yüklendi:', manifestTx.id);
        console.log('URL:', `http://213.239.206.178:1984/${manifestTx.id}`);

    } catch (error) {
        console.error('\nHata:', error);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

testPathManifest(); 