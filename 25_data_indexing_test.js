const arweave = require('./config.js');
const fs = require('fs');

async function testDataIndexing() {
    try {
        console.log('\nVeri İndeksleme Testi:');
        console.log('------------------------');
        
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        
        // Test verileri yükle
        const testData = [
            { type: 'post', content: 'Test Post 1', tags: ['test', 'bigfile'] },
            { type: 'image', content: 'Image Data', tags: ['image', 'test'] },
            { type: 'document', content: 'Doc Content', tags: ['doc', 'bigfile'] }
        ];
        
        const txIds = [];
        
        // Verileri yükle
        for (let data of testData) {
            const tx = await arweave.createTransaction({
                data: JSON.stringify(data)
            }, wallet);
            
            tx.addTag('Content-Type', 'application/json');
            tx.addTag('Type', data.type);
            for (let tag of data.tags) {
                tx.addTag('Tag', tag);
            }
            
            await arweave.transactions.sign(tx, wallet);
            await arweave.transactions.post(tx);
            
            txIds.push(tx.id);
            console.log(`${data.type} yüklendi:`, tx.id);
        }
        
        // GraphQL ile sorgula
        const query = `
        query {
            transactions(
                tags: [
                    { name: "Tag", values: ["bigfile"] }
                ]
            ) {
                edges {
                    node {
                        id
                        tags {
                            name
                            value
                        }
                    }
                }
            }
        }`;
        
        const results = await arweave.api.post('graphql', { query });
        
        console.log('\nSorgu Sonuçları:');
        console.log(JSON.stringify(results.data, null, 2));
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

testDataIndexing(); 