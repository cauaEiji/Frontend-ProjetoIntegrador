import { useState } from 'react';
import { getMonthHours } from '../services/forecastRepo.js';

const monthValue = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const currentMonth = monthValue(new Date());
const currentYear = new Date().getFullYear();
const previousYear = monthValue(new Date(currentYear - 1, new Date().getMonth(), 1));
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const YEARS = Array.from({ length: currentYear - 1999 }, (_, index) => currentYear - index);
const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

function summarize(rows) {
  const values = (key) => rows.map((row) => row[key]).filter((value) => value != null && value !== '' && Number.isFinite(Number(value))).map(Number);
  const rainValues = values('chuva_mm');
  const temperatures = values('temperatura_c');

  return {
    rain: rainValues.length ? rainValues.reduce((sum, value) => sum + value, 0) : null,
    temperature: temperatures.length
      ? temperatures.reduce((sum, value) => sum + value, 0) / temperatures.length
      : null,
  };
}

function periodLabel(value) {
  const [year, month] = value.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function metric(value, unit) {
  return value == null ? 'Sem dados' : `${number.format(value)} ${unit}`;
}

export default function PeriodComparison() {
  const [periods, setPeriods] = useState([previousYear, currentMonth]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function compare(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const summaries = await Promise.all(periods.map(async (period) => {
        const [year, month] = period.split('-').map(Number);
        return summarize(await getMonthHours(undefined, year, month));
      }));
      setResult(summaries);
    } catch (cause) {
      setError(cause.message || 'Não foi possível carregar os períodos.');
    } finally {
      setLoading(false);
    }
  }

  const delta = (a, b, unit) => a == null || b == null ? 'Sem dados para comparar' : `${number.format(b - a)} ${unit}`;

  return (
    <section className="period-compare" aria-labelledby="t-comparar-periodos">
      <h2 id="t-comparar-periodos">Comparar períodos</h2>
      <p className="note">Compare a chuva acumulada e a temperatura média de dois meses.</p>
      <form className="period-form" onSubmit={compare}>
        {periods.map((period, index) => {
          const [year, month] = period.split('-').map(Number);
          const updatePeriod = (nextYear, nextMonth) => {
            setPeriods((current) => current.map((value, i) => i === index ? `${nextYear}-${String(nextMonth).padStart(2, '0')}` : value));
            setResult(null);
            setError(null);
          };

          return (
            <div className="period-selection" key={index}>
              <strong>Período {index + 1}</strong>
              <div className="period-fields">
                <div className="campo">
                  <label htmlFor={`period-month-${index}`}>Mês</label>
                  <select id={`period-month-${index}`} value={month} disabled={loading} onChange={(event) => updatePeriod(year, Number(event.target.value))}>
                    {MONTHS.map((name, monthIndex) => <option key={name} value={monthIndex + 1}>{name}</option>)}
                  </select>
                </div>
                <div className="campo">
                  <label htmlFor={`period-year-${index}`}>Ano</label>
                  <select id={`period-year-${index}`} value={year} disabled={loading} onChange={(event) => updatePeriod(Number(event.target.value), month)}>
                    {YEARS.map((optionYear) => <option key={optionYear} value={optionYear}>{optionYear}</option>)}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Carregando…' : 'Comparar'}</button>
      </form>

      {error && <p className="err" role="alert">{error}</p>}
      {result && (
        <div className="period-results" aria-live="polite">
          {result.map((summary, index) => (
            <div className="period-result" key={`${periods[index]}-${index}`}>
              <h4>{periodLabel(periods[index])}</h4>
              <p>Chuva acumulada: <strong>{metric(summary.rain, 'mm')}</strong></p>
              <p>Temperatura média: <strong>{metric(summary.temperature, '°C')}</strong></p>
            </div>
          ))}
          <p className="period-difference">
            Diferença (período 2 − período 1): chuva {delta(result[0].rain, result[1].rain, 'mm')} · temperatura {delta(result[0].temperature, result[1].temperature, '°C')}
          </p>
        </div>
      )}
    </section>
  );
}
