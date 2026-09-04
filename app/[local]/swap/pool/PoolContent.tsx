'use client';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useTranslations } from 'next-intl';
import CustomConnectButton from '@/app/components/CustomConnectButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import SvgIcon from '@mui/material/SvgIcon';
import Flower from '@/public/flower-svgrepo-com.svg';
import Leaf from '@/public/maple-leaf-svgrepo-com.svg';
import Leaf2 from '@/public/leaf-svgrepo-com.svg';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Link from 'next/link';

export function AddPosition({ label }: { label: string }) {
	const [open, setOpen] = useState(false);
	const handleClose = () => setOpen(false);
	const t = useTranslations('swap');
	const { isConnected } = useAccount();
	const handleConnect = () => {
		if (!isConnected) {
			setOpen(true);
			return;
		}
		console.log('1111');
	};
	return (
		<>
			<Box className="flex justify-end gap-4">
				<button
					className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[linear-gradient(135deg,#6fe8ff,#4bd3bd_35%,#2dbf9a)] px-5 py-2.5 text-sm font-semibold text-[#07131a] shadow-[0_0px_20px_rgba(59,201,175,0.35)] transition hover:brightness-110"
					onClick={handleConnect}
				>
					+ {label}
				</button>
				{isConnected && (
					<Link href="/swap/position">
						<button className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[linear-gradient(135deg,#6fe8ff,#4bd3bd_35%,#2dbf9a)] px-5 py-2.5 text-sm font-semibold text-[#07131a] shadow-[0_0px_20px_rgba(59,201,175,0.35)] transition hover:brightness-110">
							+ {t('myPositions')}
						</button>
					</Link>
				)}
			</Box>
			<Snackbar
				open={open}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				autoHideDuration={3000}
				onClose={handleClose}
			>
				<Alert severity="warning" sx={{ width: '100%' }}>
					{t('pleaseConnectWallet')}
				</Alert>
			</Snackbar>
		</>
	);
}

export function EmptyPool() {
	const { isConnected } = useAccount();
	const t = useTranslations('swap');
	return isConnected ? (
		<div className="relative overflow-hidden flex flex-col items-center justify-center rounded-[24px] border border-white/10 bg-white/3 p-8 text-center text-zinc-400">
			<h3 className="text-[24px] font-semibold text-white">{t('emptyPositionTitle')}</h3>
			<p className="mt-2 text-[16px]">{t('emptyPosition')}</p>
			<SvgIcon
				component={Flower}
				inheritViewBox
				className="absolute bottom-4 left-5 md:left-16 transform rotate-343"
				sx={{ color: '#FF37C7', fontSize: 84, opacity: 0.3 }}
			/>
			<SvgIcon
				component={Leaf}
				inheritViewBox
				className="absolute bottom-4 right-1 md:right-6 transform rotate-343"
				sx={{ color: '#FF37C7', fontSize: 84, opacity: 0.3 }}
			/>
			<SvgIcon
				component={Leaf2}
				inheritViewBox
				className="absolute top-[-30] right-5 md:right-50 transform rotate-[-17]"
				sx={{ color: '#FF37C7', fontSize: 84, opacity: 0.3 }}
			/>
		</div>
	) : (
		<div className="relative overflow-hidden flex flex-col items-center justify-center rounded-[24px] border border-white/10 bg-white/3 p-8 text-center text-zinc-400">
			<SvgIcon
				component={Flower}
				inheritViewBox
				className="absolute bottom-4 left-5 md:left-16 transform rotate-343"
				sx={{ color: '#FF37C7', fontSize: 84, opacity: 0.3 }}
			/>
			<SvgIcon
				component={Leaf}
				inheritViewBox
				className="absolute bottom-4 right-1 md:right-6 transform rotate-343"
				sx={{ color: '#FF37C7', fontSize: 84, opacity: 0.3 }}
			/>
			<SvgIcon
				component={Leaf2}
				inheritViewBox
				className="absolute top-[-12] right-5 md:right-50 transform rotate-[-17]"
				sx={{ color: '#FF37C7', fontSize: 84, opacity: 0.3 }}
			/>
			<h3 className="text-[24px] font-semibold text-white">{t('connectYourWallet')}</h3>
			<p className="mt-2 text-[16px]">{t('viewPositions')}</p>
			<Box className="mt-4">
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
								className="rounded-2xl! text-white! hover:text-(--swap-hover-background)! bg-(--swap-background)!"
							>
								{t('connectWallet')}
							</Button>
						) : null;
					}}
				</CustomConnectButton>
			</Box>
		</div>
	);
}
