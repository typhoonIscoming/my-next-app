'use client';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AntSwitch } from './AntSwitch';

export default function ChangeTheme() {
	const t = useTranslations('changeTheme');
	const { theme, setTheme } = useTheme();
	const handleChange = () => {
		setTheme(theme === 'dark' ? 'light' : 'dark');
	};
	return (
		<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
			<Typography>{t('light')}</Typography>
			<AntSwitch
				checked={theme === 'dark'}
				onChange={handleChange}
				slotProps={{ input: { 'aria-label': 'ant design' } }}
			/>
			<Typography>{t('dark')}</Typography>
		</Stack>
	);
}
