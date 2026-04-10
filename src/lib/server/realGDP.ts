import { env } from '$env/dynamic/private';

const apiKey = env.fred_key;

export async function getRealGDP() {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=GDPC1&api_key=${apiKey}&file_type=json&frequency=a`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`FRED API error: ${response.statusText}`);
    }

    return response.json();
}
