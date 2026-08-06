'use client';
import Stack from '@mui/material/Stack';
import useChangeLanguage from '@/hooks/useChangeLang';
import { MouseEvent } from 'react';
import Translate from '@mui/icons-material/Translate';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { useTranslations } from 'next-intl';
import { useTheme } from '@mui/material/styles';

export default function ChangeLanguage({ local }: { local: 'zh' | 'en' }) {
	const t = useTranslations('LanguageSwitcher');
	const theme = useTheme();
	const { currentLanguage, toggleLanguage } = useChangeLanguage({ local });
	const handleChange = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		toggleLanguage();
	};
	return (
		<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
			<Tooltip arrow placement="bottom" title={t(currentLanguage === 'zh' ? 'zh' : 'en')}>
				<IconButton
					onClick={handleChange}
					sx={{
						backgroundColor:
							theme.palette.mode === 'dark'
								? theme.palette.grey[800]
								: theme.palette.grey[200],
						color:
							theme.palette.mode === 'dark'
								? theme.palette.grey[100]
								: theme.palette.grey[900],
						'&:hover': {
							backgroundColor:
								theme.palette.mode === 'dark'
									? theme.palette.grey[600]
									: theme.palette.grey[300],
						},
					}}
				>
					<Translate />
				</IconButton>
			</Tooltip>
		</Stack>
	);
}
