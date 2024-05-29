const axios = require('axios')
const { ethers } = require("ethers");
const fs = require('fs');
const TEST_INFO_URL = 'https://test-info.macaron.xyz/pair/200810/pools'
const INFO_URL = 'https://info-api.macaron.xyz/pair/200901/pools'
const TEST_RPC = 'https://testnet-rpc.bitlayer.org'
const RPC = 'https://rpc.bitlayer.org'
const erc20Abi = require('./erc20.json')

async function getlpPrice() {
    console.time("getlpPrice take")
    const testres = await axios.get(TEST_INFO_URL)
    const poolData = {}
    if(testres.data.statusCode == 200) {
        const pools = testres.data.data;
        const provider = new ethers.providers.JsonRpcProvider(TEST_RPC); 
        for(const pool of pools) {
            try {
                const {pair_address, tvl, charge_pecent, is_stable, token0_symbol, token1_symbol} = pool
                let lp_address = pair_address
                if(pair_address == '0xbf7b5573043e0a803f436241fffe3048a5efd203') {
                    lp_address = '0xeb454a50cdd6273740e538a49f12d64c5ed1246e'
                }
                if(pair_address == '0xc16fe42451aefebaf3b45b308cd148a2c0e619e1') {
                    lp_address = '0x5A3289ceCe2fFd2be1D4806e9ab3ddbaD0b05148'
                }
                const tokenContract = new ethers.Contract(lp_address, erc20Abi, provider);
                const total = await tokenContract.totalSupply();
                const balance = ethers.utils.formatUnits(total)
                const price = tvl/balance || 0;
                let symbol = ''
                if(is_stable) {
                    symbol = `${token0_symbol}/${token1_symbol} stable LP`
                } else {
                    symbol = `${token0_symbol}/${token1_symbol} LP`
                }
                poolData[lp_address] = {
                    price,
                    fee: charge_pecent,
                    symbol,
                    network: 'TEST'
                }
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
                const {pair_address, tvl, charge_pecent, is_stable, token0_symbol, token1_symbol} = pool
                let lp_address = pair_address
                if(pair_address == '0x108f9e0f5ba91d860307c4093ccb42876d36906f') {
                    lp_address = '0x5ae96d29afe968be019e4fdc6cd5fc7f825ae083'
                }
                const tokenContract = new ethers.Contract(lp_address, erc20Abi, provider);
                const total = await tokenContract.totalSupply();
                const balance = ethers.utils.formatUnits(total)
                const price = tvl/balance || 0;
                let symbol = ''
                if(is_stable) {
                    symbol = `${token0_symbol}/${token1_symbol} stable LP`
                } else {
                    symbol = `${token0_symbol}/${token1_symbol} LP`
                }
                poolData[lp_address] = {
                    price,
                    fee: charge_pecent,
                    symbol,
                    network: 'MAIN'
                }
            } catch (error) {
                console.error(error)
            }
        }
    }
    fs.writeFileSync('./pools.json', JSON.stringify(poolData), 'utf-8')
    console.timeEnd("getlpPrice take");
}
getlpPrice()