const axios = require('axios')
const { ethers } = require("ethers");
const fs = require('fs');
const INFO_URL = 'https://test-info.macaron.xyz/pair/200810/pools'
const rpcUrl = 'https://testnet-rpc.bitlayer.org'
const erc20Abi = require('./erc20.json')

async function getlpPrice() {
    const res = await axios.get(INFO_URL)
    if(res.data.statusCode == 200) {
        const pools = res.data.data;
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl); 
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
    }
}
getlpPrice()
