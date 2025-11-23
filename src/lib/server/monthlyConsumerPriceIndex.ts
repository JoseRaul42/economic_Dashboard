import { env } from '$env/dynamic/private';

const apiKey = env.alphaVantage_key;

export async function getMonthlyConsumerPriceIndexData() {
	const url = `https://www.alphavantage.co/query?function=CPI&interval=monthly&apikey=${apiKey}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`AlphaVantage API error: ${response.statusText}`);
	}

	return response.json();
}
