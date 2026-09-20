'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Loader2, Droplets, Plus, TrendingUp, TrendingDown } from 'lucide-react';

export default function PositionsPage() {
	const t = useTranslations();
	const [loading] = useState(true);
	return (
		<div className="max-w-[1440px] m-auto px-4 py-4 sm:px-6 lg:px-8 pt-0">
			<h1 className="text-2xl">{t('swap.myPositions')}</h1>
			<h2 className="text-zinc-400 mt-2 mb-8">{t('swap.positionSlogan')}</h2>
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div className="bg-white p-6 rounded-lg border">
					<div className="text-2xl font-bold text-gray-900">
						{loading ? (
							<div className="flex items-center">
								<Loader2 className="h-5 w-5 animate-spin mr-2" />-
							</div>
						) : (
							0
						)}
					</div>
					<div className="text-sm text-gray-600">活跃头寸</div>
				</div>
				<div className="bg-white p-6 rounded-lg border">
					<div className="text-2xl font-bold text-gray-900">
						{loading ? (
							<div className="flex items-center">
								<Loader2 className="h-5 w-5 animate-spin mr-2" />-
							</div>
						) : (
							0
						)}
					</div>
					<div className="text-sm text-gray-600">总价值</div>
				</div>
				<div className="bg-white p-6 rounded-lg border">
					<div className="text-2xl font-bold text-gray-900">
						{loading ? (
							<div className="flex items-center">
								<Loader2 className="h-5 w-5 animate-spin mr-2" />-
							</div>
						) : (
							0
						)}
					</div>
					<div className="text-sm text-gray-600">未领取费用</div>
				</div>
				<div className="bg-white p-6 rounded-lg border">
					<div className="text-2xl font-bold text-gray-900">
						{loading ? (
							<div className="flex items-center">
								<Loader2 className="h-5 w-5 animate-spin mr-2" />-
							</div>
						) : (
							`+${0}%`
						)}
					</div>
					<div className="text-sm text-gray-600">总收益率</div>
				</div>
			</div>
		</div>
	);
}
