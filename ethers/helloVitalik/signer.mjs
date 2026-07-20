import 'dotenv/config'
import { ethers } from 'ethers'

// Signer 签名者类和它派生的 Wallet 钱包类，并利用它来发送 ETH

const SEPOLIA_RPC = process.env.ALCHEMY_NETWORK_ADDERSS

const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC)

// 方法 1：创建随机的 wallet 对象
// 创建随机的wallet对象
const wallet1 = ethers.Wallet.createRandom()

// 方法 2：用私钥创建 wallet 对象
// 利用私钥和provider创建wallet对象
const privateKey = process.env.PRIVATE_KEY
const wallet2 = new ethers.Wallet(privateKey, provider)

//发送交易，获得收据
const send = async () => {
	// 创建交易请求，参数：to为接收地址，value为ETH数额
	const tx = {
		to: address1,
		value: ethers.parseEther('0.001'),
	}
	const txRes = await wallet2.sendTransaction(tx)
	const receipt = await txRes.wait() // 等待链上确认交易
	console.log(receipt) // 打印交易的收据
}

// 获取钱包助记词
const getPhrase = async () => {
	const wallet1WithProvider = wallet1.connect(provider)
	// const mnemonic = wallet1.mnemonic // 获取助记词

	const address1 = await wallet1.getAddress()
	console.log('wallet address', address1)

	console.log(`钱包2私钥: ${wallet2.privateKey}`)

	const txCount1 = await provider.getTransactionCount(wallet1WithProvider)
	const txCount2 = await provider.getTransactionCount(wallet2)
	console.log(`钱包1发送交易次数: ${txCount1}`)
	console.log(`钱包2发送交易次数: ${txCount2}`)
}

getPhrase()
