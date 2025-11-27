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
	const fedFundsSeries = $derived(data.series.find((s) => s.key === 'fedFunds'));
	const gdpSeries = $derived(data.series.find((s) => s.key === 'gdp'));
	const treasurySeries = $derived(data.series.find((s) => s.key === 'treasury'));

	const insights = $derived(data.insights || []);
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
				Tracking macroeconomic indicators and energy markets through clean, real-time visualizations
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

	<!-- Monetary Policy & Growth Section -->
	<section id="monetary" class="section monetary-section">
		<div class="container">
			<div class="section-header">
				<h2 class="section-title">Monetary Policy & Growth</h2>
				<p class="section-description">
					Key indicators of economic health and Federal Reserve policy stance
				</p>
			</div>

			<div class="charts-grid">
				{#if fedFundsSeries}
					<ChartSectionCard
						title={fedFundsSeries.label}
						subtitle="Effective Federal Funds Rate"
						points={fedFundsSeries.points}
						units={fedFundsSeries.units}
						color="#3b82f6"
						sources={[
							{
								label: 'Federal Reserve',
								url: 'https://www.federalreserve.gov/monetarypolicy/openmarket.htm'
							},
							{
								label: 'FRED - FEDFUNDS',
								url: 'https://fred.stlouisfed.org/series/FEDFUNDS'
							}
						]}
						takeaway="The Federal Funds Rate is the interest rate at which depository institutions trade federal funds (balances held at Federal Reserve Banks) with each other overnight. It is the central bank's primary tool for monetary policy."
					/>
				{/if}

				{#if gdpSeries}
					<ChartSectionCard
						title={gdpSeries.label}
						subtitle="Real Gross Domestic Product"
						points={gdpSeries.points}
						units={gdpSeries.units}
						color="#10b981"
						sources={[
							{
								label: 'U.S. Bureau of Economic Analysis',
								url: 'https://www.bea.gov/data/gdp/gross-domestic-product'
							},
							{
								label: 'FRED - GDPC1',
								url: 'https://fred.stlouisfed.org/series/GDPC1'
							}
						]}
						takeaway="Real GDP is the inflation-adjusted value of the goods and services produced by labor and property located in the United States. It is the broadest measure of economic activity and the primary indicator of the economy's health."
					/>
				{/if}

				{#if treasurySeries}
					<ChartSectionCard
						title={treasurySeries.label}
						subtitle="10-Year Treasury Constant Maturity Rate"
						points={treasurySeries.points}
						units={treasurySeries.units}
						color="#8b5cf6"
						sources={[
							{
								label: 'U.S. Department of the Treasury',
								url: 'https://home.treasury.gov/'
							},
							{
								label: 'FRED - DGS10',
								url: 'https://fred.stlouisfed.org/series/DGS10'
							}
						]}
						takeaway="The 10-year Treasury yield is a benchmark for interest rates on mortgages and other loans. It reflects investor confidence and inflation expectations. An inverted yield curve (10-year lower than 2-year) often signals a recession."
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

	<!-- Market Insights Section -->
	<section id="insights" class="section insights-section">
		<div class="container">
			<div class="section-header">
				<h2 class="section-title">Market Insights</h2>
				<p class="section-description">
					AI-powered analysis of current economic trends and market dynamics
				</p>
			</div>

			{#if insights.length > 0}
				<div class="insights-grid">
					{#each insights as insight}
						<div class="insight-card">
							<div class="insight-header">
								<h3 class="insight-title">{insight.indicator}</h3>
								<div
									class="insight-trend-badge"
									class:trend-rise={insight.trend === 'rise'}
									class:trend-neutral={insight.trend === 'neutral'}
									class:trend-lower={insight.trend === 'lower'}
								>
									{#if insight.trend === 'rise'}
										↑ Rising
									{:else if insight.trend === 'lower'}
										↓ Lower
									{:else}
										→ Stable
									{/if}
								</div>
							</div>

							<p class="insight-summary">{insight.summary}</p>

							{#if insight.drivers && insight.drivers.length > 0}
								<div class="insight-drivers">
									<h4 class="drivers-title">Key Drivers:</h4>
									<ul class="drivers-list">
										{#each insight.drivers as driver}
											<li>{driver}</li>
										{/each}
									</ul>
								</div>
							{/if}

							{#if insight.forward_outlook}
								<div class="insight-outlook">
									<h4 class="outlook-title">Forward Outlook:</h4>
									<p class="outlook-text">{insight.forward_outlook}</p>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="insights-grid">
					<div class="insight-card insight-placeholder">
						<p class="insight-summary">
							Market insights are currently unavailable. Please check back later.
						</p>
					</div>
				</div>
			{/if}
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
							<li><strong>AlphaVantage</strong> — Real-time economic indicators API</li>
						</ul>
					</div>

					<div class="methodology-item">
						<h3 class="methodology-subtitle">Data Frequency</h3>
						<ul class="methodology-list">
							<li><strong>Monthly:</strong> CPI, unemployment, energy spot prices, fed funds</li>
							<li><strong>Annual:</strong> Real GDP, Year-over-year inflation calculations</li>
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
							<li>
								<strong>Correlation:</strong> Pearson correlation coefficient between time series
							</li>
							<li>
								<strong>Volatility:</strong> Annualized standard deviation of monthly percent changes
							</li>
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

	<!-- Footer -->
	<footer class="footer">
		<div class="container">
			<p class="footer-text">
				Built with SvelteKit, ApexCharts, and Tailwind CSS • Data from AlphaVantage, EIA, FRED, and
				BLS
			</p>
			<p class="footer-subtext">
				By <a
					href="https://www.linkedin.com/in/jose-valois-29a120213/"
					target="_blank"
					rel="noopener noreferrer">Jose Valois</a
				>
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
		background: linear-gradient(180deg, rgba(255, 90, 31, 0.03) 0%, rgba(10, 10, 10, 0) 100%);
	}

	.economic-section .section-title {
		color: var(--color-accent);
	}

	/* Monetary Section */
	.monetary-section {
		background: linear-gradient(180deg, rgba(59, 130, 246, 0.03) 0%, rgba(10, 10, 10, 0) 100%);
	}

	.monetary-section .section-title {
		color: #3b82f6;
	}

	/* Energy Section */
	.energy-section {
		background: linear-gradient(180deg, rgba(217, 119, 6, 0.03) 0%, rgba(10, 10, 10, 0) 100%);
	}

	.energy-section .section-title {
		color: #f59e0b;
	}

	/* Insights Section */
	.insights-section {
		background-color: rgba(17, 17, 17, 0.2);
	}

	.insights-section .section-title {
		color: #10b981;
	}

	.insights-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.insight-card {
		background-color: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 1.5rem;
		transition: all 0.3s ease;
	}

	.insight-card:hover {
		border-color: var(--color-accent);
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(255, 90, 31, 0.1);
	}

	.insight-card.insight-placeholder {
		text-align: center;
		padding: 3rem;
		border-style: dashed;
	}

	.insight-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		gap: 1rem;
	}

	.insight-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.insight-trend-badge {
		padding: 0.375rem 0.75rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 600;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.insight-trend-badge.trend-rise {
		color: #10b981;
		background-color: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.3);
	}

	.insight-trend-badge.trend-lower {
		color: #ef4444;
		background-color: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
	}

	.insight-trend-badge.trend-neutral {
		color: #8b5cf6;
		background-color: rgba(139, 92, 246, 0.1);
		border: 1px solid rgba(139, 92, 246, 0.3);
	}

	.insight-summary {
		font-size: 0.9375rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		margin: 0 0 1.25rem 0;
	}

	.insight-drivers {
		margin-top: 1.25rem;
		padding: 1rem;
		background-color: rgba(255, 90, 31, 0.05);
		border-left: 3px solid var(--color-accent);
		border-radius: 6px;
	}

	.drivers-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-accent);
		margin: 0 0 0.75rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.drivers-list {
		margin: 0;
		padding-left: 1.25rem;
		color: var(--color-text-muted);
	}

	.drivers-list li {
		font-size: 0.875rem;
		line-height: 1.6;
		margin-bottom: 0.5rem;
	}

	.drivers-list li:last-child {
		margin-bottom: 0;
	}

	.insight-outlook {
		margin-top: 1.25rem;
		padding: 1rem;
		background-color: rgba(139, 92, 246, 0.05);
		border-left: 3px solid #8b5cf6;
		border-radius: 6px;
	}

	.outlook-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #8b5cf6;
		margin: 0 0 0.5rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.outlook-text {
		font-size: 0.9375rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		margin: 0;
		font-style: italic;
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
