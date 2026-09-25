import { useState } from 'react';
import { notFound } from 'next/navigation';
import { ChevronDown, Settings } from 'lucide-react';

function assertValidLocale(locale: Lang) {
	if (!locale) {
		notFound();
	}
}

export default async function MetaSwapPage({ params }: { params: Promise<{ local: Lang }> }) {
	const { local } = await params;
	assertValidLocale(local);

	const [open, setIsOpen] = useState(false);
	const [showSettings, setShowSettings] = useState(false);

	return (
		<div className="min-h-[150vh]">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-semibold text-card-foreground">交换</h2>
				<button
					onClick={() => setShowSettings(!showSettings)}
					className="p-2 hover:bg-accent rounded-lg transition-colors"
				>
					<Settings className="w-5 h-5 text-muted-foreground" />
				</button>
			</div>
		</div>
	);
}
