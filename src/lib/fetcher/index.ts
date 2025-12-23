export default async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);

  return response.json() as unknown as T;
}
