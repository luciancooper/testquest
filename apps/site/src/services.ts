export class HTTPError extends Error {

    status: number;

    url: string;

    constructor(status: number, url: string) {
        super(`HTTP Error [${status}] -> ${url}`);
        this.status = status;
        this.url = url;
    }
}

export function sendRequest<T = any>(
    endpoint: string,
    { body, ...options }: { method?: string, signal?: AbortSignal, body?: Record<string, any> | string } = {},
): Promise<T> {
    return new Promise((resolve, reject) => {
        fetch(endpoint, {
            ...options,
            ...body ? {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            } : {},
        }).then(async (res) => {
            const data = (await res.json()) as T;
            if (res.status === 200) {
                resolve(data);
            } else {
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                reject({ status: res.status });
                // reject(new HTTPError(res.status, res.url));
            }
        }, reject);
    });
}