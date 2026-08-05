'use client';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AntSwitch } from './AntSwitch';
import useChangeLanguage from '@/hooks/useChangeLang';
import { ChangeEvent } from 'react';

export default function ChangeLanguage({ local }: { local: 'zh' | 'en' }) {
	const { currentLanguage, toggleLanguage } = useChangeLanguage({ local });
	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		toggleLanguage();
	};
	return (
		<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
			<Typography>中文</Typography>
			<AntSwitch
				checked={currentLanguage === 'en'}
				onChange={handleChange}
				slotProps={{ input: { 'aria-label': 'ant design' } }}
			/>
			<Typography>English</Typography>
		</Stack>
	);
}
