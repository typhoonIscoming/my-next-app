import { promises } from 'fs' // 正确导入fs模块的promises接口
import { ethers } from 'ethers'
// 生成钱包，传入regexList数组并进行匹配，如匹配到则从数组中删除对应regex
async function createWallet(regexList) {
	let wallet
	let isValid = false

	while (!isValid && regexList.length > 0) {
		wallet = ethers.Wallet.createRandom()
		const index = regexList.findIndex((regex) => regex.test(wallet.address))
		// 移除匹配的正则表达式
		if (index !== -1) {
			isValid = true
			regexList.splice(index, 1)
		}
	}
	const data = `${wallet.address}:${wallet.privateKey}`
	console.log(data)
	return data
}

// 生成正则匹配表达式，并返回数组
function createRegex(total) {
	const regexList = []
	for (let i = 0; i < total; i++) {
		// 填充3位数字，比如001，002，003，...，999
		const paddedIndex = (i + 1).toString().padStart(3, '0')
		const regex = new RegExp(`^0x${paddedIndex}.*$`)
		regexList.push(regex)
	}
	return regexList
}

// 需要生成的钱包数量
const total = 5

async function main() {
	// 生成正则表达式
	const regexList = createRegex(total)
	// 数组存储生成地址
	const privateKeys = []

	for (let index = 0; index < total; index++) {
		const walletData = await createWallet(regexList)
		privateKeys.push(walletData)
	}

	// 异步写入seeds.txt，因顺序生成钱包地址前三位，使用自带sort()函数即可排序，并在每个地址后添加换行符保存
	await promises.appendFile('seeds.txt', privateKeys.sort().join('\n'))
}

main().catch(console.error) // 运行主程序并捕获可能的错误
