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
        console.log('\nAğ Bilgileri:');
        console.log('------------------------');
        console.log('Network:', networkInfo.network);
        console.log('Version:', networkInfo.version);
        console.log('Release:', networkInfo.release);
        console.log('Height:', networkInfo.height);
        
        // Mevcut bakiyeyi kontrol et
        const currentBalance = await arweave.wallets.getBalance(address);
        console.log('\nMevcut Bakiye:', arweave.big.winstonToBIG(currentBalance), 'BIG');
        
        // Mining reward talep et (2 milyar BIG)
        const minerTx = await arweave.createTransaction({
            target: address,
            quantity: arweave.big.BIGToWinston('2000000000'),
            data: Buffer.from('Mining Reward Request')
        }, wallet);
        
        // Tag'leri ekle
        minerTx.addTag('App-Name', 'BigFileTest');
        minerTx.addTag('Type', 'Miner-Reward');
        minerTx.addTag('Network', 'bigfile.V.1.testnet');
        minerTx.addTag('Version', '5');
        minerTx.addTag('Release', '78');
        
        await arweave.transactions.sign(minerTx, wallet);
        
        console.log('\nİşlem Detayları:');
        console.log('------------------------');
        console.log('TX ID:', minerTx.id);
        console.log('Hedef:', address);
        console.log('Miktar:', '2000000000 BIG');
        
        const response = await arweave.transactions.post(minerTx);
        console.log('\nSonuç:');
        console.log('------------------------');
        console.log('Status:', response.status);
        
        if (response.status === 200) {
            console.log('İşlem başarıyla gönderildi');
            console.log('URL:', `https://thebigfile.info:1984/${minerTx.id}`);
            console.log('\nBakiye güncellemesi için bekleyin...');
            
            // Bakiye güncellemesini bekle
            let newBalance;
            let retries = 10;
            while (retries > 0) {
                await new Promise(r => setTimeout(r, 2000));
                newBalance = await arweave.wallets.getBalance(address);
                if (newBalance !== currentBalance) break;
                console.log(`Bakiye kontrol ediliyor... (${retries} deneme kaldı)`);
                retries--;
            }
            
            if (newBalance !== currentBalance) {
                console.log('\nYeni Bakiye:', arweave.big.winstonToBIG(newBalance), 'BIG');
            }
        } else {
            throw new Error(`İşlem başarısız: ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('\nHata:', error);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

fundWallet(); 