<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	interface TimeSeriesEntry {
		'1. open': string;
		'2. high': string;
		'3. low': string;
		'4. close': string;
		'5. volume': string;
	}

	interface UnemploymentEntry {
		date: string;
		value: string;
	}

	// Extract time series data
	const timeSeries = data.timeSeries?.['Monthly Time Series'] || {};
	const entries = Object.entries(timeSeries).slice(0, 5) as [string, TimeSeriesEntry][];

	// Extract unemployment data
	const unemploymentData = data.unemployment?.data || [];
	const unemploymentEntries = unemploymentData.slice(0, 5) as UnemploymentEntry[];
</script>

<h1>Stock Market Data</h1>
<p>Source: U.S. Energy Information Administration, Crude Oil Prices: West Texas Intermediate (WTI) - Cushing, Oklahoma, retrieved from FRED, Federal Reserve Bank of St. Louis.</p>

{#if entries.length > 0}
	<table>
		<thead>
			<tr>
				<th>Date</th>
				<th>Open</th>
				<th>High</th>
				<th>Low</th>
				<th>Close</th>
				<th>Volume</th>
			</tr>
		</thead>
		<tbody>
			{#each entries as [date, values] (date)}
				<tr>
					<td>{date}</td>
					<td>{values['1. open']}</td>
					<td>{values['2. high']}</td>
					<td>{values['3. low']}</td>
					<td>{values['4. close']}</td>
					<td>{values['5. volume']}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p>No data available. Check your API key configuration.</p>
{/if}

<h1>US Unemployment Rate Data</h1>
<p>Source: U.S. Bureau of Labor Statistics, Unemployment Rate, retrieved from FRED, Federal Reserve Bank of St. Louis. This data feed uses the FRED® API but is not endorsed or certified by the Federal Reserve Bank of St. Louis.</p>

{#if unemploymentEntries.length > 0}
	<table>
		<thead>
			<tr>
				<th>Date</th>
				<th>Unemployment Rate (%)</th>
			</tr>
		</thead>
		<tbody>
			{#each unemploymentEntries as entry (entry.date)}
				<tr>
					<td>{entry.date}</td>
					<td>{entry.value}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p>No unemployment data available. Check your API key configuration.</p>
{/if}

<style>
	table {
		border-collapse: collapse;
		width: 100%;
		margin-top: 1rem;
	}

	th,
	td {
		border: 1px solid #ddd;
		padding: 0.75rem;
		text-align: left;
	}

	th {
		background-color: #f2f2f2;
		font-weight: bold;
	}

	tr:nth-child(even) {
		background-color: #f9f9f9;
	}

	tr:hover {
		background-color: #f5f5f5;
	}
</style>



