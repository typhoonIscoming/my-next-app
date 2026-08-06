'use client';
import Stack from '@mui/material/Stack';
import useChangeLanguage from '@/hooks/useChangeLang';
import { MouseEvent } from 'react';
import Translate from '@mui/icons-material/Translate';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';

type Props = {
	local: 'zh' | 'en';
	zhLabel: string;
	enLabel: string;
};

export default function ChangeLanguage({ local, zhLabel, enLabel }: Props) {
	const theme = useTheme();
	const { currentLanguage, toggleLanguage } = useChangeLanguage({ local });
	const handleChange = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		toggleLanguage();
	};
	return (
		<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
			<Tooltip arrow placement="bottom" title={currentLanguage === 'zh' ? zhLabel : enLabel}>
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
