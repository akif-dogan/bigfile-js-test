const arweave = require('./config.js');

async function monitorNode() {
    const startTime = Date.now();
    const stats = {
        startBlock: 0,
        currentBlock: 0,
        totalTx: 0,
        failedTx: 0,
        avgBlockTime: 0,
        lastBlockTime: Date.now()
    };
    
    console.log('\nNode Monitoring Başladı');
    console.log('------------------------');
    
    while(true) {
        try {
            const info = await arweave.network.getInfo();
            
            if (stats.startBlock === 0) {
                stats.startBlock = info.height;
                stats.lastBlockTime = Date.now();
            }
            
            // Yeni blok kontrolü
            if (info.height > stats.currentBlock) {
                const blockTime = Date.now() - stats.lastBlockTime;
                stats.avgBlockTime = ((stats.avgBlockTime * stats.currentBlock) + blockTime) / info.height;
                stats.lastBlockTime = Date.now();
            }
            
            stats.currentBlock = info.height;
            
            console.log({
                timestamp: new Date().toISOString(),
                uptime: `${Math.floor((Date.now() - startTime) / 1000)}s`,
                blockHeight: info.height,
                blocksPassed: stats.currentBlock - stats.startBlock,
                avgBlockTime: `${(stats.avgBlockTime / 1000).toFixed(2)}s`,
                lastBlockAge: `${Math.floor((Date.now() - stats.lastBlockTime) / 1000)}s`,
                queueLength: info.queue_length,
                networkName: info.network
            });
            
            await new Promise(r => setTimeout(r, 2000));
            
        } catch (error) {
            console.error('Monitoring Hatası:', error.message);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

monitorNode(); 