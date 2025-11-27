import { env } from '$env/dynamic/private';

const apiKey = env.alphaVantage_key;

export async function getRealGDP() {
    const url = `https://www.alphavantage.co/query?function=REAL_GDP&interval=annual&apikey=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`AlphaVantage API error: ${response.statusText}`);
    }

    return response.json();
}
