const arweave = require('./config.js');
const fs = require('fs');

async function checkBalance() {
    try {
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        const address = await arweave.wallets.jwkToAddress(wallet);
        
        console.log('\nCüzdan Bilgileri:');
        console.log('------------------------');
        console.log('Adres:', address);
        
        // Bakiye kontrolü
        const balance = await arweave.wallets.getBalance(address);
        console.log('Bakiye:', arweave.ar.winstonToAr(balance), 'AR');
        
        // Son işlemleri kontrol et
        try {
            const query = {
                op: 'and',
                expr1: {
                    op: 'equals',
                    expr1: 'from',
                    expr2: address
                },
                expr2: {
                    op: 'equals',
                    expr1: 'Network',
                    expr2: 'BigFile.V1'
                }
            };
            
            const txs = await arweave.arql(query);
            console.log('\nSon İşlemler:', txs.length ? txs : 'İşlem bulunamadı');
            
        } catch (err) {
            console.log('\nİşlem sorgusu başarısız:', err.message);
        }
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

checkBalance(); 