// 直接在文件顶部导入配置(加载本地环境变量，这种方式更简洁)
import 'dotenv/config'
import { ethers } from 'ethers'
// import dotenv from 'dotenv'
// dotenv.config()

// Sepolia 测试网（当前最常用）
// const SEPOLIA_RPC = "https://sepolia.infura.io/v3/YOUR_INFURA_KEY";
// 或使用公共端点
const SEPOLIA_RPC = process.env.ALCHEMY_NETWORK_ADDERSS

const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC)

// 使用测试网钱包（需要有 Sepolia ETH）
const privateKey = process.env.PRIVATE_KEY
const wallet = new ethers.Wallet(privateKey, provider)

console.log(process.env.ALCHEMY_NETWORK_ADDERSS)

const main = async () => {
	const network = await provider.getNetwork()
	console.log(`🌐 网络: ${network.name}, Chain ID: ${network.chainId}`)

	const balance = await provider.getBalance(wallet.address)
	console.log(`💰 余额: ${ethers.formatEther(balance)} SepoliaETH`)

	// 获取测试币的常用水龙头
	console.log('💧 获取测试币: https://sepolia-faucet.pk910.de/')

	console.log('\n3. 查询区块高度')
	const blockNumber = await provider.getBlockNumber()
	console.log(blockNumber)
}

// 查询交易次数
const transicationTimes = async () => {
	console.log('\n4. 查询 vitalik 钱包历史交易次数')
	// const txCount = await provider.getTransactionCount('vitalik.eth')
	const txCount = await provider.getTransactionCount(wallet.address) // 查询自己的钱包交易次数
	console.log(txCount)
}

// 查询当前建议的 gas 设置

const getFeeData = async () => {
	// 5. 查询当前建议的gas设置
	console.log('\n5. 查询当前建议的gas设置')
	const feeData = await provider.getFeeData()
	console.log(feeData)
}

// 查询区块信息
const getBlock = async () => {
	// 6. 查询区块信息
	console.log('\n6. 查询区块信息')
	const block = await provider.getBlock(0)
	console.log(block)
}

// 查询某个地址的合约 bytecode
const getCode = async () => {
	// 7. 给定合约地址查询合约bytecode，例子用的WETH地址
	console.log('\n7. 给定合约地址查询合约bytecode，例子用的WETH地址')
	const code = await provider.getCode(
		'0xc778417e063141139fce010982780140aa0cd5ab'
	)
	console.log(code)
}

getCode()
