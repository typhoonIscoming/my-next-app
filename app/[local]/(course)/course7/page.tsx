import LikeButton from './components/LikeButton'
import ChartClient from './components/ChartClient'
import ChartLazy from './components/ChartLazy'
import ServerComment from './components/serverComment'
import ClientComment from './components/clientComment'

type Props = {
	params: Promise<{ local: string }>
}

export async function generateStaticParams() {
	return [{ local: 'zh' }]
}

export default async function Course7Page({ params }: Props) {
	const { local } = await params
	console.log('Course 7 params:', local)
	return (
		<main className="p-4">
			<h1 className="text-2xl font-bold mb-4">课程 7</h1>
			<LikeButton initialCount={0} />
			<div className="flex gap-4">
				<ChartClient />
				<ChartLazy />
			</div>
			<p>
				服务器组件负责“取数与模板”，客户端组件负责“交互与副作用”。把不需要浏览器
				JS 的事情交给服务器做，页面更快、包更小、边界更清晰
			</p>
			<div className="flex gap-4">
				<ServerComment></ServerComment>
				<ClientComment />
			</div>
		</main>
	)
}
