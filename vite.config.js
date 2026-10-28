import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  // Testes sempre em modo demonstração: não dependem do .env local nem do banco.
  test: { environment: 'happy-dom', globals: true, env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' } },
});
