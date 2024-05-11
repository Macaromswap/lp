const axios = require('axios')
const { ethers } = require("ethers");
const fs = require('fs');
const TEST_INFO_URL = 'https://test-info.macaron.xyz/pair/200810/pools'
const INFO_URL = 'https://info-api.macaron.xyz/pair/200901/pools'
const TEST_RPC = 'https://testnet-rpc.bitlayer.org'
const RPC = 'https://rpc.bitlayer.org'
const erc20Abi = require('./erc20.json')

async function getlpPrice() {
    const startTime = new Date();
    const testres = await axios.get(TEST_INFO_URL)
    const poolData = {}
    if(testres.data.statusCode == 200) {
        const pools = testres.data.data;
        const provider = new ethers.providers.JsonRpcProvider(TEST_RPC); 
        for(const pool of pools) {
            try {
                const {pair_address, tvl} = pool
                let lp_address = pair_address
                if(pair_address == '0x13c6108d73dea14741cbf3bc6617c6738df4f7ae') {
                    lp_address = '0x0017e3bbc621078916e3db5a26069e456d1f9872'
                }
                if(pair_address == '0x035cca67b0671d8e15e881ed0ca72f97dc93c17d') {
                    lp_address = '0x443ef7a9d505380619d6a367d6808a5f6474e27d'
                }
                const tokenContract = new ethers.Contract(lp_address, erc20Abi, provider);
                const total = await tokenContract.totalSupply();
                const balance = ethers.utils.formatUnits(total)
                const price = tvl/balance || 0;
                poolData[lp_address] = price
            } catch (error) {
                console.error(error)
            }
        }
    }
    const res = await axios.get(INFO_URL)
    if(res.data.statusCode == 200) {
        const pools = res.data.data;
        const provider = new ethers.providers.JsonRpcProvider(RPC); 
        for(const pool of pools) {
            try {
                const {pair_address, tvl} = pool
                const tokenContract = new ethers.Contract(pair_address, erc20Abi, provider);
                const total = await tokenContract.totalSupply();
                const balance = ethers.utils.formatUnits(total)
                const price = tvl/balance || 0;
                poolData[pair_address] = price
            } catch (error) {
                console.error(error)
            }
        }
    }
    fs.writeFileSync('./pools.json', JSON.stringify(poolData), 'utf-8')
    const endTime = new Date();
    console.log(`getlpPrice take：${(endTime - startTime)/1000} second`);
}
getlpPrice()
