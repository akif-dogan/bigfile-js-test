const arweave = require('./config.js');
const fs = require('fs');

async function checkWallet3Balance() {
    try {
        // Wallet3'ü yükle
        const wallet3 = JSON.parse(fs.readFileSync('wallet3.json'));
        const address = await arweave.wallets.jwkToAddress(wallet3);
        
        // Node durumunu kontrol et
        const networkInfo = await arweave.network.getInfo();
        console.log('\nNode Durumu:');
        console.log('------------------------');
        console.log('Network:', networkInfo.network);
        console.log('Blok Yüksekliği:', networkInfo.height);
        console.log('Current Block:', networkInfo.current);
        console.log('Release:', networkInfo.release);
        console.log('Version:', networkInfo.version);
        
        // Bakiye kontrolü
        const balance = await arweave.wallets.getBalance(address);
        const ar = arweave.ar.winstonToAr(balance);
        
        console.log('\nWallet3 Bilgileri:');
        console.log('------------------------');
        console.log('Adres:', address);
        console.log('Bakiye (AR):', ar);
        console.log('Bakiye (Winston):', balance);
        
        // Son blokları kontrol et
        console.log('\nSon Blok Bilgileri:');
        console.log('------------------------');
        try {
            const lastBlock = await arweave.blocks.get(networkInfo.current);
            console.log('Son Blok Hash:', lastBlock.indep_hash);
            console.log('Miner Address:', lastBlock.reward_addr);
            console.log('Block Reward:', arweave.ar.winstonToAr(lastBlock.reward), 'AR');
            
            // Bu wallet'ın kazandığı blok var mı?
            if (lastBlock.reward_addr === address) {
                console.log('Bu blok sizin tarafınızdan mine edilmiş!');
            }
        } catch (blockError) {
            console.log('Son blok bilgileri alınamadı:', blockError.message);
        }

        // Mining durumunu kontrol et
        console.log('\nMining Durumu:');
        console.log('------------------------');
        try {
            const miningAddress = await arweave.blocks.getCurrent();
            console.log('Mining Address:', miningAddress);
            console.log('Wallet3 Mining Aktif:', miningAddress === address);
        } catch (miningError) {
            console.log('Mining durumu alınamadı:', miningError.message);
        }

        // Mining ödül kontrolü
        console.log('\nMining Ödül Kontrolü:');
        console.log('------------------------');
        try {
            // Son 5 bloğu kontrol et
            for (let i = 0; i < 5; i++) {
                const blockHeight = networkInfo.height - i;
                const block = await arweave.blocks.get(blockHeight);
                
                if (block.reward_addr === address) {
                    console.log(`Blok ${blockHeight}:`);
                    console.log('Ödül:', arweave.ar.winstonToAr(block.reward), 'AR');
                    console.log('Durum: Onay bekliyor');
                }
            }
        } catch (error) {
            console.log('Ödül kontrolü hatası:', error.message);
        }

    } catch (error) {
        console.error('\nHata:', error.message);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

checkWallet3Balance(); 