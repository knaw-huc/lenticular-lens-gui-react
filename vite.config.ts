import {defineConfig} from 'vite';
import babel from '@rolldown/plugin-babel';
import react, {reactCompilerPreset} from '@vitejs/plugin-react';
import {tanstackRouter} from '@tanstack/router-plugin/vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        tanstackRouter(),
        react(),
        babel({presets: [reactCompilerPreset()]}),
    ],
    resolve: {
        tsconfigPaths: true,
    },
    server: {
        proxy: {
            '/userinfo': 'http://127.0.0.1:8000',
            '/methods': 'http://127.0.0.1:8000',
            '/mappings': 'http://127.0.0.1:8000',
            '/datasets': 'http://127.0.0.1:8000',
            '/job': 'http://127.0.0.1:8000',
            '/socket.io': {
                target: 'ws://127.0.0.1:8000',
                ws: true,
                rewriteWsOrigin: true,
            },
        }
    }
});
