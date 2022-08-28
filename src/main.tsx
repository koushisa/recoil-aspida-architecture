import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { worker } from '@/mocks/handlers'

worker
  .start({
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  })
  .catch(() => {
    console.error("The application couldn't get started.")
  })
