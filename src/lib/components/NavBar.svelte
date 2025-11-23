<script lang="ts">
	import { onMount } from 'svelte';

	let scrollY = $state(0);
	let isScrolled = $derived(scrollY > 50);

	onMount(() => {
		const handleScroll = () => {
			scrollY = window.scrollY;
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});

	function scrollToSection(id: string) {
		const element = document.getElementById(id);
		if (element) {
			const offset = 80;
			const elementPosition = element.getBoundingClientRect().top;
			const offsetPosition = elementPosition + window.pageYOffset - offset;

			window.scrollTo({
				top: offsetPosition,
				behavior: 'smooth'
			});
		}
	}
</script>

<nav class="navbar" class:scrolled={isScrolled}>
	<div class="navbar-container">
		<button class="nav-brand" onclick={() => scrollToSection('overview')}>
			
			<span class="brand-text">Economic Dashboard</span>
		</button>

		<ul class="nav-links">
			<li>
				<button class="nav-link" onclick={() => scrollToSection('overview')}>Overview</button>
			</li>
			<li>
				<button class="nav-link" onclick={() => scrollToSection('economic')}>
					Economic Indicators
				</button>
			</li>
			<li>
				<button class="nav-link" onclick={() => scrollToSection('energy')}>Energy Prices</button>
			</li>
			<li>
				<button class="nav-link" onclick={() => scrollToSection('methodology')}>
					Sources
				</button>
			</li>
		</ul>
	</div>
</nav>

<style>
	.navbar {
		position: sticky;
		top: 0;
		z-index: 50;
		background-color: rgba(10, 10, 10, 0.8);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid transparent;
		transition: all 0.3s ease;
	}

	.navbar.scrolled {
		background-color: rgba(10, 10, 10, 0.95);
		border-bottom-color: var(--color-border);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
	}

	.navbar-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 1rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.nav-brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		transition: opacity 0.2s ease;
	}

	.nav-brand:hover {
		opacity: 0.8;
	}

	.brand-icon {
		font-size: 1.5rem;
	}

	.brand-text {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-accent);
		letter-spacing: -0.01em;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav-link {
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.5rem 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 6px;
	}

	.nav-link:hover {
		color: var(--color-accent);
		background-color: rgba(255, 90, 31, 0.1);
	}

	@media (max-width: 768px) {
		.navbar-container {
			flex-direction: column;
			gap: 1rem;
			padding: 0.75rem 1rem;
		}

		.nav-links {
			flex-wrap: wrap;
			justify-content: center;
			gap: 0.25rem;
		}

		.nav-link {
			font-size: 0.8125rem;
			padding: 0.375rem 0.75rem;
		}

		.brand-text {
			font-size: 1rem;
		}
	}
</style>

