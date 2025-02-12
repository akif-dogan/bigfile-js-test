const arweave = require('./config.js');

async function testNetworkInfo() {
    try {
        console.log('\nAğ Bilgileri Testi:');
        console.log('------------------------');
        
        // Node durumunu kontrol et
        const networkInfo = await arweave.network.getInfo();
        console.log('\nNode Durumu:');
        console.log('------------------------');
        console.log('Network:', networkInfo.network);
        console.log('Version:', networkInfo.version);
        console.log('Release:', networkInfo.release);
        console.log('Height:', networkInfo.height);
        console.log('Current Block:', networkInfo.current);
        console.log('Queue Length:', networkInfo.queue_length);
        console.log('Node State Latency:', networkInfo.node_state_latency);
        
        // Metrics bilgilerini al
        try {
            const metricsResponse = await fetch('http://65.108.0.39:1984/metrics');
            const metrics = await metricsResponse.text();
            console.log('\nMetrics Bilgileri:');
            console.log('------------------------');
            
            // Önemli metrikleri filtrele ve göster
            const importantMetrics = metrics.split('\n').filter(line => 
                line.includes('arweave_') || 
                line.includes('block_') ||
                line.includes('network_')
            );
            
            importantMetrics.forEach(metric => console.log(metric));
        } catch (metricsError) {
            console.log('Metrics bilgileri alınamadı:', metricsError.message);
        }
        
        // Peers bilgilerini al
        try {
            const peers = await arweave.network.getPeers();
            console.log('\nPeer Bilgileri:');
            console.log('------------------------');
            console.log('Toplam Peer Sayısı:', peers.length);
            console.log('Aktif Peerler:', peers);
        } catch (peersError) {
            console.log('Peer bilgileri alınamadı:', peersError.message);
        }
        
        // Node sağlık kontrolü
        try {
            const health = await fetch('http://65.108.0.39:1984/health');
            const healthData = await health.json();
            console.log('\nNode Sağlık Durumu:');
            console.log('------------------------');
            console.log(healthData);
        } catch (healthError) {
            console.log('Sağlık durumu alınamadı:', healthError.message);
        }
        
    } catch (error) {
        console.error('\nHata:', error);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

testNetworkInfo(); 