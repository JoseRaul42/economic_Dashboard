import { getMonthlyTimeSeries } from '$lib/server/monthlyWTI';
import { getUnemploymentData } from '$lib/server/unemployment';
import { getMonthlyNgasData } from '$lib/server/monthlyNgas';
import { getMonthlyConsumerPriceIndexData } from '$lib/server/monthlyConsumerPriceIndex';
import { getYearlyInflationData } from '$lib/server/yearlyInflation';
import { getFederalFundsRate } from '$lib/server/federalFundsRate';
import { getRealGDP } from '$lib/server/realGDP';
import { getTreasuryYield } from '$lib/server/treasuryYield';
import type { PageServerLoad } from './$types';

// Enable ISR (Incremental Static Regeneration) for Vercel
// This caches the page for 1 hour to avoid hitting API rate limits
export const config = {
	isr: {
		expiration: 3600 // Cache for 1 hour (3600 seconds)
	}
};

export interface DataPoint {
	date: string;
	value: number;
}

export interface Series {
	key: string;
	label: string;
	units: string;
	points: DataPoint[];
}

export interface Insight {
	title: string;
	value: string;
	description: string;
	trend?: 'up' | 'down' | 'neutral';
}

interface RawDataPoint {
	date: string;
	value: string;
}

interface RawApiResponse {
	name?: string;
	interval?: string;
	unit?: string;
	data?: RawDataPoint[];
}

function normalizeAlphaVantageData(rawData: RawApiResponse | null, key: string): DataPoint[] {
	// Handle case where rawData might be undefined or null
	if (!rawData) {
		console.warn(`No data received for ${key}`);
		return [];
	}

	// Check if data array exists
	if (!rawData.data || !Array.isArray(rawData.data)) {
		console.warn(`Invalid data structure for ${key}:`, rawData);
		return [];
	}

	// Map and parse the data points
	return rawData.data
		.map((item: RawDataPoint) => {
			const value = parseFloat(item.value);
			// Skip invalid entries
			if (!item.date || isNaN(value)) {
				console.warn(`Invalid data point in ${key}:`, item);
				return null;
			}
			return {
				date: item.date,
				value: value
			};
		})
		.filter((item): item is DataPoint => item !== null);
}

// Helper to calculate correlation between two series
function calculateCorrelation(series1: DataPoint[], series2: DataPoint[]): number | null {
	// Create maps for faster lookup
	const map1 = new Map(series1.map((p) => [p.date, p.value]));
	const map2 = new Map(series2.map((p) => [p.date, p.value]));

	// Find common dates
	const commonDates = series1
		.map((p) => p.date)
		.filter((date) => map2.has(date))
		.sort(); // Sort chronologically

	if (commonDates.length < 12) return null; // Need at least a year of overlapping data

	const n = commonDates.length;
	const x = commonDates.map((date) => map1.get(date)!);
	const y = commonDates.map((date) => map2.get(date)!);

	const sumX = x.reduce((a, b) => a + b, 0);
	const sumY = y.reduce((a, b) => a + b, 0);
	const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
	const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
	const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

	const numerator = n * sumXY - sumX * sumY;
	const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

	if (denominator === 0) return 0;
	return numerator / denominator;
}

// Helper to calculate volatility (standard deviation of percent changes)
function calculateVolatility(series: DataPoint[]): number | null {
	if (series.length < 12) return null;

	// Calculate monthly percent changes
	const changes: number[] = [];
	// Sort by date ascending to ensure correct change calculation
	const sorted = [...series].sort((a, b) => a.date.localeCompare(b.date));

	for (let i = 1; i < sorted.length; i++) {
		const prev = sorted[i - 1].value;
		const curr = sorted[i].value;
		if (prev !== 0) {
			changes.push((curr - prev) / prev);
		}
	}

	if (changes.length === 0) return null;

	const n = changes.length;
	const mean = changes.reduce((a, b) => a + b, 0) / n;
	const variance = changes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;

	// Annualize volatility (multiply by sqrt(12))
	return Math.sqrt(variance) * Math.sqrt(12) * 100;
}

export const load: PageServerLoad = async ({ setHeaders }) => {
	try {
		// Set cache headers for CDN and browser caching
		setHeaders({
			'cache-control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
		});

		const [
			wtiData,
			unemploymentData,
			ngasData,
			cpiData,
			inflationData,
			fedFundsData,
			gdpData,
			treasuryData
		] = await Promise.all([
			getMonthlyTimeSeries().catch((e) => {
				console.error('WTI fetch error:', e);
				return null;
			}),
			getUnemploymentData().catch((e) => {
				console.error('Unemployment fetch error:', e);
				return null;
			}),
			getMonthlyNgasData().catch((e) => {
				console.error('Natural Gas fetch error:', e);
				return null;
			}),
			getMonthlyConsumerPriceIndexData().catch((e) => {
				console.error('CPI fetch error:', e);
				return null;
			}),
			getYearlyInflationData().catch((e) => {
				console.error('Inflation fetch error:', e);
				return null;
			}),
			getFederalFundsRate().catch((e) => {
				console.error('Fed Funds fetch error:', e);
				return null;
			}),
			getRealGDP().catch((e) => {
				console.error('GDP fetch error:', e);
				return null;
			}),
			getTreasuryYield().catch((e) => {
				console.error('Treasury Yield fetch error:', e);
				return null;
			})
		]);

		// Process raw data
		const wtiPoints = normalizeAlphaVantageData(wtiData, 'wti');
		const unemploymentPoints = normalizeAlphaVantageData(unemploymentData, 'unemployment');
		const ngasPoints = normalizeAlphaVantageData(ngasData, 'ngas');
		const cpiPoints = normalizeAlphaVantageData(cpiData, 'cpi');
		const inflationPoints = normalizeAlphaVantageData(inflationData, 'inflation');
		const fedFundsPoints = normalizeAlphaVantageData(fedFundsData, 'fedFunds');
		const gdpPoints = normalizeAlphaVantageData(gdpData, 'gdp');
		const treasuryPoints = normalizeAlphaVantageData(treasuryData, 'treasury');

		const series: Series[] = [
			{
				key: 'wti',
				label: 'WTI Crude Oil (MoM)',
				units: 'USD/barrel',
				points: wtiPoints
			},
			{
				key: 'unemployment',
				label: 'Unemployment Rate (MoM)',
				units: '%',
				points: unemploymentPoints
			},
			{
				key: 'ngas',
				label: 'Henry Hub Natural Gas (MoM)',
				units: 'USD/MMBtu',
				points: ngasPoints
			},
			{
				key: 'cpi',
				label: 'Consumer Price Index (MoM)',
				units: 'Index',
				points: cpiPoints
			},
			{
				key: 'inflation',
				label: 'Yearly Inflation (YoY)',
				units: '%',
				points: inflationPoints
			},
			{
				key: 'fedFunds',
				label: 'Federal Funds Rate',
				units: '%',
				points: fedFundsPoints
			},
			{
				key: 'gdp',
				label: 'Real GDP (Annual)',
				units: 'Billions USD',
				points: gdpPoints
			},
			{
				key: 'treasury',
				label: '10-Year Treasury Yield',
				units: '%',
				points: treasuryPoints
			}
		];

		// Calculate Insights
		const insights: Insight[] = [];

		// Correlation: Oil vs Inflation
		const oilInflationCorr = calculateCorrelation(wtiPoints, inflationPoints);
		if (oilInflationCorr !== null) {
			insights.push({
				title: 'Oil & Inflation Correlation',
				value: oilInflationCorr.toFixed(2),
				description:
					oilInflationCorr > 0.5
						? 'Strong positive correlation. Rising oil prices often precede higher inflation.'
						: oilInflationCorr < -0.5
							? 'Strong negative correlation.'
							: 'Moderate or weak correlation. Other factors are influencing inflation.',
				trend: oilInflationCorr > 0 ? 'up' : 'down'
			});
		}

		// Correlation: Fed Funds vs Unemployment
		// (Phillips Curve relationship - often negative in short run, but complex)
		const ratesUnemploymentCorr = calculateCorrelation(fedFundsPoints, unemploymentPoints);
		if (ratesUnemploymentCorr !== null) {
			insights.push({
				title: 'Rates & Unemployment',
				value: ratesUnemploymentCorr.toFixed(2),
				description:
					'Correlation between Federal Funds Rate and Unemployment. Historical theory suggests an inverse relationship (Phillips Curve), though recent data may diverge.',
				trend: ratesUnemploymentCorr > 0 ? 'up' : 'down'
			});
		}

		// Volatility: Oil
		const oilVol = calculateVolatility(wtiPoints);
		if (oilVol !== null) {
			insights.push({
				title: 'Oil Price Volatility',
				value: `${oilVol.toFixed(1)}%`,
				description:
					'Annualized volatility of WTI Crude Oil prices. Higher values indicate greater market uncertainty and price swings.',
				trend: oilVol > 30 ? 'up' : 'neutral'
			});
		}

		// Volatility: Natural Gas
		const ngasVol = calculateVolatility(ngasPoints);
		if (ngasVol !== null) {
			insights.push({
				title: 'Natural Gas Volatility',
				value: `${ngasVol.toFixed(1)}%`,
				description:
					'Annualized volatility of Henry Hub Natural Gas. Natural gas is typically more volatile than oil due to storage constraints and weather dependence.',
				trend: ngasVol > 40 ? 'up' : 'neutral'
			});
		}

		return { series, insights };
	} catch (error) {
		console.error('Load function error:', error);
		// Return empty series on error
		return {
			series: [],
			insights: []
		};
	}
};