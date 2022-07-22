const dotenv = require('dotenv')
dotenv.config() // Makes environment variables available
const Web3 = require('web3');
const axios = require('axios');
const axiosRetry = require('axios-retry');
const db = require('./config/database');
const etherscan = require('./api/etherscan');


const { ABI_ERC721, ABI_ERC1155, ABI_METADATA_ERC1155, ABI_METADATA_ERC721, ERC721_ABI } = require('./abi');
const { TOPIC_721, TOPIC_1155 } = require('./topics');


axiosRetry(axios, {
    retries: 3, // number of retries
    retryDelay: (retryCount) => {
        console.log(`retry attempt: ${retryCount}`);
        return retryCount * 2000; // time interval between retries
    },
    retryCondition: (error) => {
        // if retry condition is not specified, by default idempotent requests are retried
        return error.response.status === 503;
    },
});

function getWeb3Instance() {
    // let provider = new Web3.providers.HttpProvider(`https://cloudflare-eth.com`);
    // const provider = new Web3.providers.WebsocketProvider(`ws://lemon:zfT5PAbec9LLdjus@3.236.87.153:8546/api`);
    let provider = 'wss://main-light.eth.linkpool.io/ws'
    const web3 = new Web3(provider);
    return web3
}


async function listening() {
    const web3 = getWeb3Instance()

    // let subscription721 = web3.eth.subscribe('logs', TOPIC_721);
    let subscription1155 = web3.eth.subscribe('logs', TOPIC_1155);

    // subscription721.on('error', err => { throw err });
    subscription1155.on('error', err => {
        console.log('error subscribe')
        throw err
    });

    // subscription721.on('connected', nr => console.log('Subscription on ERC-721 started with ID %s', nr));
    subscription1155.on('connected', nr => console.log('Subscription on ERC-1155 started with ID %s', nr));

    // subscription721.on('data', event => {
    //     if (event['topics'].length == 4) {
    //         console.log('event 721 :', event)
    //         let transaction = web3.eth.abi.decodeLog(ABI_ERC721, event.data, [event.topics[1], event.topics[2], event.topics[3]]);
    //     }
    // });

    subscription1155.on('data', async event => {
        console.log('event 1155 :', event)
        if (event['topics'].length == 4) {

            const transaction = web3.eth.abi.decodeLog(ABI_ERC1155, event.data, [event.topics[1], event.topics[2], event.topics[3]]);
            console.log(`\n` +
                `@ New ERC-1155 transaction found in block ${event['blockNumber']} with hash ${event['transactionHash']}\n` +
                `- Operator: ${transaction['operator']}\n` +
                `- From: ${(transaction['from'] === '0x0000000000000000000000000000000000000000') ? 'New mint!' : transaction['from']}\n` +
                `- To: ${transaction['to']}\n` +
                `- tokenId: ${transaction['id']}\n` +
                `- Value: ${transaction['value']}`
            );

            const contract_meta = new web3.eth.Contract(ABI_METADATA_ERC1155, event['address']);

            let result
            let uri_error = false;
            try {
                result = await getNFTMetadataURL(contract_meta, transaction['id'], web3)
            } catch (error) {
                console.log(`@ Error metadata Url getting with token_id : ${transaction['id']} and contract ${contract_meta}`)
                uri_error = true
            }

            const metadata = (uri_error) ? { uri_error: true } : await getNFTMetadata(result, transaction['id']);

            let nft_inserted = await db.nfts.create({
                contract_address: event['address'],
                token_id: transaction['id'],
                metadata: metadata,
                value: transaction['value']
            });

            console.log(`@ NFT ${nft_inserted['id']} inserted`)

            let transfer_inserted = await db.transfers.create({
                item: nft_inserted['id'],
                block: event['blockNumber'],
                tx_hash: event['transactionHash'],
                from: transaction['from'],
                to: transaction['to'],
                transactionIndex: event['transactionIndex'],
                logIndex: event['logIndex'],
            });

            console.log(`@ Transfer ${transfer_inserted['id']} inserted`)

        }
    });



}

async function getNFTMetadata(url, token_id) {
    try {
        let res;
        if (url.includes('api.opensea.io/api'))
            url = url.replace("0x{id}", token_id);
        else if (url.includes('https:/'))
            url = url.replace("{id}", token_id);
        else
            url = `https://gateway.ipfs.io/ipfs/${url.replace("ipfs://", "").replace("ipfs/", "")}`.replace("{id}", token_id);

        console.log(`url in getNFTMetadata: ${url} and token_id ${token_id}`)
        res = await axios.get(url);
        return res['data'];
    } catch (error) {
        console.log('url :', url)
        return {
            error: true,
            error_message: error.message,
            error_data: error.response.data,
            url: url
        }
    }



}

async function getNFTMetadataURL(contract, tokenId, web3) {
    web3.eth.handleRevert = true;
    const result = await contract.methods.uri(tokenId).call()
    return result// https://nftdata.parallelnft.com/api/parallel-alpha/ipfs/QmSwnqTmpwvZH51Uv47opPUxGYx2nknYmGoKoRJQRMDcLL
}

async function test() {

    const openSeaData = await axios.get(`https://api.opensea.io/api/v1/asset/0xc68c9c5fa14f718b39a6d836b8870fadde4f2aa5/2611`);
    console.log(openSeaData)
}

// listening();
test();
