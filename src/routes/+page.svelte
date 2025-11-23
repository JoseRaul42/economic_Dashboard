<script lang="ts">
	import type { PageData } from './$types';
	import ChartCard from '$lib/components/ChartCard.svelte';
	import IndicatorKpiRow from '$lib/components/IndicatorKpiRow.svelte';

	let { data }: { data: PageData } = $props();

	const wtiSeries = $derived(data.series.find((s) => s.key === 'wti'));
	const unemploymentSeries = $derived(data.series.find((s) => s.key === 'unemployment'));
	const ngasSeries = $derived(data.series.find((s) => s.key === 'ngas'));
	const cpiSeries = $derived(data.series.find((s) => s.key === 'cpi'));
	const inflationSeries = $derived(data.series.find((s) => s.key === 'inflation'));
</script>

<svelte:head>
	<title>US Economic Dashboard</title>
</svelte:head>

<div class="dashboard">
	<header class="hero">
		<h1 class="hero-title">US Economic Dashboard</h1>
		<p class="hero-subtitle">
			Real-time tracking of key economic indicators and energy spot prices
		</p>
	</header>

	<section class="kpi-section">
		<div class="kpi-grid">
			{#if wtiSeries}
				<IndicatorKpiRow label={wtiSeries.label} points={wtiSeries.points} units={wtiSeries.units} />
			{/if}
			{#if unemploymentSeries}
				<IndicatorKpiRow
					label={unemploymentSeries.label}
					points={unemploymentSeries.points}
					units={unemploymentSeries.units}
				/>
			{/if}
			{#if ngasSeries}
				<IndicatorKpiRow label={ngasSeries.label} points={ngasSeries.points} units={ngasSeries.units} />
			{/if}
			{#if cpiSeries}
				<IndicatorKpiRow label={cpiSeries.label} points={cpiSeries.points} units={cpiSeries.units} />
			{/if}
			{#if inflationSeries}
				<IndicatorKpiRow
					label={inflationSeries.label}
					points={inflationSeries.points}
					units={inflationSeries.units}
				/>
			{/if}
		</div>
	</section>

	<section class="charts-section">
		<div class="charts-grid">
			{#if wtiSeries}
				<ChartCard
					title={wtiSeries.label}
					subtitle="Monthly spot prices from EIA"
					points={wtiSeries.points}
					units={wtiSeries.units}
					color="#ff5a1f"
				/>
			{/if}

			{#if unemploymentSeries}
				<ChartCard
					title={unemploymentSeries.label}
					subtitle="U.S. Bureau of Labor Statistics"
					points={unemploymentSeries.points}
					units={unemploymentSeries.units}
					color="#ff7a3f"
				/>
			{/if}

			{#if ngasSeries}
				<ChartCard
					title={ngasSeries.label}
					subtitle="Henry Hub monthly spot prices"
					points={ngasSeries.points}
					units={ngasSeries.units}
					color="#ff9a5f"
				/>
			{/if}

			{#if cpiSeries}
				<ChartCard
					title={cpiSeries.label}
					subtitle="Month-over-month consumer prices"
					points={cpiSeries.points}
					units={cpiSeries.units}
					color="#ffba7f"
				/>
			{/if}

			{#if inflationSeries}
				<ChartCard
					title={inflationSeries.label}
					subtitle="Year-over-year inflation rate"
					points={inflationSeries.points}
					units={inflationSeries.units}
					color="#ffd09f"
				/>
			{/if}
		</div>
	</section>

	<footer class="dashboard-footer">
		<p class="footer-text">
			Data sources: AlphaVantage API • U.S. Energy Information Administration • Federal Reserve
			Economic Data (FRED)
		</p>
	</footer>
</div>

<style>
	.dashboard {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.hero {
		text-align: center;
		margin-bottom: 3rem;
		padding: 2rem 0;
	}

	.hero-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--color-accent);
		margin-bottom: 0.5rem;
		letter-spacing: -0.02em;
	}

	.hero-subtitle {
		font-size: 1.125rem;
		color: var(--color-text-muted);
		max-width: 600px;
		margin: 0 auto;
	}

	.kpi-section {
		margin-bottom: 3rem;
	}

	.kpi-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
	}

	.charts-section {
		margin-bottom: 3rem;
	}

	.charts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
		gap: 1.5rem;
	}

	@media (max-width: 768px) {
		.hero-title {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1rem;
		}

		.charts-grid {
			grid-template-columns: 1fr;
		}

		.kpi-grid {
			grid-template-columns: 1fr;
		}
	}

	.dashboard-footer {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-border);
		text-align: center;
	}

	.footer-text {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}
</style>



