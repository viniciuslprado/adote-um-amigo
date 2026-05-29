function errorHandler(error, req, res, next) {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: "Registro duplicado." });
  }

  if (error.name === "ZodError") {
    return res.status(400).json({ message: "Dados invalidos.", issues: error.issues });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ message: "Identificador invalido." });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({ message: "Dados invalidos.", details: error.message });
  }

  return res.status(error.status || 500).json({
    message: error.message || "Erro interno no servidor.",
  });
}

module.exports = errorHandler;
