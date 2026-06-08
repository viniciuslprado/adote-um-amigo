const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Adote um Amigo API",
    version: "1.0.0",
    description: "API da plataforma de adocao de animais.",
  },
  servers: [{ url: "http://localhost:4000" }],
  tags: [{ name: "Health" }, { name: "Auth" }, { name: "Animals" }, { name: "Adoptions" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Verifica se a API esta disponivel.",
        responses: { 200: { description: "API online." } },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Cadastra um usuario comum.",
        responses: { 201: { description: "Usuario criado." } },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Autentica um usuario e retorna JWT.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string", example: "admin" },
                  password: { type: "string", example: "admin123" }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Login realizado." } },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Retorna o usuario autenticado.",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Usuario autenticado." } },
      },
    },
    "/api/animals": {
      get: {
        tags: ["Animals"],
        summary: "Lista animais com busca, filtros, paginacao e ordenacao.",
        responses: { 200: { description: "Lista paginada." } },
      },
      post: {
        tags: ["Animals"],
        summary: "Cria um animal. Apenas admin.",
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: "Animal criado." } },
      },
    },
    "/api/animals/admin/list": {
      get: {
        tags: ["Animals"],
        summary: "Lista todos os animais do banco local, incluindo os removidos.",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Lista completa de animais." }, 401: { description: "Nao autorizado." } }
      }
    },
    "/api/animals/{id}": {
      get: {
        tags: ["Animals"],
        summary: "Busca animal ativo por ID.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Animal encontrado." } },
      },
      put: {
        tags: ["Animals"],
        summary: "Substitui os dados de um animal. Apenas admin.",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Animal atualizado." } },
      },
      patch: {
        tags: ["Animals"],
        summary: "Atualiza parcialmente um animal. Apenas admin.",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Animal atualizado." } },
      },
      delete: {
        tags: ["Animals"],
        summary: "Remove animal com soft delete. Apenas admin.",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Animal removido." } },
      },
    },
    "/api/adoptions": {
      post: {
        tags: ["Adoptions"],
        summary: "Cria uma solicitacao de adocao.",
        responses: { 201: { description: "Solicitacao criada." } },
      },
      get: {
        tags: ["Adoptions"],
        summary: "Lista solicitacoes.",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Lista paginada de solicitacoes." } },
      },
    },
    "/api/adoptions/{id}": {
      get: {
        tags: ["Adoptions"],
        summary: "Busca solicitacao por ID.",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Solicitacao encontrada." } },
      },
    },
    "/api/adoptions/{id}/status": {
      patch: {
        tags: ["Adoptions"],
        summary: "Altera status da solicitacao. Apenas admin.",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Status atualizado." } },
      },
    },
  },
};

module.exports = swaggerSpec;
