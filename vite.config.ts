import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import {TanStackRouterVite} from '@tanstack/router-plugin/vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        tsconfigPaths(),
        TanStackRouterVite(),
        react(),
    ],
    server: {
        proxy: {
            '/user_info': 'http://localhost:5000',
            '/methods': 'http://localhost:5000',
            '/datasets': 'http://localhost:5000',
            '/download': 'http://localhost:5000',
            '/downloads': 'http://localhost:5000',
            '/job': 'http://localhost:5000',
            '/socket.io': {
                target: 'ws://127.0.0.1:5000',
                ws: true,
                rewriteWsOrigin: true,
            },
        }
    }
});
