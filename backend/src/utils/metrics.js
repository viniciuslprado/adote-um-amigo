const client = require("prom-client");
const mongoose = require("mongoose");

const register = new client.Registry();

client.collectDefaultMetrics({
  app: "adote_um_amigo_backend",
  prefix: "adote_um_amigo_",
  register,
});

const httpRequestDuration = new client.Histogram({
  name: "adote_um_amigo_http_request_duration_seconds",
  help: "Duracao das requisicoes HTTP em segundos.",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

const httpRequestsTotal = new client.Counter({
  name: "adote_um_amigo_http_requests_total",
  help: "Total de requisicoes HTTP recebidas.",
  labelNames: ["method", "route", "status_code"],
});

const mongoConnectionState = new client.Gauge({
  name: "adote_um_amigo_mongodb_connection_state",
  help: "Estado da conexao MongoDB pelo Mongoose: 0=desconectado, 1=conectado, 2=conectando, 3=desconectando.",
  collect() {
    this.set(mongoose.connection.readyState);
  },
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(mongoConnectionState);

function normalizeRoute(req) {
  if (req.route?.path) {
    const basePath = req.baseUrl || "";
    return `${basePath}${req.route.path}` || req.path;
  }

  return req.path;
}

function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e9;
    const labels = {
      method: req.method,
      route: normalizeRoute(req),
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);
  });

  next();
}

async function metricsHandler(req, res) {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
}

module.exports = { metricsMiddleware, metricsHandler };
