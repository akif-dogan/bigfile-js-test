const arweave = require('./config.js');
const fs = require('fs');

async function fundWallet() {
    try {
        console.log('\nCüzdan Fonlama:');
        console.log('------------------------');
        
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        const address = await arweave.wallets.jwkToAddress(wallet);
        
        // Önce ağ bilgisini al
        const networkInfo = await arweave.network.getInfo();
        console.log('Ağ:', networkInfo);
        
        // Mining reward talep et
        const minerTx = await arweave.createTransaction({
            target: address,
            quantity: arweave.ar.arToWinston('100'),
            data: Buffer.from('Mining Reward Request')
        });
        
        // Tag'leri ekle
        minerTx.addTag('App-Name', 'BigFileTest');
        minerTx.addTag('Type', 'Miner-Reward');
        minerTx.addTag('Version', '1.0');
        
        await arweave.transactions.sign(minerTx, wallet);
        
        console.log('\nİşlem Detayları:');
        console.log('------------------------');
        console.log('TX ID:', minerTx.id);
        console.log('Hedef:', address);
        console.log('Miktar:', '100 AR');
        
        const response = await arweave.transactions.post(minerTx);
        console.log('\nSonuç:');
        console.log('------------------------');
        console.log('Status:', response.status);
        
        if (response.status === 200) {
            console.log('İşlem başarıyla gönderildi');
            console.log('Bakiye güncellemesi için bekleyin...');
        } else {
            throw new Error(`İşlem başarısız: ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('\nFonlama Hatası:', error.message);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

fundWallet(); 