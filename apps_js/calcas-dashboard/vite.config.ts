import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) =>  {
    const isProduction = mode === 'production'
    return {
        plugins: [react()],
        server: {
            proxy: {
                "/api": "http://127.0.0.1:8000",
                "/media": "http://127.0.0.1:8000",
            },
        },
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src'),
          },
        },
        build: {
            assetsDir: '', // Does not create assets folders but puts all builds files in one place
        },
        base: isProduction ? '/static/registration-react' : '',
    }

})
