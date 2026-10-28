// Consultas da Seção 1 de consultas_oficiais.sql (equipe do banco), traduzidas para PostgREST.
// Só leitura. Cada função devolve as linhas cruas (aliases do SQL) ou lança erro.
import { supabase } from '../lib/supabase.js';

const TABLE = 'dataset_weather_goes';

const run = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

// 1.1 / view clima_atual: último registro (data_hora, cidade, temperatura_c, sensacao_termica_c, umidade_pct, vento_ms, chuva_mm)
export const getCurrent = (signal) =>
  run(supabase.from('clima_atual').select('*').abortSignal(signal).maybeSingle());

// 1.2: últimos 24 registros, do mais recente para o mais antigo.
// Inclui o vento (wind_speed_10m, coluna da 1.1) para a máxima das últimas 24 h no card de vento.
export const getLast24h = (signal) =>
  run(supabase.from(TABLE)
    .select('horario:time, temperatura_c:temperature_2m, chuva_mm:precipitation, vento_ms:wind_speed_10m')
    .order('time', { ascending: false })
    .limit(24)
    .abortSignal(signal));

// Últimos 7 dias: mesmas colunas da 1.2, com registros suficientes para 7 dias completos de hora em hora
// (7 × 24 + 23, para o caso de o último dia ainda estar pela metade). O agrupamento por dia é feito no frontend.
export const getLastDays = (signal) =>
  run(supabase.from(TABLE)
    .select('horario:time, temperatura_c:temperature_2m, chuva_mm:precipitation')
    .order('time', { ascending: false })
    .limit(7 * 24 + 23)
    .abortSignal(signal));

// Ponto de medição para o mapa (colunas latitude/longitude do dataset; não estão no .sql da equipe).
export const getStation = (signal) =>
  run(supabase.from(TABLE).select('latitude, longitude').order('time', { ascending: false }).limit(1).abortSignal(signal).maybeSingle());

// Registros horários de um mês inteiro (ex.: setembro de 2023), para a chance histórica de chuva.
// Usa só colunas do .sql (time, precipitation). Um mês tem no máximo 744 horas, abaixo do limite de 1000 linhas.
export const getMonthHours = (signal, year, month) => {
  const pad = (n) => String(n).padStart(2, '0');
  const next = month === 12 ? `${year + 1}-01` : `${year}-${pad(month + 1)}`;
  return run(supabase.from(TABLE)
    .select('horario:time, chuva_mm:precipitation')
    .gte('time', `${year}-${pad(month)}-01T00:00:00`)
    .lt('time', `${next}-01T00:00:00`)
    .limit(744)
    .abortSignal(signal));
};

// 1.3: últimos 15 registros com chuva > 0
export const getRainEvents = (signal) =>
  run(supabase.from(TABLE)
    .select('data_hora:time, temperatura_c:temperature_2m, chuva_mm:precipitation, nuvens_pct:cloud_cover')
    .gt('precipitation', 0)
    .order('time', { ascending: false })
    .limit(15)
    .abortSignal(signal));
