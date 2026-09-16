import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { createDemoApi } from './api/memory';
import { createHttpApi } from './api/http';
import './styles.css';

const demo = import.meta.env.MODE === 'mock';
const api = demo ? createDemoApi() : createHttpApi(import.meta.env.VITE_API_BASE_URL);
const root = document.getElementById('root');
if (!root) throw new Error('The Boardlet page is missing its root element.');

createRoot(root).render(<StrictMode><App api={api} demo={demo} /></StrictMode>);
