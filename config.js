const Arweave = require('arweave');

const arweave = Arweave.init({
    host: '65.108.0.39',
    port: 1984,
    protocol: 'http',
    timeout: 60000,
    logging: false
});

module.exports = arweave; 