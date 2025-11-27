import { env } from '$env/dynamic/private';

const apiKey = env.alphaVantage_key;

export async function getTreasuryYield() {
    const url = `https://www.alphavantage.co/query?function=TREASURY_YIELD&interval=monthly&maturity=10year&apikey=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`AlphaVantage API error: ${response.statusText}`);
    }

    return response.json();
}
