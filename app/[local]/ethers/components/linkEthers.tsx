'use client';
import { useState } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';

import { auth, verify } from './mock';

type EthersInfo = {
	login: boolean;
	account?: string;
	nonce?: number;
	signature?: string;
	signStatus?: boolean;
};

export default function LinkEthers() {
	const [etherInfo, setEtherInfo] = useState<EthersInfo>({ login: false });
	// 前端签名流程
	async function onClickHandler() {
		console.log('连接钱包');
		// 获得provider
		const provider = new ethers.BrowserProvider((window as any).ethereum);
		// 读取钱包地址
		const accounts = await provider.send('eth_requestAccounts', []);
		const account = accounts[0];
		console.log(`钱包地址: ${account}`);
		//从后台获取需要进行签名的数据
		const nonce = auth(account);
		console.log(`获取后台需要签名的数据: ${nonce}`);
		//签名
		const signer = await provider.getSigner();
		const signature = await signer.signMessage(nonce.toString());
		//去后台验证签名，完成登录
		const signStatus = verify(account, signature);
		console.log('signStatus', signStatus);
		setEtherInfo({
			login: true,
			account,
			nonce,
			signature,
			signStatus,
		});
	}
	return (
		<div className="mt-4">
			<div className="flex justify-between items-center">
				<span>使用ethers.js连接钱包</span>
				<div>
					<Button onClick={onClickHandler}>Sign</Button>
				</div>
			</div>
			<div>
				{etherInfo.login ? (
					<div className="grid grid-cols-1 gap-1">
						<div>
							<span>钱包地址：</span>
							<span>{etherInfo.account}</span>
						</div>
						<div>
							<span>nonce值：</span>
							<span>{etherInfo.nonce}</span>
						</div>
						<div className="wrap-break-word whitespace-break-spaces">
							<span>signature值：</span>
							<span className="break-all">
								{etherInfo.signature}
							</span>
						</div>
						<div>
							<span>signStatus值：</span>
							<span>{etherInfo.signStatus?.toString()}</span>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}
