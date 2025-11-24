<script lang="ts">
	import type { DataPoint } from '../../routes/+page.server';

	interface Props {
		label: string;
		points: DataPoint[];
		units: string;
	}

	let { label, points, units }: Props = $props();

	const latestValue = $derived(() => {
		if (points.length === 0) return null;
		const sorted = [...points].sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		);
		return sorted[0];
	});

	const momChange = $derived(() => {
		if (points.length < 2) return null;
		const sorted = [...points].sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		);
		const current = sorted[0].value;
		const previous = sorted[1].value;
		const change = ((current - previous) / previous) * 100;
		return change;
	});
</script>

<div class="kpi-row">
	<div class="kpi-label">{label}</div>
	<div class="kpi-values">
		{#if latestValue()}
			<span class="kpi-value">{latestValue()?.value.toFixed(2)} {units}</span>
			{#if momChange() !== null}
				<span class="kpi-change" class:positive={momChange()! > 0} class:negative={momChange()! < 0}>
					{momChange()! > 0 ? '+' : ''}{momChange()!.toFixed(2)}%
				</span>
			{/if}
		{:else}
			<span class="kpi-value text-muted">No data</span>
		{/if}
	</div>
</div>

<style>
	.kpi-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background-color: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		transition: border-color 0.3s ease;
	}

	.kpi-row:hover {
		border-color: var(--color-accent);
	}

	.kpi-label {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.kpi-values {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.kpi-value {
		font-size: 1rem;
		font-weight: 600;
		color: #e5e5e5;
	}

	.kpi-change {
		font-size: 0.875rem;
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

	.text-muted {
		color: var(--color-text-muted);
	}
</style>


