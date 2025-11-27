import { getMonthlyTimeSeries } from '$lib/server/monthlyWTI';
import { getUnemploymentData } from '$lib/server/unemployment';
import { getMonthlyNgasData } from '$lib/server/monthlyNgas';
import { getMonthlyConsumerPriceIndexData } from '$lib/server/monthlyConsumerPriceIndex';
import { getYearlyInflationData } from '$lib/server/yearlyInflation';
import { getFederalFundsRate } from '$lib/server/federalFundsRate';
import { getRealGDP } from '$lib/server/realGDP';
import { getTreasuryYield } from '$lib/server/treasuryYield';
import {
	getMarketInsights,
	type IndicatorData,
	type PerplexityInsightResponse
} from '$lib/server/perplexityInsights';
import type { PageServerLoad } from './$types';
import * as fs from 'fs';
import * as path from 'path';

// Enable ISR (Incremental Static Regeneration) for Vercel
// This caches the page for 24 hours to avoid hitting API rate limits
export const config = {
	isr: {
		expiration: 86400 // Cache for 24 hours (86400 seconds)
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
	indicator: string;
	summary: string;
	trend: 'rise' | 'neutral' | 'lower';
	drivers: string[];
	forward_outlook: string;
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

// Cache interface
interface CacheData {
	timestamp: number;
	data: {
		[key: string]: any;
	};
}

// Detect if we're in production (Vercel)
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// Use /tmp in production (Vercel), current directory in dev
const CACHE_DIR = isProduction ? '/tmp' : '.';
const CACHE_FILE = path.join(CACHE_DIR, 'api-cache.json');
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const INSIGHTS_CACHE_FILE = path.join(CACHE_DIR, 'insights-cache.json');

// Helper to fetch Perplexity insights with monthly caching
async function fetchInsightsWithMonthlyCache(
	fetchFn: () => Promise<PerplexityInsightResponse>
): Promise<PerplexityInsightResponse> {
	const cachePath = INSIGHTS_CACHE_FILE;
	const now = new Date();

	// Try to read from cache
	try {
		if (fs.existsSync(cachePath)) {
			const fileContent = fs.readFileSync(cachePath, 'utf-8');
			const cache = JSON.parse(fileContent);

			if (cache.insights && cache.cachedMonth && cache.cachedYear) {
				const cachedDate = new Date(cache.cachedYear, cache.cachedMonth - 1);
				const currentMonth = now.getMonth() + 1;
				const currentYear = now.getFullYear();

				// Check if we're still in the same month
				if (cache.cachedMonth === currentMonth && cache.cachedYear === currentYear) {
					console.log('[Cache] Serving Perplexity insights from monthly cache');
					return { insights: cache.insights };
				}

				// If we're past the cached month, check if it's end of month time
				// Only fetch new insights in the last 3 days of the month
				const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
				const dayOfMonth = now.getDate();

				// If we haven't reached the last 3 days of the month, use cached data
				if (dayOfMonth < daysInMonth - 2) {
					console.log(
						`[Cache] Using previous month's insights (will refresh in last 3 days of month)`
					);
					return { insights: cache.insights };
				}
			}
		}
	} catch (e) {
		console.warn('Failed to read insights cache file:', e);
	}

	// Fetch fresh insights (only in last 3 days of month or if cache is empty)
	console.log('[API] Fetching fresh Perplexity insights');
	try {
		const insights = await fetchFn();

		// Save to cache with current month/year
		const cacheData = {
			insights: insights.insights,
			cachedMonth: now.getMonth() + 1,
			cachedYear: now.getFullYear(),
			cachedDate: now.toISOString()
		};

		try {
			fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
			console.log(`[Cache] Saved insights for ${cacheData.cachedMonth}/${cacheData.cachedYear}`);
		} catch (e) {
			console.warn('Failed to write insights cache file:', e);
		}

		return insights;
	} catch (error) {
		console.error('Error fetching Perplexity insights:', error);

		// Try to return stale cache if available
		try {
			if (fs.existsSync(cachePath)) {
				const fileContent = fs.readFileSync(cachePath, 'utf-8');
				const cache = JSON.parse(fileContent);
				if (cache.insights) {
					console.warn('[Cache] Serving stale insights due to API error');
					return { insights: cache.insights };
				}
			}
		} catch (e) {
			// Ignore cache read errors
		}

		// Return empty insights on error
		return { insights: [] };
	}
}

// Helper to fetch with local file caching (dev only, ISR handles production)
async function fetchWithCache<T>(key: string, fetchFn: () => Promise<T>): Promise<T | null> {
	let cache: CacheData = { timestamp: 0, data: {} };
	const cachePath = CACHE_FILE;

	// Try to read from cache (skip in production - ISR handles it)
	if (!isProduction) {
		try {
			if (fs.existsSync(cachePath)) {
				const fileContent = fs.readFileSync(cachePath, 'utf-8');
				cache = JSON.parse(fileContent);
			}
		} catch (e) {
			// Silently skip if file system is unavailable
		}

		const now = Date.now();
		const isFresh = now - cache.timestamp < CACHE_TTL;

		// Return cached data if fresh and exists
		if (isFresh && cache.data[key]) {
			console.log(`[Cache] Serving ${key} from local cache`);
			return cache.data[key] as T;
		}
	}

	// Fetch fresh data
	console.log(`[API] Fetching fresh data for ${key}`);
	try {
		const data = await fetchFn();

		// Check for AlphaVantage rate limit/error response
		const responseData = data as any;
		if (responseData && (responseData['Information'] || responseData['Note'] || responseData['Error Message'])) {
			console.warn(`[API] Rate limit or error for ${key}, NOT caching:`, responseData);
			// If we have stale data, return it instead of the error
			if (cache.data[key]) {
				console.warn(`[Cache] Serving stale data for ${key} due to API error`);
				return cache.data[key] as T;
			}
			// Return error data (UI will show N/A)
			return data;
		}

		// Update cache only if valid data and in development
		if (!isProduction) {
			cache.data[key] = data;
			cache.timestamp = Date.now();

			// Re-read cache before writing to merge changes
			try {
				if (fs.existsSync(cachePath)) {
					const currentFileContent = fs.readFileSync(cachePath, 'utf-8');
					const currentCache = JSON.parse(currentFileContent);
					cache.data = { ...currentCache.data, ...cache.data };
				}
			} catch (e) {
				// ignore
			}

			// Write to cache (skip if fails in production)
			try {
				fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
			} catch (e) {
				// Silently skip cache write in production (read-only file system)
			}
		}

		return data;
	} catch (e) {
		console.error(`Error fetching ${key}:`, e);
		// Try to return stale data if available
		if (cache.data[key]) {
			console.warn(`[Cache] Serving stale data for ${key} due to fetch error`);
			return cache.data[key] as T;
		}
		return null;
	}
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
			'cache-control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400'
		});

		// Sequential fetching to avoid connection timeouts and respect API concurrency limits
		const wtiData = await fetchWithCache('wti', () => getMonthlyTimeSeries());
		const unemploymentData = await fetchWithCache('unemployment', () => getUnemploymentData());
		const ngasData = await fetchWithCache('ngas', () => getMonthlyNgasData());
		const cpiData = await fetchWithCache('cpi', () => getMonthlyConsumerPriceIndexData());
		const inflationData = await fetchWithCache('inflation', () => getYearlyInflationData());
		const fedFundsData = await fetchWithCache('fedFunds', () => getFederalFundsRate());
		const gdpData = await fetchWithCache('gdp', () => getRealGDP());
		const treasuryData = await fetchWithCache('treasury', () => getTreasuryYield());

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
				label: 'Federal Funds Rate (MoM)',
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
				label: '10-Year Treasury Yield (MoM)',
				units: '%',
				points: treasuryPoints
			}
		];

		// Fetch AI-generated market insights from Perplexity
		const indicatorData: IndicatorData[] = [
			{
				name: 'WTI Crude Oil',
				currentValue: wtiPoints.length > 0 ? wtiPoints[0].value : null,
				previousValue: wtiPoints.length > 1 ? wtiPoints[1].value : null,
				units: 'USD/barrel',
				category: 'energy'
			},
			{
				name: 'Henry Hub Natural Gas',
				currentValue: ngasPoints.length > 0 ? ngasPoints[0].value : null,
				previousValue: ngasPoints.length > 1 ? ngasPoints[1].value : null,
				units: 'USD/MMBtu',
				category: 'energy'
			},
			{
				name: 'Unemployment Rate',
				currentValue: unemploymentPoints.length > 0 ? unemploymentPoints[0].value : null,
				previousValue: unemploymentPoints.length > 1 ? unemploymentPoints[1].value : null,
				units: '%',
				category: 'economic'
			},
			{
				name: 'Consumer Price Index',
				currentValue: cpiPoints.length > 0 ? cpiPoints[0].value : null,
				previousValue: cpiPoints.length > 1 ? cpiPoints[1].value : null,
				units: 'Index',
				category: 'economic'
			},
			{
				name: 'Inflation Rate',
				currentValue: inflationPoints.length > 0 ? inflationPoints[0].value : null,
				previousValue: inflationPoints.length > 1 ? inflationPoints[1].value : null,
				units: '%',
				category: 'economic'
			},
			{
				name: 'Federal Funds Rate',
				currentValue: fedFundsPoints.length > 0 ? fedFundsPoints[0].value : null,
				previousValue: fedFundsPoints.length > 1 ? fedFundsPoints[1].value : null,
				units: '%',
				category: 'monetary'
			},
			{
				name: 'Real GDP',
				currentValue: gdpPoints.length > 0 ? gdpPoints[0].value : null,
				previousValue: gdpPoints.length > 1 ? gdpPoints[1].value : null,
				units: 'Billions USD',
				category: 'economic'
			},
			{
				name: '10-Year Treasury Yield',
				currentValue: treasuryPoints.length > 0 ? treasuryPoints[0].value : null,
				previousValue: treasuryPoints.length > 1 ? treasuryPoints[1].value : null,
				units: '%',
				category: 'monetary'
			}
		];

		// Fetch AI insights with monthly caching (refreshes in last 3 days of each month)
		const aiInsights = await fetchInsightsWithMonthlyCache(() =>
			getMarketInsights(indicatorData)
		);

		return { series, insights: aiInsights.insights };
	} catch (error) {
		console.error('Load function error:', error);
		// Return empty series on error
		return {
			series: [],
			insights: []
		};
	}
};