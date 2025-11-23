import { env } from '$env/dynamic/private';

const apiKey = env.alphaVantage_key;

export async function getMonthlyTimeSeries() {
	const url = `https://www.alphavantage.co/query?function=WTI&interval=monthly&apikey=${apiKey}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`AlphaVantage API error: ${response.statusText}`);
	}

	return response.json();
}
