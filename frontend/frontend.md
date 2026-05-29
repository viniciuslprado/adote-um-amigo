# Frontend

Frontend React da plataforma Adote um Amigo. Ele entrega a experiencia publica para consultar animais, ver detalhes, ler orientacoes e registrar interesse em adocao.

## Responsabilidades

- Exibir a pagina inicial da plataforma.
- Listar animais disponiveis para adocao.
- Consumir a API do backend.
- Aplicar busca, filtros e ordenacao na vitrine.
- Exibir detalhes de cada animal.
- Enviar solicitacoes de adocao.
- Mostrar orientacoes de adocao responsavel.
- Usar fallback quando imagens externas falham.

## Estrutura

```text
frontend/
|-- Dockerfile
|-- nginx.conf
|-- package.json
|-- frontend.md
|-- public/
`-- src/
    |-- App.js                 # Rotas da aplicacao
    |-- index.js               # Entrada React
    |-- components/
    |   |-- AnimalCard.js
    |   |-- Footer.js
    |   |-- Header.js
    |   `-- Navbar.js
    |-- pages/
    |   |-- AnimalDetails.js
    |   |-- Animals.js
    |   |-- Home.js
    |   |-- Register.js
    |   `-- Tips.js
    |-- services/
    |   `-- api.js             # Cliente HTTP do backend
    |-- styles/
    |   |-- App.css
    |   `-- index.css
    `-- utils/
        `-- images.js          # Imagens de fallback
```

## Como executar

Pela raiz do projeto:

```bash
docker compose up -d --build frontend
```

Acesso:

```text
http://localhost:3000
```

Executar localmente dentro da pasta `frontend`:

```bash
npm install
npm start
```

## Scripts

```text
npm start    # servidor de desenvolvimento React
npm run build
npm test
npm run eject
```

## Variavel de API

O cliente HTTP usa:

```text
REACT_APP_API_URL=http://localhost:4000/api
```

Se a variavel nao existir, o fallback tambem aponta para:

```text
http://localhost:4000/api
```

No Docker, esse valor e enviado como build arg no `docker-compose.yml`.

## Rotas da aplicacao

```text
/                  # Pagina inicial
/animals           # Lista publica de animais
/animals/:animal   # Detalhes do animal
/register          # Cadastro de interesse
/tips              # Orientacoes de adocao
```

## Paginas

`Home.js`:

- Apresenta a proposta da plataforma.
- Mostra chamadas para ver animais e iniciar cadastro.
- Resume beneficios e orientacoes.

`Animals.js`:

- Carrega a lista de animais via backend.
- Permite busca por texto.
- Permite filtro por especie.
- Permite filtro por cidade.
- Permite ordenacao por nome ou especie.
- Mostra quantidade de resultados.

`AnimalDetails.js`:

- Busca animal por slug ou id.
- Exibe imagem, especie, idade, cidade, origem e descricao.
- Leva o usuario ao cadastro com o animal pre-selecionado.

`Register.js`:

- Exibe formulario de interesse.
- Envia dados para `POST /api/adoptions`.
- Pode receber animal pela URL.
- Valida dados antes do envio.

`Tips.js`:

- Apresenta orientacoes sobre adocao responsavel.
- Reforca cuidados com alimentacao, higiene, veterinario e adaptacao.

## Componentes

`Navbar.js`:

- Menu principal.
- Links para inicio, animais, orientacoes e cadastro.

`AnimalCard.js`:

- Card reutilizavel da vitrine.
- Exibe nome, especie, idade, descricao, local e imagem.
- Direciona para a pagina de detalhes.

`Header.js`:

- Cabecalho visual da pagina inicial.

`Footer.js`:

- Rodape informativo da aplicacao.

## Servico HTTP

Arquivo:

```text
src/services/api.js
```

Funcoes principais:

```text
getAllAnimals(params)
getAnimalById(id)
getAnimalBySlug(slug)
createAdoptionRequest(data)
createAnimalSlug(name)
```

O frontend consome principalmente:

```text
GET  /api/animals
GET  /api/animals/:id
POST /api/adoptions
```

## Normalizacao dos animais

O backend pode retornar animais vindos do MongoDB e de APIs externas. O frontend normaliza campos para manter a interface consistente:

```text
id
age
location
description
origin
dataSource
```

Assim os cards e a tela de detalhes nao precisam saber se o animal veio do banco local ou de uma API externa.

## Fallback de imagens

Arquivo:

```text
src/utils/images.js
```

Quando uma imagem esta ausente ou falha ao carregar, a aplicacao usa uma imagem padrao para evitar cards quebrados.

## Build e Nginx

O Dockerfile gera o build React e o Nginx serve os arquivos estaticos.

Arquivo de configuracao:

```text
nginx.conf
```

Esse arquivo tambem ajuda a manter as rotas React funcionando quando o usuario acessa uma URL diretamente no navegador.

## Relacao com o painel admin

O painel administrativo nao pertence ao frontend React. Ele e servido pelo backend em:

```text
http://localhost:4000/admin
```

## Verificacao rapida

Com a stack em execucao:

```bash
docker compose ps
```

Abra:

```text
http://localhost:3000
http://localhost:3000/animals
```
