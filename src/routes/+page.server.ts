import { getMonthlyTimeSeries } from '$lib/server/monthly';
import { getUnemploymentData } from '$lib/server/unemployment';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const getMonthlyTimeSeriesData = await getMonthlyTimeSeries('WTI');
	const unemploymentData = await getUnemploymentData();
	
	return {
		timeSeries: getMonthlyTimeSeriesData,
		unemployment: unemploymentData
	};
};