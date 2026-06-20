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
            outDir: '../../registration/static/registration-react',
            emptyOutDir: true,
            assetsDir: '',
            rollupOptions: {
                output: {
                    entryFileNames: 'index.js',
                    chunkFileNames: '[name].js',
                    assetFileNames: '[name].[ext]',
                },
            },
        },
        base: isProduction ? '/static/registration-react/' : '/',
    }

})
