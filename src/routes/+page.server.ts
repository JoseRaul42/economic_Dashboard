import { getMonthlyTimeSeries } from '$lib/server/monthlyWTI';
import { getUnemploymentData } from '$lib/server/unemployment';
import { getMonthlyNgasData } from '$lib/server/monthlyNgas';
import type { PageServerLoad } from './$types';
import { getMonthlyConsumerPriceIndexData } from '$lib/server/monthlyConsumerPriceIndex';

export const load: PageServerLoad = async () => {
	const getMonthlyTimeSeriesData = await getMonthlyTimeSeries('WTI');
	const unemploymentData = await getUnemploymentData();
	const monthlyNgasData = await getMonthlyNgasData();
	const monthlyConsumerPriceIndexData = await getMonthlyConsumerPriceIndexData();
	
	return {
		timeSeries: getMonthlyTimeSeriesData,
		unemployment: unemploymentData,
		monthlyNgas: monthlyNgasData,
		monthlyConsumerPriceIndex: monthlyConsumerPriceIndexData
	};
};