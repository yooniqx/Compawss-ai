import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { RescueProvider } from './context/RescueContext.tsx';
import { ChatProvider } from './context/ChatContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RescueProvider>
      <ChatProvider>
        <App />
      </ChatProvider>
    </RescueProvider>
  </StrictMode>,
);

