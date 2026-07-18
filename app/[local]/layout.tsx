import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import './globals.css'
// import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'

import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { routing } from '@/i18n/routing'

// const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
	title: "Typhoon's Space",
	description:
		'A cinematic space travel landing page with liquid glass and motion.',
}

export function generateStaticParams() {
	return routing.locales.map((local) => ({ local }))
}

export default async function RootLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode
	params: Promise<{ local: string }>
}>) {
	const { local } = await params
	// 关键：让 next-intl 使用 URL 中已经解析出的语言，
	// 避免它再次从 requestLocale 获取运行时数据。
	setRequestLocale(local)
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
