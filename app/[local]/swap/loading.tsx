export default function SwapLoading() {
	return (
		<main className="min-h-screen bg-[#050816] text-white">
			<div className="mx-auto max-w-[1440px] px-4 pb-10 pt-4 sm:px-6 lg:px-8">
				<section className="flex min-h-[calc(100vh-120px)] items-center justify-center py-10">
					<div className="w-full max-w-[500px] rounded-[32px] border border-white/10 bg-[#0f1320]/90 p-3 shadow-[0_40px_120px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
						<div className="rounded-[28px] border border-white/8 bg-[#121a2d]/95 p-4">
							<div className="mb-4 flex items-center justify-between px-2 py-1">
								<div className="flex items-center gap-2">
									<span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
									<span className="h-4 w-20 animate-pulse rounded-full bg-white/10" />
								</div>
								<div className="h-9 w-9 animate-pulse rounded-full border border-white/10 bg-white/5" />
							</div>

							<div className="space-y-3">
								<div className="rounded-[24px] border border-white/8 bg-[#161f33] p-4">
									<div className="mb-3 flex items-center justify-between">
										<span className="h-3 w-10 animate-pulse rounded-full bg-white/10" />
										<span className="h-3 w-20 animate-pulse rounded-full bg-white/10" />
									</div>
									<div className="flex items-center justify-between gap-4">
										<div className="h-10 w-28 animate-pulse rounded-xl bg-white/10" />
										<div className="flex items-center gap-3">
											<div className="h-9 w-9 animate-pulse rounded-full bg-violet-500/30" />
											<div className="space-y-1.5">
												<div className="h-2.5 w-12 animate-pulse rounded-full bg-white/10" />
												<div className="h-4 w-16 animate-pulse rounded-full bg-white/10" />
											</div>
										</div>
									</div>
								</div>

								<div className="relative flex justify-center -my-1">
									<div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#151b2b] shadow-[0_12px_30px_rgba(0,0,0,0.38)]">
										<div className="h-5 w-5 animate-pulse rounded-full bg-white/15" />
									</div>
								</div>

								<div className="rounded-[24px] border border-white/8 bg-[#161f33] p-4">
									<div className="mb-3 flex items-center justify-between">
										<span className="h-3 w-10 animate-pulse rounded-full bg-white/10" />
										<span className="h-3 w-20 animate-pulse rounded-full bg-white/10" />
									</div>
									<div className="flex items-center justify-between gap-4">
										<div className="h-10 w-28 animate-pulse rounded-xl bg-white/10" />
										<div className="flex items-center gap-3">
											<div className="h-9 w-9 animate-pulse rounded-full bg-cyan-500/30" />
											<div className="space-y-1.5">
												<div className="h-2.5 w-12 animate-pulse rounded-full bg-white/10" />
												<div className="h-4 w-16 animate-pulse rounded-full bg-white/10" />
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="mt-5 rounded-[22px] border border-white/8 bg-white/2 p-3">
								<div className="flex items-center justify-between text-sm">
									<div className="h-3.5 w-14 animate-pulse rounded-full bg-white/10" />
									<div className="h-3.5 w-28 animate-pulse rounded-full bg-white/10" />
								</div>
								<div className="mt-3 flex items-center justify-between text-sm">
									<div className="h-3.5 w-16 animate-pulse rounded-full bg-white/10" />
									<div className="h-3.5 w-20 animate-pulse rounded-full bg-white/10" />
								</div>
								<div className="mt-3 flex items-center justify-between text-sm">
									<div className="h-3.5 w-20 animate-pulse rounded-full bg-white/10" />
									<div className="h-3.5 w-20 animate-pulse rounded-full bg-white/10" />
								</div>
							</div>

							<div className="mt-5 h-12 animate-pulse rounded-[18px] bg-[linear-gradient(135deg,rgba(178,155,255,0.85),rgba(138,123,255,0.85),rgba(74,93,247,0.85))] shadow-[0_18px_40px_rgba(96,89,255,0.45)]" />
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
