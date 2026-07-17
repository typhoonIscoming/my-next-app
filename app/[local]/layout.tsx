import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import './globals.css'
// import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'

import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { SpeedInsights } from '@vercel/speed-insights/next'

// const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
	title: "Typhoon's Space",
	description:
		'A cinematic space travel landing page with liquid glass and motion.',
}

export default async function RootLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode
	params: Promise<{ local: string }>
}>) {
	const { local } = await params
	const messages = await getMessages({ locale: local })
	return (
		<html
			lang={local}
			className={cn('h-full antialiased', 'font-sans')}
			suppressHydrationWarning
		>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Barlow:wght@300;400;500;600&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body className="min-h-full">
				<SpeedInsights />
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
				>
					<NextIntlClientProvider messages={messages}>
						{children}
					</NextIntlClientProvider>
				</ThemeProvider>
				<Toaster />
			</body>
		</html>
	)
}
