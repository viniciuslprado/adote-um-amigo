# db

Pasta reservada para arquivos auxiliares de banco de dados. O projeto atual usa MongoDB como banco principal, mas esta pasta guarda convencoes, migracoes futuras e observacoes sobre persistencia.

## Estrutura

```text
db/
|-- init.sql
|-- db.md
`-- migrations/
    `-- .gitkeep
```

## Banco usado pelo projeto

O banco principal e MongoDB.

No Docker Compose, o servico se chama:

```text
mongodb
```

Container:

```text
adote-mongodb
```

Imagem:

```text
mongo:7
```

Banco da aplicacao:

```text
adote-um-amigo
```

## Portas

O MongoDB fica exposto em duas portas locais:

```text
27017 -> 27017
27018 -> 27017
```

A porta `27018` existe para facilitar o uso do MongoDB Compass quando ja existe outro MongoDB local usando `27017`.

## Strings de conexao

Dentro do Docker, o backend usa:

```text
mongodb://mongodb:27017/adote-um-amigo
```

No host local, para usar MongoDB Compass:

```text
mongodb://127.0.0.1:27018/adote-um-amigo?directConnection=true
```

## Colecoes principais

```text
users
animals
adoptionrequests
```

## Colecao `users`

Armazena usuarios do sistema.

Campos principais:

- `name`
- `email`
- `username`
- `passwordHash`
- `phone`
- `role`
- `active`
- `createdAt`
- `updatedAt`

O usuario administrador inicial e criado/atualizado pelo backend ao iniciar.

## Colecao `animals`

Armazena animais cadastrados localmente.

Campos principais:

- `name`
- `type`
- `age`
- `location`
- `city`
- `state`
- `image`
- `description`
- `origin`
- `status`
- `active`
- `deletedAt`
- `externalSource`
- `externalId`
- `createdAt`
- `updatedAt`

O backend usa soft delete para animais. Ao remover um animal pelo painel admin, o registro permanece no banco, mas passa a ficar inativo.

## Colecao `adoptionrequests`

Armazena solicitacoes de interesse em adocao.

Campos principais:

- `userId`
- `animalId`
- `animalSnapshot`
- `applicantName`
- `applicantEmail`
- `applicantPhone`
- `applicantAge`
- `state`
- `city`
- `message`
- `status`
- `adminNotes`
- `createdAt`
- `updatedAt`

O `animalSnapshot` guarda dados do animal no momento da solicitacao, evitando perda de contexto caso o animal seja editado depois.

## Arquivo `init.sql`

O arquivo existe apenas como reserva:

```text
db/init.sql
```

Conteudo atual:

```sql
-- O projeto usa MongoDB. Este arquivo fica reservado para inicializacoes SQL caso o banco mude no futuro.
```

Ele nao e executado pela stack atual, porque o projeto nao usa banco SQL.

## Pasta `migrations`

A pasta `migrations` esta reservada para futuras migracoes ou scripts de manutencao de banco.

Hoje ela possui apenas:

```text
.gitkeep
```

## Dados iniciais

Para popular animais locais, use:

```bash
docker compose exec backend npm run seed
```

Esse comando executa:

```text
backend/src/seedAnimals.js
```

## Verificacao no MongoDB Compass

1. Abra o MongoDB Compass.
2. Use a string `mongodb://127.0.0.1:27018/adote-um-amigo?directConnection=true`.
3. Acesse o banco `adote-um-amigo`.
4. Verifique as colecoes `users`, `animals` e `adoptionrequests`.

## Persistencia no Docker

Os dados ficam no volume:

```text
mongodb-data
```

Enquanto esse volume existir, os dados continuam salvos mesmo se os containers forem recriados.

Para remover containers sem apagar dados:

```bash
docker compose down
```

Para apagar tambem os volumes, use somente quando quiser resetar os dados:

```bash
docker compose down -v
```
