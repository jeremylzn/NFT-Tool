const TOPIC_721 = {
    topics: [
        // web3.utils.sha3('Transfer(address,address,uint256)')
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
    ]
};

const TOPIC_1155 = {
    topics: [
        // web3.utils.sha3('TransferSingle(address,address,address,uint256,uint256)')
        "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62"
    ]
};

module.exports = { TOPIC_721, TOPIC_1155 }