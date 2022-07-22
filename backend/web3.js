const dotenv = require('dotenv')
dotenv.config() // Makes environment variables available
const Web3 = require('web3');
const axios = require('axios');
const db = require('./config/database');
const etherscan = require('./api/etherscan');
const { ABI_ERC721, ABI_ERC1155, ABI_METADATA_ERC1155, ABI_METADATA_ERC721, ERC721_ABI, TEST_ABI } = require('./abi');
const { TOPIC_721, TOPIC_1155 } = require('./topics');

function web3Instance() {
    // let provider = new Web3.providers.HttpProvider(`https://cloudflare-eth.com`);
    const provider = new Web3.providers.WebsocketProvider(`ws://lemon:zfT5PAbec9LLdjus@3.236.87.153:8546/api`);
    // let provider = 'wss://main-light.eth.linkpool.io/ws'
    const web3 = new Web3(provider);
    return web3
}

async function getTokenListByWallet(address) {

    const web3 = web3Instance()
    const txs = await etherscan.ERC721ByAddress({ address: address, page: 1})

    const nfts = Object.keys(txs.reduce((res, tx) => {
        res[`${tx.contractAddress}:${tx.tokenID}`] = res[`${tx.contractAddress}:${tx.tokenID}`] || 0;

        if (web3.utils.toChecksumAddress(tx.to) == web3.utils.toChecksumAddress(address)){
            res[`${tx.contractAddress}:${tx.tokenID}`]+=1;
        } else if (web3.utils.toChecksumAddress(tx.from) == web3.utils.toChecksumAddress(address)) {
            res[`${tx.contractAddress}:${tx.tokenID}`]-=1;
            if(res[`${tx.contractAddress}:${tx.tokenID}`] === 0) {
                delete res[`${tx.contractAddress}:${tx.tokenID}`];
            }
        }
        return res
    }, {}))
    .map( r => {
        const [contractAddress, tokenId] = String(r).split(":");
        return {
            contractAddress, tokenId,
        };
    });

    return nfts
}

async function getMetadataByContractAddressAndTokenId(contract_address, tokenId) {

    const web3 = web3Instance()

    const contract = new web3.eth.Contract(TEST_ABI, contract_address);

    let tokenMetadataURI = await contract.methods.tokenURI(tokenId).call()

    if (tokenMetadataURI.startsWith("ipfs://")) {
        tokenMetadataURI = `https://ipfs.io/ipfs/${tokenMetadataURI.split("ipfs://")[1]}`
    } else if (!tokenMetadataURI.includes("https://")) {
        tokenMetadataURI = `https://ipfs.io/ipfs/${tokenMetadataURI}`
    }

    let tokenMetadata;
    try {
        tokenMetadata = (await axios.get(tokenMetadataURI))['data'];
    } catch (error) {
        console.log("tokenMetadataURI :", tokenMetadataURI)
        console.log("error['message'] :", error['message'])
        // console.log("error['response']['status'] :", error['response']['status'])
        // console.log("error['response']['config']['url'] :", error['response']['config']['url'])
        // console.log("error['response']['data'] :", error['response']['data'])
        const openSeaData = (await axios.get(`https://api.opensea.io/api/v1/asset/${contract_address}/${tokenId}`))['data'];

        tokenMetadata = {image : openSeaData['image_url'],
                        description : openSeaData['asset_contract']['description'],
                        name : openSeaData['name'],
                        attributes : openSeaData["traits"]};
    }

    if (tokenMetadata['image'].startsWith("ipfs://")) {
        tokenMetadata['image'] = `https://ipfs.io/ipfs/${tokenMetadata['image'].split("ipfs://")[1]}`
    }

    return tokenMetadata
    
}

module.exports = { getTokenListByWallet, getMetadataByContractAddressAndTokenId }