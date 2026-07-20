import { ethers } from 'ethers'

const ALCHEMY_MAINNET_URL =
	'https://eth-mainnet.g.alchemy.com/v2/0sfrJt9MvN2j7sEKuhdr7'
const provider = new ethers.JsonRpcProvider(ALCHEMY_MAINNET_URL)

// 创建 provider，如果第一个失败会自动尝试下一个
// const provider = new ethers.JsonRpcProvider(RPC_URLS[0])

const getBalance = async () => {
	try {
		// 使用 ENS 域名查询余额
		const balanceInWei = await provider.getBalance('vitalik.eth')
		const balanceInEth = ethers.formatEther(balanceInWei)
		console.log(`✅ Vitalik Buterin 的 ETH 余额: ${balanceInEth} ETH`)
	} catch (error) {
		console.error('❌ 查询失败:', error.message)
	}
}

getBalance()
