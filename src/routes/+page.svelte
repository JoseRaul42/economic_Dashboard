<script lang="ts">
	import type { PageData } from './$types';
	import NavBar from '$lib/components/NavBar.svelte';
	import KpiStrip from '$lib/components/KpiStrip.svelte';
	import ChartSectionCard from '$lib/components/ChartSectionCard.svelte';

	let { data }: { data: PageData } = $props();

	const wtiSeries = $derived(data.series.find((s) => s.key === 'wti'));
	const unemploymentSeries = $derived(data.series.find((s) => s.key === 'unemployment'));
	const ngasSeries = $derived(data.series.find((s) => s.key === 'ngas'));
	const cpiSeries = $derived(data.series.find((s) => s.key === 'cpi'));
	const inflationSeries = $derived(data.series.find((s) => s.key === 'inflation'));
</script>

<svelte:head>
	<title>US Economic & Energy Dashboard</title>
	<meta
		name="description"
		content="Interactive dashboard tracking US economic indicators and energy spot prices"
	/>
</svelte:head>

<div class="app">
	<NavBar />

	<!-- Hero Section -->
	<section id="overview" class="hero-section">
		<div class="container">
			<h1 class="hero-title">US Economy & Upstream Energy Dashboard</h1>
			<p class="hero-subtitle">
				Tracking macroeconomic indicators and energy markets through clean,
				real-time visualizations
			</p>
		</div>
	</section>

	<!-- KPI Strip -->
	<KpiStrip series={data.series} />

	<!-- Economic Indicators Section -->
	<section id="economic" class="section economic-section">
		<div class="container">
			<div class="section-header">
				<h2 class="section-title">Economic Indicators</h2>
				<p class="section-description">
					Core macroeconomic metrics tracking inflation, employment, and consumer prices
				</p>
			</div>

			<div class="charts-grid">
				{#if cpiSeries}
					<ChartSectionCard
						title={cpiSeries.label}
						subtitle="Monthly consumer price index"
						points={cpiSeries.points}
						units={cpiSeries.units}
						color="#ff5a1f"
						sources={[
							{
								label: 'U.S. Bureau of Labor Statistics',
								url: 'https://www.bls.gov/cpi/'
							},
							{
								label: 'FRED Economic Data',
								url: 'https://fred.stlouisfed.org/series/CPIAUCSL'
							}
						]}
						takeaway="CPI measures the average change in prices paid by urban consumers for goods and services. Rising CPI indicates inflation, while falling CPI suggests deflation. This is a key indicator for Federal Reserve monetary policy decisions."
					/>
				{/if}

				{#if unemploymentSeries}
					<ChartSectionCard
						title={unemploymentSeries.label}
						subtitle="U.S. unemployment rate"
						points={unemploymentSeries.points}
						units={unemploymentSeries.units}
						color="#ff7a3f"
						sources={[
							{
								label: 'U.S. Bureau of Labor Statistics',
								url: 'https://www.bls.gov/news.release/empsit.toc.htm'
							},
							{
								label: 'FRED - UNRATE',
								url: 'https://fred.stlouisfed.org/series/UNRATE'
							}
						]}
						takeaway="The unemployment rate represents the percentage of the labor force that is jobless and actively seeking employment. Lower rates indicate a healthier economy, though extremely low rates can signal labor shortages and wage inflation."
					/>
				{/if}

				{#if inflationSeries}
					<ChartSectionCard
						title={inflationSeries.label}
						subtitle="Year-over-year inflation"
						points={inflationSeries.points}
						units={inflationSeries.units}
						color="#ff9a5f"
						sources={[
							{
								label: 'AlphaVantage Inflation API',
								url: 'https://www.alphavantage.co/documentation/#inflation'
							},
							{
								label: 'World Bank Data',
								url: 'https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG'
							}
						]}
						takeaway="YoY inflation shows the percentage change in consumer prices compared to the same month last year. The Federal Reserve targets 2% annual inflation as optimal for economic growth. Sustained high inflation erodes purchasing power."
					/>
				{/if}
			</div>
		</div>
	</section>

	<!-- Energy Spot Prices Section -->
	<section id="energy" class="section energy-section">
		<div class="container">
			<div class="section-header">
				<h2 class="section-title">Energy Spot Prices</h2>
				<p class="section-description">
					Real-time commodity prices for crude oil and natural gas, key drivers of inflation and
					economic activity
				</p>
			</div>

			<div class="charts-grid">
				{#if wtiSeries}
					<ChartSectionCard
						title={wtiSeries.label}
						subtitle="West Texas Intermediate crude oil"
						points={wtiSeries.points}
						units={wtiSeries.units}
						color="#d97706"
						sources={[
							{
								label: 'U.S. Energy Information Administration',
								url: 'https://www.eia.gov/dnav/pet/hist/RWTCD.htm'
							},
							{
								label: 'FRED - WTI Spot Price',
								url: 'https://fred.stlouisfed.org/series/DCOILWTICO'
							}
						]}
						takeaway="WTI is a benchmark for U.S. crude oil prices. Oil prices directly impact transportation costs, manufacturing, and consumer goods. Rising oil prices can signal economic growth but also contribute to inflation."
					/>
				{/if}

				{#if ngasSeries}
					<ChartSectionCard
						title={ngasSeries.label}
						subtitle="Henry Hub natural gas spot price"
						points={ngasSeries.points}
						units={ngasSeries.units}
						color="#f59e0b"
						sources={[
							{
								label: 'U.S. Energy Information Administration',
								url: 'https://www.eia.gov/dnav/ng/hist/rngwhhdm.htm'
							},
							{
								label: 'FRED - Henry Hub',
								url: 'https://fred.stlouisfed.org/series/DHHNGSP'
							}
						]}
						takeaway="Henry Hub is the pricing point for natural gas futures in the U.S. Natural gas prices affect heating costs, electricity generation, and industrial production. Seasonal demand and weather patterns drive significant volatility."
					/>
				{/if}
			</div>
		</div>
	</section>

	<!-- Methodology Section -->
	<section id="methodology" class="section methodology-section">
		<div class="container">
			<div class="content-card">
				<h2 class="content-title">Methodology & Data Sources</h2>

				<div class="methodology-grid">
					<div class="methodology-item">
						<h3 class="methodology-subtitle">Data Sources</h3>
						<ul class="methodology-list">
					
							<li>
								<strong>U.S. Energy Information Administration</strong> — Oil and natural gas spot prices
							</li>
							<li>
								<strong>Federal Reserve Economic Data (FRED)</strong> — Historical economic time series
							</li>
							<li><strong>U.S. Bureau of Labor Statistics</strong> — Employment and price data</li>
						</ul>
					</div>

					<div class="methodology-item">
						<h3 class="methodology-subtitle">Data Frequency</h3>
						<ul class="methodology-list">
							<li><strong>Monthly:</strong> CPI, unemployment, energy spot prices</li>
							<li><strong>Annual:</strong> Year-over-year inflation calculations</li>
							<li><strong>Updates:</strong> Data refreshed on page load from live APIs</li>
						</ul>
					</div>

					<div class="methodology-item">
						<h3 class="methodology-subtitle">Calculations</h3>
						<ul class="methodology-list">
							<li>
								<strong>Month-over-Month (MoM):</strong> Percentage change from previous month
							</li>
							<li>
								<strong>Year-over-Year (YoY):</strong> Percentage change from same month last year
							</li>
							<li><strong>Spot Prices:</strong> Current market prices, no averaging applied</li>
						</ul>
					</div>

					<div class="methodology-item">
						<h3 class="methodology-subtitle">Technical Stack</h3>
						<ul class="methodology-list">
							<li><strong>Frontend:</strong> SvelteKit 2 (Svelte 5 runes)</li>
							<li><strong>Charts:</strong> ApexCharts for time-series visualization</li>
							<li><strong>Styling:</strong> Tailwind CSS v4 with custom theme</li>
							<li><strong>Deployment:</strong> Server-side rendering with API data fetching</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- About Section
	<section id="about" class="section about-section">
		<div class="container">
			<div class="content-card">
				<h2 class="content-title">Why I Built This Dashboard</h2>

				<div class="about-content">
					<p>
						This project emerged from a desire to understand how macroeconomic indicators and energy
						markets influence each other. Energy prices—particularly oil and natural gas—are both a
						cause and effect of broader economic trends. Rising energy costs can drive inflation,
						while economic slowdowns reduce energy demand and prices.
					</p>

					<p>
						I wanted to create a tool that makes these relationships visible and digestible. Rather
						than jumping between multiple government websites and data portals, this dashboard brings
						key indicators together in one place with clean, modern visualizations. The goal is to
						make complex economic data accessible without sacrificing depth or accuracy.
					</p>

					<p>
						From a technical perspective, this project demonstrates several skills I value:
						<strong>full-stack development</strong> with SvelteKit's server-side rendering,
						<strong>data visualization</strong> with interactive charts,
						<strong>API integration</strong> from multiple sources, and
						<strong>UI/UX design</strong> that prioritizes clarity and usability. The dashboard is
						responsive, performant, and built with modern web standards.
					</p>

					<p>
						Whether you're tracking inflation trends, monitoring energy markets, or just curious about
						the economy, I hope this dashboard provides value. All data is pulled from authoritative
						sources and updated in real-time, ensuring you're always working with the latest
						information.
					</p>
				</div>
			</div>
		</div>
	</section> -->

	<!-- Footer -->
	<footer class="footer">
		<div class="container">
			<p class="footer-text">
				Built with SvelteKit, ApexCharts, and Tailwind CSS • Data from AlphaVantage, EIA, FRED, and
				BLS
			</p>
			<p class="footer-subtext">
				By <a href="https://www.linkedin.com/in/jose-valois-29a120213/" target="_blank" rel="noopener noreferrer">Jose Valois</a>
			</p>
		</div>
	</footer>
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	/* Hero Section */
	.hero-section {
		padding: 4rem 0 3rem;
		text-align: center;
	}

	.hero-title {
		font-size: 3rem;
		font-weight: 800;
		color: var(--color-accent);
		margin-bottom: 1rem;
		letter-spacing: -0.03em;
		line-height: 1.1;
	}

	.hero-subtitle {
		font-size: 1.25rem;
		color: var(--color-text-muted);
		max-width: 700px;
		margin: 0 auto;
		line-height: 1.6;
	}

	/* Section Styles */
	.section {
		padding: 4rem 0;
		position: relative;
	}

	.section-header {
		margin-bottom: 3rem;
		text-align: center;
	}

	.section-title {
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: 0.75rem;
		letter-spacing: -0.02em;
	}

	.section-description {
		font-size: 1.125rem;
		color: var(--color-text-muted);
		max-width: 700px;
		margin: 0 auto;
		line-height: 1.6;
	}

	/* Economic Section */
	.economic-section {
		background: linear-gradient(
			180deg,
			rgba(255, 90, 31, 0.03) 0%,
			rgba(10, 10, 10, 0) 100%
		);
	}

	.economic-section .section-title {
		color: var(--color-accent);
	}

	/* Energy Section */
	.energy-section {
		background: linear-gradient(180deg, rgba(217, 119, 6, 0.03) 0%, rgba(10, 10, 10, 0) 100%);
	}

	.energy-section .section-title {
		color: #f59e0b;
	}

	/* Charts Grid */
	.charts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
		gap: 2rem;
	}

	/* Content Card */
	.content-card {
		background-color: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 3rem;
		max-width: 900px;
		margin: 0 auto;
	}

	.content-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-accent);
		margin-bottom: 2rem;
		text-align: center;
	}

	/* Methodology */
	.methodology-section {
		background-color: rgba(17, 17, 17, 0.3);
	}

	.methodology-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.methodology-item {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.methodology-subtitle {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-accent);
		margin-bottom: 0.5rem;
	}

	.methodology-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.methodology-list li {
		font-size: 0.9375rem;
		color: #d1d5db;
		line-height: 1.6;
		padding-left: 1.25rem;
		position: relative;
	}

	.methodology-list li::before {
		content: '→';
		position: absolute;
		left: 0;
		color: var(--color-accent);
		font-size: 0.875rem;
	}

	/* About Section */
	.about-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.about-content p {
		font-size: 1.0625rem;
		line-height: 1.8;
		color: #d1d5db;
		margin: 0;
	}

	/* Footer */
	.footer {
		margin-top: auto;
		padding: 3rem 0 2rem;
		border-top: 1px solid var(--color-border);
		text-align: center;
	}

	.footer-text {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-bottom: 0.5rem;
	}

	.footer-subtext {
		font-size: 0.8125rem;
		color: #6b7280;
		font-style: italic;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.hero-title {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1rem;
		}

		.section {
			padding: 3rem 0;
		}

		.section-title {
			font-size: 1.5rem;
		}

		.section-description {
			font-size: 1rem;
		}

		.charts-grid {
			grid-template-columns: 1fr;
		}

		.content-card {
			padding: 2rem 1.5rem;
		}

		.content-title {
			font-size: 1.5rem;
		}

		.methodology-grid {
			grid-template-columns: 1fr;
		}
	}
</style>



