<script lang="ts">
	import type { DataPoint } from '../../routes/+page.server';
	import ChartCard from './ChartCard.svelte';

	interface Source {
		label: string;
		url: string;
	}

	interface Props {
		title: string;
		subtitle?: string;
		points: DataPoint[];
		units: string;
		color?: string;
		sources: Source[];
		takeaway: string;
	}

	let { title, subtitle, points, units, color = '#ff5a1f', sources, takeaway }: Props = $props();
</script>

<div class="chart-section-card">
	<ChartCard {title} {subtitle} {points} {units} {color} />

	<div class="card-footer">
		<div class="footer-section">
			<h4 class="footer-title">Takeaway</h4>
			<p class="footer-text">{takeaway}</p>
		</div>

		<div class="footer-section">
			<h4 class="footer-title">Sources</h4>
			<ul class="sources-list">
				{#each sources as source}
					<li>
						<a href={source.url} target="_blank" rel="noopener noreferrer" class="source-link">
							{source.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>

<style>
	.chart-section-card {
		display: flex;
		flex-direction: column;
		gap: 0;
		transition: transform 0.2s ease;
	}

	.chart-section-card:hover {
		transform: translateY(-2px);
	}

	.card-footer {
		background-color: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-top: none;
		border-bottom-left-radius: 8px;
		border-bottom-right-radius: 8px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.footer-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.footer-title {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-accent);
		margin: 0;
	}

	.footer-text {
		font-size: 0.875rem;
		line-height: 1.6;
		color: #d1d5db;
		margin: 0;
	}

	.sources-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.source-link {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		text-decoration: none;
		transition: color 0.2s ease;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	.source-link:hover {
		color: var(--color-accent);
	}

	.source-link::before {
		content: '→';
		font-size: 0.75rem;
		opacity: 0.5;
	}
</style>


