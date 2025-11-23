import { getMonthlyTimeSeries } from '$lib/server/monthlyWTI';
import { getUnemploymentData } from '$lib/server/unemployment';
import { getMonthlyNgasData } from '$lib/server/monthlyNgas';
import { getMonthlyConsumerPriceIndexData } from '$lib/server/monthlyConsumerPriceIndex';
import { getYearlyInflationData } from '$lib/server/yearlyInflation';
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

export const load: PageServerLoad = async ({ setHeaders }) => {
	try {
		// Set cache headers for CDN and browser caching
		setHeaders({
			'cache-control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
		});

		const [wtiData, unemploymentData, ngasData, cpiData, inflationData] = await Promise.all([
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
			})
		]);

		// Log raw data for debugging (visible in Vercel Function Logs)
		console.log('[API Debug] WTI data:', JSON.stringify(wtiData).substring(0, 300));
		console.log('[API Debug] Unemployment data:', JSON.stringify(unemploymentData).substring(0, 300));
		console.log('[API Debug] NGAS data:', JSON.stringify(ngasData).substring(0, 300));
		console.log('[API Debug] CPI data:', JSON.stringify(cpiData).substring(0, 300));
		console.log('[API Debug] Inflation data:', JSON.stringify(inflationData).substring(0, 300));

		// Check for API rate limit messages
		if (wtiData && 'Note' in wtiData) {
			console.warn('[API Rate Limit] WTI:', wtiData.Note);
		}
		if (unemploymentData && 'Note' in unemploymentData) {
			console.warn('[API Rate Limit] Unemployment:', unemploymentData.Note);
		}

		const series: Series[] = [
			{
				key: 'wti',
				label: 'WTI Crude Oil (MoM)',
				units: 'USD/barrel',
				points: normalizeAlphaVantageData(wtiData, 'wti')
			},
			{
				key: 'unemployment',
				label: 'Unemployment Rate (MoM)',
				units: '%',
				points: normalizeAlphaVantageData(unemploymentData, 'unemployment')
			},
			{
				key: 'ngas',
				label: 'Henry Hub Natural Gas (MoM)',
				units: 'USD/MMBtu',
				points: normalizeAlphaVantageData(ngasData, 'ngas')
			},
			{
				key: 'cpi',
				label: 'Consumer Price Index (MoM)',
				units: 'Index',
				points: normalizeAlphaVantageData(cpiData, 'cpi')
			},
			{
				key: 'inflation',
				label: 'Yearly Inflation (YoY)',
				units: '%',
				points: normalizeAlphaVantageData(inflationData, 'inflation')
			}
		];

		// Log parsed series counts
		series.forEach((s) => {
			console.log(`${s.key}: ${s.points.length} data points`);
		});

		return { series };
	} catch (error) {
		console.error('Load function error:', error);
		// Return empty series on error
		return {
			series: [
				{ key: 'wti', label: 'WTI Crude Oil', units: 'USD/barrel', points: [] },
				{ key: 'unemployment', label: 'Unemployment Rate', units: '%', points: [] },
				{ key: 'ngas', label: 'Henry Hub Natural Gas', units: 'USD/MMBtu', points: [] },
				{ key: 'cpi', label: 'Consumer Price Index', units: 'Index', points: [] },
				{ key: 'inflation', label: 'Yearly Inflation (YoY)', units: '%', points: [] }
			]
		};
	}
};