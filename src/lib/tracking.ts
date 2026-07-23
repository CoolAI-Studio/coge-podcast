import { logEvent } from 'firebase/analytics';
import { getAnalyticsInstance } from './firebase';

export async function trackEvent(type: string, episodeIdOrParams: string | Record<string, any> = 'global') {
  try {
    const analytics = await getAnalyticsInstance();
    if (analytics) {
      let params: Record<string, any> = {};
      if (typeof episodeIdOrParams === 'string') {
        params = { episode_id: episodeIdOrParams };
      } else {
        params = episodeIdOrParams;
      }
      
      logEvent(analytics, type, params);
    }
  } catch (error) {
    console.error('Tracking failed:', error);
  }
}
