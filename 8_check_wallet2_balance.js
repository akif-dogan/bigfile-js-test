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
        console.log('Blok Yüksekliği:', networkInfo.height);
        console.log('Current Block:', networkInfo.current);
        console.log('Release:', networkInfo.release);
        console.log('Version:', networkInfo.version);
        console.log('Queue Length:', networkInfo.queue_length);
        console.log('Node State Latency:', networkInfo.node_state_latency);
        
        // Bakiye kontrolü
        const balance = await arweave.wallets.getBalance(address);
        const big = arweave.big.winstonToBig(balance);
        
        console.log('\nWallet2 (Mining Wallet) Bilgileri:');
        console.log('------------------------');
        console.log('Adres:', address);
        console.log('Bakiye (BIG):', big);
        console.log('Bakiye (Winston):', balance);
        
        // Son blokları kontrol et
        console.log('\nSon Blok Bilgileri:');
        console.log('------------------------');
        try {
            const lastBlock = await arweave.blocks.get(networkInfo.current);
            console.log('Son Blok Hash:', lastBlock.indep_hash);
            console.log('Miner Address:', lastBlock.reward_addr);
            console.log('Block Reward:', arweave.big.winstonToBig(lastBlock.reward), 'BIG');
            console.log('Block Size:', lastBlock.block_size);
            console.log('Weave Size:', lastBlock.weave_size);
            console.log('Nonce:', lastBlock.nonce);
            
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
            console.log('Wallet2 Mining Aktif:', miningAddress === address);
            
            // Mining metrikleri
            console.log('\nMining Metrikleri:');
            console.log('------------------------');
            console.log('Blok Üretim Hızı:', networkInfo.blocks_per_second || 'Hesaplanamadı');
            console.log('Toplam Blok Sayısı:', networkInfo.height);
            console.log('Bekleyen İşlem Sayısı:', networkInfo.queue_length);
            
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
                    console.log('Ödül:', arweave.big.winstonToBig(block.reward), 'BIG');
                    console.log('Hash:', block.indep_hash);
                    console.log('Previous Block:', block.previous_block);
                    console.log('Timestamp:', new Date(block.timestamp * 1000).toLocaleString());
                    console.log('Durum: Onaylandı');
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

checkWallet2Balance(); 