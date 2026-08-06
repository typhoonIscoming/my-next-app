import Box from '@mui/material/Box';
import { getTranslations } from 'next-intl/server';
import ChangeLanguage from './changeLanguange';
import ChangeTheme from './ChangeTheme';

export default async function LayoutSetting({ local }: { local: Lang }) {
	const languageT = await getTranslations({ locale: local, namespace: 'LanguageSwitcher' });
	const themeT = await getTranslations({ locale: local, namespace: 'changeTheme' });

	return (
		<Box className="flex items-center gap-4">
			<ChangeTheme lightLabel={themeT('light')} darkLabel={themeT('dark')} />
			<ChangeLanguage local={local} zhLabel={languageT('zh')} enLabel={languageT('en')} />
		</Box>
	);
}
