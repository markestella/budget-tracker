import { errorResponse, jsonResponse } from '@/lib/api-utils';
import { runDailyNotificationJobs, runWeeklyNotificationJobs } from '@/lib/notifications/scheduler';
import { cronQuerySchema } from '@/lib/validations/notifications';

function isAuthorizedCronRequest(request: Request) {
  const headerValue = request.headers.get('x-vercel-cron');
  const apiKey = process.env.NOTIFICATIONS_API_KEY;
  const authorization = request.headers.get('authorization');

  if (headerValue) {
    return true;
  }

  if (!apiKey) {
    return false;
  }

  return authorization === `Bearer ${apiKey}`;
}

export async function GET(request: Request) {
  try {
    if (!isAuthorizedCronRequest(request)) {
      return errorResponse('Unauthorized', 401);
    }

    const searchParams = new URL(request.url).searchParams;
    const { job } = cronQuerySchema.parse({
      job: searchParams.get('job') ?? undefined,
    });

    const result = job === 'weekly'
      ? await runWeeklyNotificationJobs()
      : await runDailyNotificationJobs();

    return jsonResponse({
      job,
      result,
      success: true,
    });
  } catch (error) {
    console.error('Error executing notification cron:', error);
    return errorResponse('Failed to execute notification cron', 500);
  }
}
