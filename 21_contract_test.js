const arweave = require('./config.js');
const fs = require('fs');

async function testSmartWeaveContract() {
    try {
        console.log('\nSözleşme Testi:');
        console.log('------------------------');
        
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        
        // Basit bir sözleşme
        const contractSource = `
        export function handle(state, action) {
            if (action.input.function === 'increment') {
                state.counter += 1;
            }
            return { state };
        }`;
        
        // Başlangıç durumu
        const initialState = {
            counter: 0
        };
        
        // Sözleşme yükle
        const tx = await arweave.createTransaction({
            data: contractSource
        }, wallet);
        
        tx.addTag('App-Name', 'SmartWeaveContract');
        tx.addTag('Content-Type', 'application/javascript');
        tx.addTag('Contract-Type', 'SmartWeave');
        
        await arweave.transactions.sign(tx, wallet);
        await arweave.transactions.post(tx);
        
        console.log('Sözleşme ID:', tx.id);
        console.log('Başlangıç Durumu:', initialState);
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

testSmartWeaveContract(); 