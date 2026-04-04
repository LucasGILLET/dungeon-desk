import { authenticatedFetch } from '@/utils/api';
import { buildApiUrl } from '@/utils/api';

const getBody = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return response.text() as Promise<T>;
};

export const customFetch = async <T>(url: string, options: RequestInit): Promise<T> => {
  const response = await authenticatedFetch(buildApiUrl(url), options);

  if (!response.ok) {
    throw await getBody(response);
  }

  const data = await getBody<unknown>(response);

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
};

export default customFetch;
