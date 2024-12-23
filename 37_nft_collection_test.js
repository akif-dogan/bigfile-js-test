const arweave = require('./config.js');
const fs = require('fs');

async function testNFTCollection() {
    try {
        console.log('\nNFT Koleksiyon Testi:');
        console.log('------------------------');
        
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        
        // Koleksiyon metadata
        const collection = {
            name: "BigFile Test Collection",
            description: "Test NFT Collection on BigFile Network",
            tokens: []
        };

        // 3 NFT oluştur
        for (let i = 1; i <= 3; i++) {
            // NFT metadata
            const nftMetadata = {
                name: `BigFile NFT #${i}`,
                description: `Test NFT ${i}`,
                attributes: [
                    { trait_type: "Series", value: "Test" },
                    { trait_type: "Number", value: i }
                ]
            };

            // NFT verisi
            const nftData = {
                image: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="50">NFT ${i}</text></svg>`,
                metadata: nftMetadata
            };

            // NFT'yi yükle
            const tx = await arweave.createTransaction({
                data: JSON.stringify(nftData)
            }, wallet);

            tx.addTag('Content-Type', 'application/json');
            tx.addTag('Type', 'NFT');
            tx.addTag('Collection', 'BigFileTest');
            tx.addTag('Token-Index', i.toString());

            await arweave.transactions.sign(tx, wallet);
            await arweave.transactions.post(tx);

            collection.tokens.push({
                id: tx.id,
                index: i
            });

            console.log(`NFT #${i} yüklendi:`, tx.id);
        }

        // Koleksiyonu yükle
        const collectionTx = await arweave.createTransaction({
            data: JSON.stringify(collection)
        }, wallet);

        collectionTx.addTag('Content-Type', 'application/json');
        collectionTx.addTag('Type', 'NFT-Collection');
        collectionTx.addTag('Collection-Name', 'BigFileTest');

        await arweave.transactions.sign(collectionTx, wallet);
        await arweave.transactions.post(collectionTx);

        console.log('\nKoleksiyon yüklendi:', collectionTx.id);
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

testNFTCollection(); 