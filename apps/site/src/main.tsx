import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { QuestionData } from '@repo/types';
import { useFetch } from './hooks';
import './index.css';

function Questions() {
    const [{ data, loading, error }] = useFetch<QuestionData[]>('/api/questions');
    if (loading) {
        return <div>Loading...</div>;
    }
    if (error !== null) {
        return <div>Error: {error}</div>;
    }
    return (
        <ul>
            {data?.map(({ id }) => (
                <li key={id}>Question: {id}</li>
            ))}
        </ul>
    );
}

export default function App() {
    return (
        <main className='app'>
            <h1>Test Prep Site</h1>
            <div className='content'>
                <Questions/>
            </div>
        </main>
    );
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App/>
    </StrictMode>,
);