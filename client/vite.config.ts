import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

console.log(path.resolve(__dirname, 'cert/key.pem'))

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
