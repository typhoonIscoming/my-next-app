import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ThemeProvider } from 'next-themes';
import './globals.css';
// import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { routing } from '@/i18n/routing';

// const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
	title: "Typhoon's Space",
	description: 'A cinematic space travel landing page with liquid glass and motion.',
};

export function generateStaticParams() {
	return routing.locales.map((local) => ({ local }));
}

export default function RootLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ local: string }>;
}>) {
	return (
		<Suspense fallback={null}>
			<LocaleProvider params={params}>{children}</LocaleProvider>
		</Suspense>
	);
}

async function LocaleProvider({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ local: string }>;
}) {
	const { local } = await params;
	setRequestLocale(local);
	const messages = await getMessages({ locale: local });

	return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>;
}
