const arweave = require('./config.js');
const fs = require('fs');

async function deployPermawebApp() {
    try {
        console.log('\nPermaweb Uygulama Testi:');
        console.log('------------------------');
        
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        
        // HTML içeriği
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>BigFile Test App</title>
        </head>
        <body>
            <h1>BigFile Test Application</h1>
            <p>This is a permanent web application on BigFile network.</p>
            <script>
                console.log("BigFile Test App Running");
            </script>
        </body>
        </html>`;
        
        // HTML'i yükle
        const tx = await arweave.createTransaction({
            data: html
        }, wallet);
        
        tx.addTag('Content-Type', 'text/html');
        tx.addTag('App-Name', 'BigFileTestApp');
        tx.addTag('App-Version', '1.0.0');
        tx.addTag('Unix-Time', Date.now());
        
        await arweave.transactions.sign(tx, wallet);
        await arweave.transactions.post(tx);
        
        console.log('\nUygulama Yüklendi:');
        console.log('TX ID:', tx.id);
        console.log('URL:', `http://thebigfile.info:1984/${tx.id}`);
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

deployPermawebApp(); 