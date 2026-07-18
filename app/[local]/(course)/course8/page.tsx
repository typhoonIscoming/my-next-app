import { Suspense } from 'react'
import SearchBar from '@/components/SearchBar'
import ChangeTheme from './components/changeTheme'
import { FormDemo } from './components/FormDemo'
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Props = {
	params?: Promise<{ local: string }>
	searchParams: Promise<{ query?: string; page?: string }>
}

// export async function generateStaticParams() {
// 	return [{ local: 'zh' }]
// }

export default function Course8Page() {
	// const { query = '', page = '1' } = await searchParams
	// console.log('Course 8 searchParams:', { query, page })
	// 直接在服务端请求数据，SEO 友好，无 Loading 闪烁
	//   const products = await fetchProducts(query, Number(page))
	return (
		<div className="p-4 rounded-xl bg-white shadow-lg transition-colors duration-200 dark:bg-slate-800 dark:border dark:border-slate-700 border-red-100 border">
			<h1>Course 8</h1>
			<div className="w-[500px]">
				<Suspense>
					<SearchBar />
				</Suspense>
			</div>
			<div className="mt-4">
				<ChangeTheme />
			</div>
			<Card className="w-full mt-10">
				<CardHeader>
					<CardTitle>Create project</CardTitle>
					<CardDescription>
						Deploy your new project in one-click.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FormDemo />
				</CardContent>
				<CardFooter className="justify-end">
					<Button>Deploy</Button>
				</CardFooter>
			</Card>
		</div>
	)
}
