const arweave = require('./config.js');

async function monitorBlockProduction() {
    let lastBlock = null;
    let stuckCount = 0;
    
    while(true) {
        try {
            const info = await arweave.network.getInfo();
            const current = info.current;
            
            if (lastBlock === current) {
                stuckCount++;
                console.log(`Blok üretimi ${stuckCount * 10} saniyedir durgun`);
                
                if (stuckCount > 6) { // 1 dakikadan fazla durgunsa
                    console.log('\nDurgunluk Analizi:');
                    console.log('Queue Length:', info.queue_length);
                    console.log('Network:', info.network);
                    console.log('Peers:', await arweave.network.getPeers());
                    
                    // Mining node'larının durumunu kontrol et
                    const peers = await arweave.network.getPeers();
                    for (let peer of peers) {
                        try {
                            const peerInfo = await arweave.api.get(`http://${peer}/info`);
                            console.log(`\nPeer ${peer}:`, {
                                height: peerInfo.data.height,
                                current: peerInfo.data.current,
                                release: peerInfo.data.release
                            });
                        } catch (err) {
                            console.log(`Peer ${peer} yanıt vermiyor`);
                        }
                    }
                }
            } else {
                stuckCount = 0;
                console.log('\nYeni Blok Üretildi:', {
                    height: info.height,
                    current: current,
                    previous: lastBlock || 'ilk kontrol'
                });
            }
            
            lastBlock = current;
            await new Promise(r => setTimeout(r, 10000)); // 10 sn ara
            
        } catch (error) {
            console.error('Monitoring Hatası:', error);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

monitorBlockProduction(); 