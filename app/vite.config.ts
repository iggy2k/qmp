import react from '@vitejs/plugin-react'
import { UserConfig, ConfigEnv } from 'vite'
import { join, resolve } from 'path'
import NodeGlobalsPolyfillPlugin from '@esbuild-plugins/node-globals-polyfill'

const srcRoot = join(__dirname, 'src')

export default ({ command }: ConfigEnv): UserConfig => {
    // DEV
    if (command === 'serve') {
        return {
            root: srcRoot,
            base: '/',
            plugins: [react()],
            resolve: {
                alias: {
                    '@': resolve(__dirname, '.'),
                },
            },
            build: {
                outDir: join(srcRoot, '/out'),
                emptyOutDir: true,
                rollupOptions: {},
            },
            server: {
                port: process.env.PORT === undefined ? 3000 : +process.env.PORT,
            },
            optimizeDeps: {
                esbuildOptions: {
                    // Node.js global to browser globalThis
                    define: {
                        global: 'globalThis',
                    },
                    // Enable esbuild polyfill plugins
                    plugins: [
                        NodeGlobalsPolyfillPlugin({
                            buffer: true,
                        }),
                    ],
                },
            },
        }
    }
    // PROD
    return {
        root: srcRoot,
        base: './',
        plugins: [react()],
        resolve: {
            alias: {
                '@': resolve(__dirname, '.'),
                // '/@': srcRoot,
            },
        },
        build: {
            outDir: join(srcRoot, '/out'),
            emptyOutDir: true,
            rollupOptions: {},
        },
        server: {
            port: process.env.PORT === undefined ? 3000 : +process.env.PORT,
        },
        optimizeDeps: {
            exclude: ['path'],
        },
    }
}
