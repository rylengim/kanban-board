import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { createDemoApi } from './api/memory';
import './styles.css';

const api = createDemoApi();
const root = document.getElementById('root');
if (!root) throw new Error('The Boardlet page is missing its root element.');

createRoot(root).render(<StrictMode><App api={api} demo /></StrictMode>);
