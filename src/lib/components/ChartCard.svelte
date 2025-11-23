<script lang="ts">
	import { onMount } from 'svelte';
	import type { DataPoint } from '../../routes/+page.server';

	interface Props {
		title: string;
		subtitle?: string;
		points: DataPoint[];
		units: string;
		color?: string;
	}

	let { title, subtitle, points, units, color = '#ff5a1f' }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chart: any;

	onMount(() => {
		let mounted = true;

		(async () => {
			// Don't render chart if no data
			if (!points || points.length === 0) {
				console.warn(`No data points for chart: ${title}`);
				return;
			}

			const ApexCharts = (await import('apexcharts')).default;

			if (!mounted) return;

			const sortedPoints = [...points].sort(
				(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
			);

			const options = {
				chart: {
					type: 'line',
					height: 300,
					background: 'transparent',
					toolbar: {
						show: false
					},
					zoom: {
						enabled: false
					},
					animations: {
						enabled: true,
						easing: 'easeinout',
						speed: 800
					}
				},
				series: [
					{
						name: title,
						data: sortedPoints.map((p) => ({
							x: new Date(p.date).getTime(),
							y: p.value
						}))
					}
				],
				stroke: {
					curve: 'smooth',
					width: 2,
					colors: [color]
				},
				markers: {
					size: 0,
					hover: {
						size: 5
					}
				},
				xaxis: {
					type: 'datetime',
					labels: {
						style: {
							colors: '#9ca3af',
							fontSize: '11px'
						},
						datetimeFormatter: {
							year: 'yyyy',
							month: "MMM 'yy",
							day: 'dd MMM'
						}
					},
					axisBorder: {
						show: false
					},
					axisTicks: {
						show: false
					}
				},
				yaxis: {
					labels: {
						style: {
							colors: '#9ca3af',
							fontSize: '11px'
						},
						formatter: (value: number) => {
							return value.toFixed(2);
						}
					}
				},
				grid: {
					borderColor: '#1f1f1f',
					strokeDashArray: 3,
					xaxis: {
						lines: {
							show: true
						}
					},
					yaxis: {
						lines: {
							show: true
						}
					}
				},
				tooltip: {
					theme: 'dark',
					x: {
						format: 'MMM yyyy'
					},
					y: {
						formatter: (value: number) => {
							return `${value.toFixed(2)} ${units}`;
						}
					},
					style: {
						fontSize: '12px'
					}
				},
				legend: {
					show: false
				}
			};

			chart = new ApexCharts(chartContainer, options);
			chart.render();
		})();

		return () => {
			mounted = false;
			if (chart) {
				chart.destroy();
			}
		};
	});
</script>

<div class="chart-card">
	<div class="chart-header">
		<h3 class="chart-title">{title}</h3>
		{#if subtitle}
			<p class="chart-subtitle">{subtitle}</p>
		{/if}
	</div>
	{#if points && points.length > 0}
		<div bind:this={chartContainer} class="chart-container"></div>
	{:else}
		<div class="no-data">
			<p>No data available</p>
		</div>
	{/if}
</div>

<style>
	.chart-card {
		background-color: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-top-left-radius: 8px;
		border-top-right-radius: 8px;
		border-bottom: none;
		padding: 1.5rem;
		transition: border-color 0.3s ease;
	}

	.chart-header {
		margin-bottom: 1rem;
	}

	.chart-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-accent);
		margin-bottom: 0.25rem;
	}

	.chart-subtitle {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	.chart-container {
		width: 100%;
		min-height: 300px;
	}

	.no-data {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 300px;
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}
</style>

