# Auditoria geral — Chuva Londrina (frontend)

**Data:** 27/10/2026 · **Projeto Integrador I — UTFPR Londrina** · **Equipe de frontend**

> Este documento lista **só o que ainda não está 100%**: o que falta e o que precisa melhorar, com **o motivo** de cada item estar assim. Os números de testes, lint, build e `npm audit` são de execuções reais em 27/10/2026.

## Sumário

1. [Situação geral](#1-situação-geral)
2. [Quadro de pendências e melhorias](#2-quadro-de-pendências-e-melhorias)
3. [Pendências agrupadas pelo motivo](#3-pendências-agrupadas-pelo-motivo)
4. [Perguntas para a equipe do banco de dados](#4-perguntas-para-a-equipe-do-banco-de-dados)
5. [Próximos passos](#5-próximos-passos)
6. [Legenda e o que não foi verificado](#6-legenda-e-o-que-não-foi-verificado)

---

## 1. Situação geral

| Área | Nota | Resumo |
|---|:---:|---|
| **Geral** | **8,5/10** | Funciona com dados reais do banco, mas falta segurança no banco, previsão (IA) e publicação |
| Interface | 9/10 | 4 seções (Mapa, Agora, Semana, Dados), responsiva, acessível; falta comparar com o protótipo |
| Integração com Supabase | 9/10 | Toda a tela usa dados do banco; previsão e alertas dependem da IA, que ainda não existe no banco |
| Segurança | 6/10 | Código sem chaves expostas, mas o **RLS do banco está desligado** |
| Qualidade do código | 9/10 | 44 testes, lint sem erros, 0 vulnerabilidades |

**Números atuais**

| Verificação | Resultado |
|---|---|
| `npm test` | ✅ 44/44 testes (6 arquivos) |
| `npm run lint` | ✅ 0 problemas |
| `npm run build` | ✅ Página: 378 KB (108,8 KB gzip) · Mapa, carregado à parte: 168 KB (49,7 KB gzip) |
| `npm audit` | ✅ 0 vulnerabilidades |
| Versões | React 18.3.1 · Vite 8.3.5 · supabase-js 2.118 · Leaflet 1.9.4 · Vitest 4.1.12 |
| Git | 🟡 Repositório criado, **nenhum commit** |
| Último dado do banco | 🟡 30/09/2026 23:00 (59.160 registros de hora em hora desde 01/01/2020) |

---

## 2. Quadro de pendências e melhorias

| # | Item | Situação | **Por que está assim** | Quem resolve | Prioridade | O que fazer |
|:---:|---|:---:|---|---|:---:|---|
| 1 | **RLS** nas tabelas `dataset_weather_goes`, `caracteristicas_goes_stat` e `resultados_previsoes_ia` | ❌ Desligado | **Desligado pela equipe do banco para testes** | Banco | 🔴 Alta | Ligar o RLS e criar policy **só de leitura** (`SELECT`) para `anon`. Sem isso, a chave pública permite alterar e apagar dados |
| 2 | View `clima_atual` respeitar o RLS | ⚪ Não verificado | **Configuração no painel do Supabase**, fora do projeto | Banco | 🔴 Alta | `alter view clima_atual set (security_invoker = true);` |
| 3 | Testar o site depois de ligar o RLS | ❌ | **Depende dos itens 1 e 2** | Frontend | 🔴 Alta | Abrir o site; se aparecer "Não foi possível ler o banco", falta a policy de leitura |
| 4 | Primeiro commit e repositório no GitHub | ❌ | **Aguardando decisão da equipe** (o `git init` foi feito, mas nenhum commit) | Frontend | 🔴 Alta | `git status` antes: `.env` não pode aparecer na lista |
| 5 | **Previsão de chuva (probabilidade)** | ❌ Não existe no banco | **Implementação de IA no Supabase**: a tabela `resultados_previsoes_ia` (coluna `escore_chuva`) está vazia | Backend → Frontend | 🟠 Média | Hoje o card mostra a **chance histórica** (dado real, não é previsão). Quando a IA preencher a tabela, o card vira previsão (consulta 2.1 do `.sql`) |
| 6 | **Alertas de chuva** | ❌ Não existe no banco | **Implementação de IA no Supabase**: os alertas dependem das previsões do modelo | Backend → Frontend | 🟠 Média | Hoje, ao lado do mapa, fica a **chuva acumulada nas últimas 24h** (dado real). O alerta pode entrar junto dela quando existir |
| 7 | **Previsão dos próximos dias** | ❌ Não existe no banco | **Implementação de IA no Supabase**: não há tabela de previsão diária/horária | Backend → Frontend | 🟠 Média | Hoje a tela mostra os **últimos 7 dias observados** |
| 8 | Dataset **parado em 30/09/2026** | 🟡 | **Coleta contínua de dados não implementada** (o dataset é um histórico fixo) | Banco / Backend | 🟠 Média | Definir se haverá atualização; a tela já avisa "Último registro do banco" |
| 9 | Publicação no **GitHub Pages** | ❌ | **Depende do RLS ligado (itens 1–3)** e de configurar o caminho do site | Frontend | 🟠 Média | `base: '/nome-do-repo/'` no `vite.config.js`; sem isso a página abre em branco |
| 10 | Dados de **satélite** (`image_link`, `caracteristicas_goes_stat`) | 🟡 Em andamento | **Tratamento das imagens GOES pelo backend** — **confirmado que o backend vai fazer**. Hoje `image_link` aponta para arquivos `.npz` (o navegador não abre) e a tabela de estatísticas está vazia | Backend → Frontend | 🟠 Média | Combinar o formato de entrega (veja a pergunta 8 do §4); o frontend sobrepõe a imagem no mapa e mostra a temperatura do topo das nuvens |
| 11 | **Direção do vento e rajada** | ❌ Não exibidos | **Colunas não coletadas no dataset** (só existe `wind_speed_10m`) | Banco | 🟢 Baixa | Hoje o card mostra a escala de Beaufort e a máxima das 24h (dados reais) |
| 12 | Colunas usadas **fora do `.sql`** (`latitude`, `longitude`) e disponíveis (`weather_code`, `pressure_msl`, `dew_point_2m`) | 🟡 | **O `.sql` da equipe não inclui essas colunas**; aguardando confirmação de que estão tratadas | Banco | 🟢 Baixa | Incluir no `.sql` ou numa view |
| 13 | Desempenho do **histórico do mês** e da **chance histórica** | 🟡 | **View `chuva_mensal` não criada no banco**: o site soma ~7.900 registros (11 consultas) | Banco | 🟢 Baixa | Criar a view (ano, mês, total de chuva) e trocar as 11 consultas por 1 |
| 14 | Índice na coluna `time` | ⚪ Não verificado | **Configuração do banco**, fora do projeto | Banco | 🟢 Baixa | Criar índice; todas as consultas ordenam por `time` |
| 15 | Unidade do vento (m/s) | 🟡 Deduzida | **Sem documentação do dataset**: a unidade foi deduzida dos valores (máx. 8,98) | Banco | 🟢 Baixa | Confirmar; se for km/h, trocar `WIND_TO_KMH` para 1 |
| 16 | Texto "Como lemos os dados" | 🟡 Texto fixo | **Seção 3 do `.sql` (resumo do dataset) ainda não integrada** — decisão pendente | Frontend | 🟢 Baixa | Mostrar total de registros e período (59.160 registros, 01/01/2020 a 30/09/2026) |
| 17 | Título "Onde vai chover em Londrina **hoje**?" | 🟡 | **Decisão de texto pendente**: sugere previsão, mas os dados são de 30/09 | Equipe toda | 🟢 Baixa | Trocar por algo como "Chuva em Londrina" |
| 18 | Conferência com o **protótipo** | ⚪ Não feita | **Arquivo do protótipo não disponibilizado** para o frontend | Equipe toda | 🟢 Baixa | Comparar tela por tela em celular, tablet e desktop |
| 19 | Site **sem internet** | 🟡 | **Decisão de usar só dados do banco** (sem demonstração) e **fundo do mapa vem do OpenStreetMap** | Equipe toda | 🟢 Baixa | Na apresentação, garantir internet; sem ela aparece só o aviso de erro |
| 20 | Diferença no limite do município (sudoeste, divisa com Cambé) | 🟡 | **IBGE e OpenStreetMap discordam** em ~800 m nesse trecho; mantido o IBGE (oficial) | — | 🟢 Baixa | Nada a fazer; só saber explicar se perguntarem |
| 21 | Testes de dados "estranhos" (nulos, datas fora de ordem) | 🟡 | **Cobertura parcial**: já há testes de erro total, erro por bloco e "sem `.env`" | Frontend | 🟢 Baixa | Acrescentar casos na `weatherApi.test.js` |
| 22 | Erro `edgesOut` ao instalar pacote novo | 🟡 | **Bug do npm** com dependências opcionais do Vite 8 | Frontend | 🟢 Baixa | Usar `--legacy-peer-deps` só no comando que falhar |

---

## 3. Pendências agrupadas pelo motivo

| Motivo | Itens | O que destrava |
|---|---|---|
| **Implementação de IA no Supabase** | 5, 6, 7 | Previsão de chuva, alertas e próximos dias |
| **Tratamento das imagens de satélite (confirmado pelo backend)** | 10 | Nuvens sobre o mapa de Londrina e temperatura do topo das nuvens |
| **Coleta contínua de dados** | 8 | Dados atuais (hoje param em 30/09/2026) |
| **Configuração do banco (RLS, view, índice)** | 1, 2, 3, 13, 14 | Segurança para publicar e consultas mais leves |
| **Colunas não coletadas ou fora do `.sql`** | 11, 12, 15 | Direção/rajada do vento e confirmação das colunas extras |
| **Decisões da equipe** | 4, 9, 16, 17, 19 | Commit, publicação e textos finais |
| **Materiais que faltam** | 18 | Comparação com o protótipo |
| **Melhorias técnicas do frontend** | 21, 22 | Robustez e manutenção |
| **Limitação externa (sem ação)** | 20 | — |

---

## 4. Perguntas para a equipe do banco de dados

| # | Pergunta | Por que importa | Resposta |
|:---:|---|---|---|
| 1 | Quando o RLS será ligado nas 3 tabelas, com policy de `SELECT` para `anon` e nenhuma de escrita? | Sem isso, o site publicado permite alterar ou apagar dados | |
| 2 | A view `clima_atual` usa `security_invoker = true`? | Sem isso, a view ignora o RLS | |
| 3 | Quando a IA vai preencher `resultados_previsoes_ia`? | Destrava previsão, probabilidade e alertas | |
| 4 | O dataset vai receber dados novos? Com que frequência? | Hoje o último registro é de 30/09/2026 | |
| 5 | `wind_speed_10m` está em m/s? | O site multiplica por 3,6 para mostrar km/h | |
| 6 | Podem incluir no `.sql` as colunas `latitude`, `longitude`, `weather_code`, `pressure_msl` e `dew_point_2m`? | O mapa já usa latitude/longitude | |
| 7 | Podem criar a view `chuva_mensal` e um índice em `time`? | Deixa o histórico do mês e a chance histórica mais leves | |
| 8 | **Backend (imagens de satélite):** em que formato a imagem tratada vai chegar? Precisamos de PNG/WebP com **URL pública** (ex.: Supabase Storage), já **reprojetada para latitude/longitude**, com os **4 cantos** (limites) da imagem, recortada na região de Londrina e ligada ao registro por `weather_id` ou horário | Sem os cantos e a reprojeção, a imagem não encaixa no mapa | |

---

## 5. Próximos passos

1. **Ligar o RLS** com policy só de leitura e ajustar a view — *Banco*
2. **Testar o site** com o RLS ligado e fazer o **primeiro commit** — *Frontend*
3. **Publicar no GitHub Pages** — *Frontend*
4. **Implementar a IA no Supabase** (preencher `resultados_previsoes_ia`) — *Backend*
5. **Ligar previsão e alertas** na tela quando houver dados — *Frontend*
6. **Definir a coleta contínua** de dados — *Banco / Backend*
7. **Conferir com o protótipo** e ajustar os textos (título e "Como lemos os dados") — *Equipe toda*

---

## 6. Legenda e o que não foi verificado

| Ícone | Significado |
|:---:|---|
| ❌ / 🟡 / ⚪ | Pendente / parcial / não verificado |
| 🔴 / 🟠 / 🟢 | Prioridade alta / média / baixa |

**Não verificado:**
- **RLS, view e índice:** ficam no painel do Supabase. A situação do RLS (desligado) foi **informada pela equipe**.
- **Fidelidade ao protótipo:** o arquivo do protótipo não está na pasta do projeto.
- **Celular e tablet reais:** as larguras foram simuladas no Chrome do computador.
