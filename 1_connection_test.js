const arweave = require('./config.js');

async function testConnection() {
    try {
        const networkInfo = await arweave.network.getInfo();
        console.log('Ağ Bilgileri:', networkInfo);
        
        const peers = await arweave.network.getPeers();
        console.log('Bağlı Peer Sayısı:', peers.length);
        
    } catch (error) {
        console.error('Bağlantı hatası:', error);
    }
}

testConnection(); 