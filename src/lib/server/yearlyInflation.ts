import { env } from '$env/dynamic/private';

const apiKey = env.fred_key;

export async function getYearlyInflationData() {
	const url = `https://api.stlouisfed.org/fred/series/observations?series_id=FPCPITOTLZGUSA&api_key=${apiKey}&file_type=json`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`FRED API error: ${response.statusText}`);
	}

	return response.json();
}
