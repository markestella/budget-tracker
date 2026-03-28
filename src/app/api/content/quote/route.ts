import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse } from '@/lib/api-utils';
import { getDailyQuote } from '@/lib/content/quoteSelector';

export async function GET() {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const quote = await getDailyQuote();

  return jsonResponse(quote);
}
