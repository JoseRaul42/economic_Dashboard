<script lang="ts">
	import type { Series } from '../../routes/+page.server';

	interface Props {
		series: Series[];
	}

	let { series }: Props = $props();

	function getLatestValue(s: Series): string {
		if (!s.points || s.points.length === 0) return 'N/A';
		const sorted = [...s.points].sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		);
		return sorted[0].value.toFixed(2);
	}

	function getMoMChange(s: Series): number | null {
		if (!s.points || s.points.length < 2) return null;
		const sorted = [...s.points].sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		);
		const current = sorted[0].value;
		const previous = sorted[1].value;
		return ((current - previous) / previous) * 100;
	}

	const kpiData = $derived(
		series.map((s) => ({
			label: s.label,
			value: getLatestValue(s),
			units: s.units,
			change: getMoMChange(s)
		}))
	);
</script>

<div class="kpi-strip">
	<div class="kpi-container">
		<h3 class="kpi-header">At a Glance</h3>
		<div class="kpi-grid">
			{#each kpiData as kpi}
				<div class="kpi-item">
					<div class="kpi-label">{kpi.label}</div>
					<div class="kpi-value-row">
						<span class="kpi-value">{kpi.value}</span>
						<span class="kpi-units">{kpi.units}</span>
					</div>
					{#if kpi.change !== null}
						<div class="kpi-change" class:positive={kpi.change > 0} class:negative={kpi.change < 0}>
							{kpi.change > 0 ? '↑' : '↓'}
							{Math.abs(kpi.change).toFixed(2)}%
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.kpi-strip {
		background: linear-gradient(
			135deg,
			rgba(255, 90, 31, 0.05) 0%,
			rgba(10, 10, 10, 0.8) 100%
		);
		border-top: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
		padding: 2rem 0;
		margin: 2rem 0;
	}

	.kpi-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.kpi-header {
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-accent);
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.kpi-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.kpi-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 1rem;
		background-color: rgba(17, 17, 17, 0.5);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		transition: all 0.3s ease;
	}

	.kpi-item:hover {
		border-color: var(--color-accent);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 90, 31, 0.1);
	}

	.kpi-label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	.kpi-value-row {
		display: flex;
		align-items: baseline;
		gap: 0.375rem;
		margin-bottom: 0.375rem;
	}

	.kpi-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #e5e5e5;
	}

	.kpi-units {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.kpi-change {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}

	.kpi-change.positive {
		color: #10b981;
		background-color: rgba(16, 185, 129, 0.1);
	}

	.kpi-change.negative {
		color: #ef4444;
		background-color: rgba(239, 68, 68, 0.1);
	}

	@media (max-width: 768px) {
		.kpi-grid {
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
			gap: 1rem;
		}

		.kpi-value {
			font-size: 1.25rem;
		}
	}
</style>

