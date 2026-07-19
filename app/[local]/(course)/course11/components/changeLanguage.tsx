'use client'
import { useTransition } from 'react'
import { useRouter, usePathname } from '@/i18n/navigation'

export default function ChangeLanguage({ local }: { local: string }) {
	const [isPending, startTransition] = useTransition()
	const router = useRouter()
	const pathname = usePathname()
	const handleLanguageChange = () => {
		// 如果点击的是当前语言，什么都不做
		const lang = local === 'en' ? 'zh' : 'en'
		startTransition(() => {
			// 关键：用 replace 方法，只改变 URL 中的语言前缀部分
			// 例如：从 /en/about 变为 /zh/about
			router.replace(pathname, { locale: lang })
		})
	}
	return (
		<div>
			<div onClick={handleLanguageChange}>切换语言</div>
		</div>
	)
}
