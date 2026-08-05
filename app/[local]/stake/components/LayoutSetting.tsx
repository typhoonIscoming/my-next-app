'use client';
import Box from '@mui/material/Box';
import ChangeLanguage from './changeLanguange';
import ChangeTheme from './ChangeTheme';

export default function LayoutSetting({ local }: { local: Lang }) {
	return (
		<Box className="flex items-center gap-4">
			<ChangeTheme />
			<ChangeLanguage local={local} />
		</Box>
	);
}
