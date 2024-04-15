const axios = require('axios')
const { ethers } = require("ethers");
const fs = require('fs');
const TEST_INFO_URL = 'https://test-info.macaron.xyz/pair/200810/pools'
const TEST_RPC = 'https://testnet-rpc.bitlayer.org'
const erc20Abi = require('./erc20.json')

async function getlpPrice() {
    const res = await axios.get(TEST_INFO_URL)
    if(res.data.statusCode == 200) {
        const startTime = new Date();
        const pools = res.data.data;
        const provider = new ethers.providers.JsonRpcProvider(TEST_RPC); 
        const poolData = {}
        for(const pool of pools) {
            const {pair_address, tvl} = pool
            const tokenContract = new ethers.Contract(pair_address, erc20Abi, provider);
            const total = await tokenContract.totalSupply();
            const balance = ethers.utils.formatUnits(total)
            const price = tvl/balance || 0;
            poolData[pair_address] = price
        }
        fs.writeFileSync('./pools.json', JSON.stringify(poolData), 'utf-8')
        const endTime = new Date();
        console.log(`getlpPrice take：${(endTime - startTime)/1000} second`);
    }
}
getlpPrice()
