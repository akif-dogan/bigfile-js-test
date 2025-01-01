const arweave = require('./config.js');
const fs = require('fs');

async function checkWallet2Balance() {
    try {
        // Wallet2'yi yükle
        const wallet2 = JSON.parse(fs.readFileSync('wallet2.json'));
        const address = await arweave.wallets.jwkToAddress(wallet2);
        
        // Node durumunu kontrol et
        const networkInfo = await arweave.network.getInfo();
        console.log('\nNode Durumu:');
        console.log('------------------------');
        console.log('Network:', networkInfo.network);
        console.log('Height:', networkInfo.height);
        console.log('Current:', networkInfo.current);
        
        // Bakiye kontrolü
        const balance = await arweave.wallets.getBalance(address);
        const ar = arweave.ar.winstonToAr(balance);
        
        console.log('\nWallet2 Bilgileri:');
        console.log('------------------------');
        console.log('Adres:', address);
        console.log('Bakiye:', ar, 'AR');
        console.log('Bakiye (winston):', balance);
        
        // Son işlemleri kontrol et
        console.log('\nSon İşlemler:');
        console.log('------------------------');
        const txs = await arweave.arql({
            op: 'equals',
            expr1: 'from',
            expr2: address
        });
        
        if (txs.length > 0) {
            console.log('Son', Math.min(5, txs.length), 'işlem:');
            for (let i = 0; i < Math.min(5, txs.length); i++) {
                console.log(`${i + 1}. TX ID:`, txs[i]);
            }
        } else {
            console.log('Henüz işlem yapılmamış.');
        }

    } catch (error) {
        console.error('\nHata:', error);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

checkWallet2Balance(); 