// frontend/vite.config.ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
    test: {
        environment: 'jsdom',
        globals: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'html'],
            reportsDirectory: 'coverage',
            include: [
                'src/views/**/*.vue',
                'src/stores/**/*.ts',
                'src/router/**/*.ts',
            ],
            exclude: ['src/main.ts', '**/*.d.ts'],
            thresholds: {
                statements: 70,
                branches: 65,
                functions: 70,
                lines: 70,
            },
        },
    },
})