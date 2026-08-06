'use client';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MaterialUISwitch } from './AntSwitch';

export default function ChangeTheme() {
	const t = useTranslations('changeTheme');
	const { theme, setTheme } = useTheme();
	const handleChange = () => {
		setTheme(theme === 'dark' ? 'light' : 'dark');
	};
	return (
		<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
			<Typography className="dark:text-zinc-300">{t('light')}</Typography>
			<MaterialUISwitch
				checked={theme === 'dark'}
				onChange={handleChange}
				slotProps={{ input: { 'aria-label': 'ant design' } }}
			/>
			<Typography className="dark:text-zinc-300">{t('dark')}</Typography>
		</Stack>
	);
}
