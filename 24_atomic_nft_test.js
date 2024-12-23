const arweave = require('./config.js');
const fs = require('fs');

async function createAtomicNFT() {
    try {
        console.log('\nAtomic NFT Oluşturma Testi:');
        console.log('------------------------');
        
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        
        // NFT Metadata
        const metadata = {
            name: "BigFile Test NFT",
            description: "First NFT on BigFile Network",
            creator: await arweave.wallets.jwkToAddress(wallet),
            type: "image/png",
            attributes: [
                { trait_type: "Test", value: "BigFile" },
                { trait_type: "Version", value: "1.0" }
            ]
        };

        // NFT Sözleşmesi
        const contractSrc = `
        export function handle(state, action) {
            const input = action.input;
            const caller = action.caller;
            
            if (input.function === "transfer") {
                if (state.owner === caller) {
                    state.owner = input.target;
                    return { state };
                }
                throw new Error("Only owner can transfer");
            }
            
            if (input.function === "getOwner") {
                return { result: state.owner };
            }
            
            throw new Error("Invalid function");
        }`;

        // Sözleşme başlangıç durumu
        const initialState = {
            owner: await arweave.wallets.jwkToAddress(wallet),
            ticker: "BFNFT",
            name: metadata.name,
            description: metadata.description
        };

        // Sözleşmeyi yükle
        const contractTx = await arweave.createTransaction({
            data: contractSrc
        }, wallet);

        contractTx.addTag('App-Name', 'SmartWeaveContract');
        contractTx.addTag('Content-Type', 'application/javascript');
        contractTx.addTag('Contract-Type', 'NFT');
        contractTx.addTag('Initial-State', JSON.stringify(initialState));

        await arweave.transactions.sign(contractTx, wallet);
        await arweave.transactions.post(contractTx);

        console.log('\nSözleşme Yüklendi:');
        console.log('Contract ID:', contractTx.id);
        
        // NFT Verisi (örnek resim)
        const imageData = fs.readFileSync('./test.png');
        
        // NFT verisi yükle
        const dataTx = await arweave.createTransaction({
            data: imageData
        }, wallet);

        dataTx.addTag('Content-Type', 'image/png');
        dataTx.addTag('NFT-Contract', contractTx.id);
        dataTx.addTag('NFT-Metadata', JSON.stringify(metadata));
        
        await arweave.transactions.sign(dataTx, wallet);
        await arweave.transactions.post(dataTx);

        console.log('\nNFT Verisi Yüklendi:');
        console.log('Data TX ID:', dataTx.id);
        
        console.log('\nNFT Erişim Linkleri:');
        console.log('Sözleşme:', `http://thebigfile.info:1984/${contractTx.id}`);
        console.log('NFT Verisi:', `http://thebigfile.info:1984/${dataTx.id}`);

    } catch (error) {
        console.error('\nHata:', error);
    }
}

createAtomicNFT(); 