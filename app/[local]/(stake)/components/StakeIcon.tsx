'use client';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import Button from '@mui/material/Button';

/**
 * sx={{
				color: '#38bdf8',
				'&:hover': {
					backgroundColor:
						theme.palette.mode === 'dark'
							? theme.palette.grey[600]
							: theme.palette.grey[300],
				},
			}}
*/
export default function StakeIcon() {
	const theme = useTheme();
	return (
		<Button
			variant="outlined"
			className="shadow-[#38dbf8] shadow shadow-border bg-primary-500/10 text-[#38dbf8]! rounded-full! border-color-[#38bdf8]! border! min-w-fit! w-18! h-18! transition-transform duration-2500 ease-in-out animate-[spin_2s_linear_infinite]"
		>
			<AutoGraphRoundedIcon fontSize="large" />
		</Button>
	);
}
