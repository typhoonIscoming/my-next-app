'use client';
import { useState } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { useMetaMask } from '../hooks/useEthers';
import { useTranslations } from 'next-intl';

import { auth, verify } from './mock';

type EthersInfo = {
	login: boolean;
	account?: string;
	nonce?: number;
	signature?: string;
	signStatus?: boolean;
};

export default function LinkEthers({ local }: { local: string }) {
	const t = useTranslations('wallet');
	console.log('params', local);

	const { connect, disconnect, address, isConnected, chainId, balance } =
		useMetaMask();
	return (
		<div className="mt-4">
			<div className="flex justify-between items-center">
				<span>使用ethers.js连接钱包</span>
				<div>
					{!isConnected ? (
						<Button onClick={connect}>{t('loginWallet')}</Button>
					) : (
						<Button onClick={disconnect}>
							{t('logoutWallet')}
						</Button>
					)}
				</div>
			</div>
			<div>
				{isConnected ? (
					<div className="grid grid-cols-1 gap-1">
						<div>
							<span>钱包地址：</span>
							<span>{address}</span>
						</div>
						<div className="wrap-break-word whitespace-break-spaces">
							<span>chainId值：</span>
							<span className="break-all">{chainId}</span>
						</div>
						<div>
							<span>balance值：</span>
							<span>{balance}ETH</span>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}
