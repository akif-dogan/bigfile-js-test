const arweave = require('./config.js');

async function testBlockOperations() {
    try {
        console.log('\nBlok İşlemleri Testi:');
        console.log('------------------------');
        
        // Mevcut blok bilgilerini al
        console.log('\n1. Mevcut Blok:');
        const currentBlock = await arweave.blocks.getCurrent();
        console.log('Blok Yüksekliği:', currentBlock.height);
        console.log('Blok Hash:', currentBlock.indep_hash);
        console.log('Önceki Blok:', currentBlock.previous_block);
        console.log('İşlem Sayısı:', currentBlock.txs ? currentBlock.txs.length : 0);
        
        // Belirli bir bloğu getir
        if (currentBlock.previous_block) {
            console.log('\n2. Önceki Blok Detayları:');
            const previousBlock = await arweave.blocks.get(currentBlock.previous_block);
            console.log('Blok Yüksekliği:', previousBlock.height);
            console.log('Timestamp:', new Date(previousBlock.timestamp * 1000).toLocaleString());
            console.log('İşlem Sayısı:', previousBlock.txs ? previousBlock.txs.length : 0);
        }
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

testBlockOperations(); 