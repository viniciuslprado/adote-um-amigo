# Observability

Pasta de observabilidade do projeto Adote um Amigo. Ela configura Prometheus e Grafana para monitorar o backend, acompanhar requisicoes HTTP, latencia e estado da conexao com MongoDB.

## Objetivo

- Coletar metricas expostas pelo backend.
- Visualizar saude do MongoDB.
- Acompanhar volume de requisicoes por rota, metodo e status.
- Medir latencia HTTP p95.
- Apoiar a analise durante testes de carga com k6.

## Estrutura

```text
observability/
|-- observability.md
|-- prometheus/
|   `-- prometheus.yml
`-- grafana/
    |-- dashboards/
    |   `-- adote-backend.json
    `-- provisioning/
        |-- dashboards/
        |   `-- dashboards.yml
        `-- datasources/
            `-- prometheus.yml
```

## Servicos no Docker Compose

Prometheus:

```text
http://localhost:9090
```

Grafana:

```text
http://localhost:3001
```

Credenciais padrao do Grafana:

```text
Usuario: admin
Senha:   admin
```

As credenciais podem ser alteradas por:

```text
GRAFANA_ADMIN_USER
GRAFANA_ADMIN_PASSWORD
```

## Prometheus

Arquivo:

```text
observability/prometheus/prometheus.yml
```

Configuracao atual:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: adote-backend
    metrics_path: /metrics
    static_configs:
      - targets:
          - backend:4000
```

O Prometheus acessa o backend pela rede interna do Docker usando:

```text
backend:4000
```

Endpoint coletado:

```text
GET /metrics
```

## Grafana

O Grafana e provisionado automaticamente pela pasta:

```text
observability/grafana/provisioning
```

Datasource:

```text
observability/grafana/provisioning/datasources/prometheus.yml
```

Dashboard provider:

```text
observability/grafana/provisioning/dashboards/dashboards.yml
```

Dashboard:

```text
observability/grafana/dashboards/adote-backend.json
```

## Dashboard disponivel

Nome:

```text
Adote um Amigo - Backend
```

Pasta no Grafana:

```text
Adote um Amigo
```

Paineis:

- Estado do MongoDB.
- Requisicoes HTTP por segundo.
- Latencia HTTP p95.

## Metricas do backend

As metricas sao registradas em:

```text
backend/src/utils/metrics.js
```

Metricas especificas da aplicacao:

```text
adote_um_amigo_http_requests_total
adote_um_amigo_http_request_duration_seconds
adote_um_amigo_mongodb_connection_state
```

Tambem existem metricas padrao do Node.js geradas pelo `prom-client`, com prefixo:

```text
adote_um_amigo_
```

## Consultas uteis no Prometheus

Total de requisicoes por rota, metodo e status:

```promql
adote_um_amigo_http_requests_total
```

Requisicoes por segundo:

```promql
sum by (method, route, status_code) (rate(adote_um_amigo_http_requests_total[5m]))
```

Latencia p95 por rota:

```promql
histogram_quantile(0.95, sum by (le, route) (rate(adote_um_amigo_http_request_duration_seconds_bucket[5m])))
```

Estado da conexao MongoDB:

```promql
adote_um_amigo_mongodb_connection_state
```

Valores do estado MongoDB:

```text
0 = desconectado
1 = conectado
2 = conectando
3 = desconectando
```

## Como executar

Subir a stack completa:

```bash
docker compose up -d --build
```

Subir Prometheus e Grafana:

```bash
docker compose up -d prometheus grafana
```

Ver containers:

```bash
docker compose ps
```

Ver logs:

```bash
docker compose logs -f prometheus
docker compose logs -f grafana
```

## Verificacao rapida

Backend expondo metricas:

```bash
curl http://localhost:4000/metrics
```

Prometheus:

```text
http://localhost:9090
```

Grafana:

```text
http://localhost:3001
```

No Prometheus, pesquise:

```text
adote_um_amigo_http_requests_total
```

No Grafana, abra:

```text
Dashboards > Adote um Amigo > Adote um Amigo - Backend
```

## Uso com k6

Durante os testes de carga, acompanhe:

- aumento de `adote_um_amigo_http_requests_total`;
- variacao da latencia p95;
- possiveis status `4xx` ou `5xx`;
- estado da conexao MongoDB.

Isso ajuda a comparar os thresholds do k6 com o comportamento real observado no dashboard.

## Persistencia

Prometheus usa:

```text
prometheus-data
```

Grafana usa:

```text
grafana-data
```

Os dashboards e datasources tambem ficam versionados nesta pasta, entao a configuracao base pode ser recriada junto com os containers.
