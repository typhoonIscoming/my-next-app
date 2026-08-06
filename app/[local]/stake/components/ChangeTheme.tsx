'use client';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MaterialUISwitch } from './AntSwitch';

type Props = {
	lightLabel: string;
	darkLabel: string;
};

export default function ChangeTheme({ lightLabel, darkLabel }: Props) {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleChange = () => {
		setTheme(theme === 'dark' ? 'light' : 'dark');
	};

	return (
		<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
			<Typography className="dark:text-zinc-300">{lightLabel}</Typography>
			<MaterialUISwitch
				checked={mounted ? theme === 'dark' : false}
				onChange={handleChange}
				slotProps={{ input: { 'aria-label': 'ant design' } }}
			/>
			<Typography className="dark:text-zinc-300">{darkLabel}</Typography>
		</Stack>
	);
}
