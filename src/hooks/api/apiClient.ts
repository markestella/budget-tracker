export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type ApiBody = RequestInit['body'] | object | null;

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: ApiBody;
}

function isBodyInit(value: NonNullable<ApiBody>): value is BodyInit {
  return (
    typeof value === 'string' ||
    value instanceof Blob ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value)
  );
}

export async function apiClient<T>(
  input: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (options.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const requestBody =
    options.body == null
      ? undefined
      : isBodyInit(options.body)
        ? options.body
        : JSON.stringify(options.body);

  const response = await fetch(input, {
    ...options,
    headers,
    credentials: 'same-origin',
    body: requestBody,
  });

  if (!response.ok) {
    let details: unknown;
    let message = 'Request failed';

    try {
      details = await response.json();
      if (
        details &&
        typeof details === 'object' &&
        'error' in details &&
        typeof details.error === 'string'
      ) {
        message = details.error;
      }
    } catch {
      message = response.statusText || message;
    }

    throw new ApiError(message, response.status, details);
  }

  return (await response.json()) as T;
}