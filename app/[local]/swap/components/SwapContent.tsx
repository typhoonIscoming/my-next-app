'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import { ArrowDownSvgIcon } from './CustomSvgIcon';
import CustomConnectButton from '@/app/components/CustomConnectButton';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import { MoveDown } from 'lucide-react';

function TokenBadge({ symbol, name, color }: { symbol: string; name: string; color: string }) {
	return (
		<div className="flex items-center gap-3">
			<div
				className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-inner"
				style={{ background: color }}
			>
				{symbol.slice(0, 2)}
			</div>
			<div className="leading-none">
				<div className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">{name}</div>
				<div className="mt-1 text-base font-semibold text-white">{symbol}</div>
			</div>
		</div>
	);
}

export default function SwapContent() {
	const t = useTranslations();
	const [fromAmount, setFromAmount] = useState('');
	const [toAmount, setToAmount] = useState('');

	return (
		<div className="w-full max-w-[500px] rounded-[32px] backdrop-blur-2xl">
			<div className="rounded-[28px] p-4">
				<div className="mb-4 flex items-center justify-between px-2 py-1">
					<div className="flex items-center gap-2 text-sm font-semibold text-white">
						<span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
						{t('swap.title')}
					</div>
				</div>

				<div className="flex flex-col gap-1">
					<div className="rounded-[24px] border border-white/8 bg-[#161f33] p-4">
						<div className="mb-3 flex items-center justify-between text-[16px] font-bold uppercase tracking-[0.2em] text-[#ffffffa6]">
							<span>{t('swap.sell')}</span>
						</div>
						<div className="flex items-center justify-between gap-4">
							<div className="text-[2.2rem] font-medium tracking-[-0.07em] text-white">
								0.01
							</div>
							<div className="flex items-center justify-end">
								<TokenBadge
									symbol="ETH"
									name="Ethereum"
									color="linear-gradient(135deg,#8a8fff,#5c6af7 40%,#1d294a)"
								/>
							</div>
						</div>
					</div>

					<div className="relative w-full">
						<button className="absolute left-[50%] cursor-pointer translate-y-[-50%] translate-x-[-50%] rounded-[16px] z-10 flex h-11 w-11 items-center justify-center border-4 border-[#131313] bg-[#151b2b] text-xl transition">
							{/* <ArrowDownSvgIcon
								fontSize="small"
								sx={{ color: '#FF37C7', fontSize: 24, opacity: 0.3 }}
							/> */}
							<SvgIcon
								component={MoveDown}
								sx={{ color: '#ffffff', fontSize: 24 }}
								inheritViewBox
							/>
						</button>
					</div>

					<div className="rounded-[24px] border border-white/8 bg-[#161f33] p-4">
						<div className="mb-3 flex items-center justify-between text-[16px] font-bold uppercase tracking-[0.2em] text-[#ffffffa6]">
							<span>{t('swap.buy')}</span>
						</div>
						<div className="flex items-center justify-between gap-4">
							<div className="text-[2.2rem] font-medium tracking-[-0.07em] text-white">
								0.54
							</div>
							<div className="flex items-center justify-end">
								<TokenBadge
									symbol="USDC"
									name="USD Coin"
									color="linear-gradient(135deg,#6fe8ff,#4bd3bd 40%,#184c57)"
								/>
							</div>
						</div>
					</div>
				</div>
				<CustomConnectButton>
					{({ connected, chain, account, openAccountModal, openConnectModal }) => {
						// console.log('chain', connected, chain, account);
						// address只显示前后共4位
						// const shortAddress = account
						// 	? `${account.address.slice(0, 4)}...${account.address.slice(-4)}`
						// 	: '';
						return !connected ? (
							<Button
								onClick={openConnectModal}
								className="w-full rounded-full! mt-5! text-white! hover:text-(--swap-hover-background)! bg-(--swap-background)!"
							>
								{t('swap.connectWallet')}
							</Button>
						) : (
							<Button className="mt-5! flex w-full items-center justify-center rounded-full! px-5 py-4 text-base font-semibold text-black/80! transition bg-[linear-gradient(135deg,#6fe8ff,#4bd3bd_35%,#2dbf9a)]! hover:brightness-110">
								{t('swap.reviewSwap')}
							</Button>
						);
					}}
				</CustomConnectButton>
			</div>
		</div>
	);
}
