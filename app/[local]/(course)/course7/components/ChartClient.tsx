// components/ChartClient.tsx
'use client'
import { useEffect, useRef } from 'react'

export default function ChartClient() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const chartRef = useRef<any>(null)

	useEffect(() => {
		let chart: any
		async function render() {
			// 只在客户端执行
			if (typeof window === 'undefined') return

			if (chartRef.current) {
				chartRef.current.destroy()
				chartRef.current = null
			}
			const { Chart } = await import('chart.js/auto')
			const ctx = canvasRef.current!.getContext('2d')!
			chartRef.current = new Chart(ctx, {
				type: 'bar',
				data: {
					labels: ['A', 'B', 'C'],
					datasets: [
						{
							label: '示例数据',
							data: [3, 5, 2],
							backgroundColor: '#60a5fa',
						},
					],
				},
			})
		}
		render()
		return () => {
			if (chartRef.current) {
				chartRef.current.destroy()
				chartRef.current = null
			}
		}
	}, [])

	return (
		<div className="w-1/2">
			<canvas ref={canvasRef} width={300} height={160} />
		</div>
	)
}
