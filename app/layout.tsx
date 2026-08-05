import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
	title: "Typhoon's Space",
	description: 'A cinematic space travel landing page with liquid glass and motion.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={cn('antialiased', 'font-sans')} suppressHydrationWarning>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link
					href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Barlow:wght@300;400;500;600&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body className="m-0 p-0">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
