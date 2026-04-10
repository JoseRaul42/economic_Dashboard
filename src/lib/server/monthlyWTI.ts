import { env } from '$env/dynamic/private';

const apiKey = env.fred_key;

export async function getMonthlyTimeSeries() {
	const url = `https://api.stlouisfed.org/fred/series/observations?series_id=DCOILWTICO&api_key=${apiKey}&file_type=json&frequency=m`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`FRED API error: ${response.statusText}`);
	}

	return response.json();
}
