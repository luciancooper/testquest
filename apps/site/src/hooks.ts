import { useReducer, useEffect, useCallback } from 'react';
import { sendRequest } from './services';

interface FetchState<T> {
    url: string | null
    loading: boolean
    error: number | null
    data: T | null
}

type FetchAction<T> = { type: 'START' | 'ABORT' } | { type: 'SUCCESS', payload: T } | { type: 'ERROR', status: number };

function fetchReducer<T>(state: FetchState<T>, action: FetchAction<T>): FetchState<T> {
    switch (action.type) {
        case 'ERROR':
            return { ...state, loading: false, error: action.status };
        case 'SUCCESS':
            return { ...state, loading: false, data: action.payload };
        case 'ABORT':
            return { ...state, url: null, loading: false };
        case 'START':
            return { ...state, loading: true };
        default:
            return state;
    }
}

export function useFetch<T>(endpoint: string): [Omit<FetchState<T>, 'url'>, () => void] {
    const [{ url, ...state }, dispatch] = useReducer(fetchReducer<T>, {
        url: endpoint,
        loading: false,
        error: null,
        data: null,
    });
    // effect to fetch data from endpoint
    useEffect(() => {
        if (!url) return;
        dispatch({ type: 'START' });
        const abortController = new AbortController();
        // send get request
        sendRequest<T>(url, { signal: abortController.signal }).then((data) => {
            dispatch({ type: 'SUCCESS', payload: data });
        }, (error: { status: number }) => {
            if (!abortController.signal.aborted) {
                dispatch({ type: 'ERROR', status: error.status });
            }
        });
        return () => {
            abortController.abort();
        };
    }, [url]);
    // callback to abort fetch
    const abort = useCallback(() => {
        dispatch({ type: 'ABORT' });
    }, []);
    // return state & abort callback
    return [state, abort];
}