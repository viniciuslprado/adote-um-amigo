const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const connectDatabase = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const animalRoutes = require("./routes/animalRoutes");
const adoptionRoutes = require("./routes/adoptionRoutes");
const swaggerSpec = require("./utils/swagger");
const errorHandler = require("./middleware/errorHandler");
const bootstrapAdmin = require("./services/bootstrapAdmin");
const { metricsHandler, metricsMiddleware } = require("./utils/metrics");

const app = express();
const port = process.env.PORT || 4000;

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "img-src": ["'self'", "data:", "https:"],
      },
    },
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.static(path.resolve(__dirname, "public")));
app.use(morgan("combined"));
app.use(metricsMiddleware);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.RATE_LIMIT_MAX) || 5000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/health", (req, res) => {
  res.json({ service: "backend", status: "ok" });
});

app.get("/admin", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "admin.html"));
});

app.get("/metrics", metricsHandler);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRoutes);
app.use("/animals", animalRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/animals", animalRoutes);
app.use("/api/adoptions", adoptionRoutes);
app.use(errorHandler);

connectDatabase()
  .then(bootstrapAdmin)
  .then(() => {
    app.listen(port, () => {
      console.log(`backend running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start backend", error);
    process.exit(1);
  });

module.exports = app;
