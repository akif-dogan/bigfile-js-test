const Arweave = require('arweave');

const arweave = Arweave.init({
    host: '213.239.206.178',
    port: 1984,
    protocol: 'http',
    timeout: 60000,
    logging: false
});

module.exports = arweave; 