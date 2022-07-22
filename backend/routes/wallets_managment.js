const express = require('express');
const router = new express.Router();
const web3 = require('../web3');


// Get tokens list from wallet
router.get("/tokens/wallet/:address", async (req, res) => {

    try {
        const address = req['params']['address'];
        const nfts = await web3.getTokenListByWallet(address)
        res.send({ error: false, data: nfts });

    } catch (err) {
        console.log(err);
        res.status(401).send({ error: true, data: err.message });
    }

});

// Get metadata by contract address and tokenId
router.get("/metadata/contract/:address/tokenid/:tokenid", async (req, res) => {

    try {
        const contract_address = req['params']['address'];
        const tokenId = req['params']['tokenid'];

        const metadata = await web3.getMetadataByContractAddressAndTokenId(contract_address, tokenId)
        res.send({ error: false, data: metadata });

    } catch (err) {
        // console.log(err);
        res.status(401).send({ error: true, data: err.message });
    }

});


module.exports = router
