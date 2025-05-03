# PostgreSQL Manager

Uma aplicação web construída com Next.js para gerenciar bancos de dados PostgreSQL localmente.

![Dashboard do PostgreSQL Manager](/public/dashboard.png)

## ✨ Funcionalidades

- 📦 Fazer **backup** de qualquer banco de dados PostgreSQL local
- 🏗️ Criar novos **bancos de dados**
- ♻️ Fazer **restore** (restaurar backup)
- 🗑️ **Deletar bancos de dados**
- 📋 Visualizar **logs** de operações

## 🛠️ Tecnologias

- **Next.js**: Framework React para frontend e API
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **PostgreSQL**: Banco de dados
- **Prisma**: ORM para acesso ao banco de dados
- **NextAuth.js**: Sistema de autenticação
- **pg_dump & pg_restore**: Para backup e restauração

## 🚀 Guia de Instalação Detalhado

### Pré-requisitos

- Node.js (v14 ou superior)
- PostgreSQL instalado no seu sistema
- Os comandos `pg_dump` e `pg_restore` devem estar disponíveis no PATH do sistema

### Informações Importantes

#### Caminho do PostgreSQL

Para o correto funcionamento da aplicação, é necessário que o PostgreSQL esteja corretamente configurado no sistema. Você pode configurar isso de duas formas:

1. **Usando a variável de ambiente PG_BIN_PATH (Recomendado)**:

   - Adicione a variável `PG_BIN_PATH` no arquivo `.env.local` apontando para o diretório bin do PostgreSQL:

   ```
   PG_BIN_PATH="C:\\Program Files\\PostgreSQL\\14\\bin"
   ```

   - Note o uso de barras duplas no caminho do Windows (`\\`)
   - Esta é a forma mais confiável de garantir que a aplicação localize os executáveis do PostgreSQL, independente da versão instalada

2. **Configurando o PATH do sistema**:
   Se preferir não usar a variável `PG_BIN_PATH`, o sistema tentará usar caminhos padrão, mas isso pode não funcionar corretamente se sua instalação do PostgreSQL estiver em um local diferente ou tiver uma versão diferente.

   No Windows:

   1. Localize o diretório de instalação do PostgreSQL (geralmente em `C:\Program Files\PostgreSQL\[versão]\bin`)
   2. Adicione este caminho às variáveis de ambiente do sistema:
      - Abra "Propriedades do Sistema" > "Variáveis de Ambiente"
      - Edite a variável "Path" e adicione o caminho completo para o diretório bin

   No Linux/Mac:

   ```bash
   export PATH=$PATH:/usr/lib/postgresql/[versão]/bin
   ```

#### Versão no Dashboard

A versão exibida no dashboard é apenas ilustrativa e não reflete a versão real do PostgreSQL instalada no seu sistema. Para verificar a versão real, execute:

```bash
psql --version
```

#### Diretório de Backup

Por padrão, os backups são armazenados no diretório configurado na variável `BACKUP_DIR` no arquivo `.env.local`.

Recomendações para diretório de backup:

- Escolha um local com espaço suficiente em disco
- Certifique-se de que o usuário da aplicação tenha permissões de escrita neste diretório
- Para backups importantes, considere configurar um caminho em outro dispositivo físico ou serviço de armazenamento em nuvem

Você pode modificar o caminho do diretório de backup a qualquer momento editando o valor de `BACKUP_DIR` no arquivo `.env.local`.

### Passo a passo para configuração

#### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd postgresql-manager
```

#### 2. Instale as dependências

```bash
npm install
```

#### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```
# Configuração do banco de dados PostgreSQL
DATABASE_URL="postgresql://postgres:suasenha@localhost:5432/pg_manager"

# Configurações do NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua_chave_secreta_aqui"

# Configuração para credenciais de acesso ao PostgreSQL
PG_USER="postgres"
PG_PASSWORD="suasenha"
PG_HOST="localhost"
PG_PORT="5432"

# Diretório para os backups
BACKUP_DIR="./backups"
```

**Importante:**

- Substitua `suasenha` pela senha do seu usuário PostgreSQL
- Gere uma chave aleatória para `NEXTAUTH_SECRET` (você pode usar: `openssl rand -base64 32` no terminal)
- Verifique se os dados de conexão estão corretos

#### 4. Crie o banco de dados principal

Antes de prosseguir, abra o PostgreSQL e crie o banco de dados principal:

```sql
CREATE DATABASE pg_manager;
```

Você pode fazer isso através do pgAdmin ou via terminal:

```bash
psql -U postgres -c "CREATE DATABASE pg_manager;"
```

#### 5. Execute as migrações do Prisma

Isso criará as tabelas necessárias no banco de dados:

```bash
npx prisma migrate dev --name init
```

Você deverá ver uma saída confirmando que as migrações foram aplicadas com sucesso.

#### 6. Execute o script de configuração inicial

O script `setup.ts` é essencial para criar o usuário administrador inicial:

```bash
npx tsx src/scripts/setup.ts
```

Alternativamente, você pode usar o comando npm definido no package.json:

```bash
npm run db:seed
```

**O que este script faz:**

- Cria um usuário administrador padrão no sistema
- Configura permissões iniciais
- Verifica se o PostgreSQL está acessível e configurado corretamente
- Cria a pasta de backups se não existir

Se você encontrar algum erro nesta etapa, verifique:

- Se o banco de dados está acessível com as credenciais fornecidas
- Se o Node.js tem permissão para criar pastas no local especificado em BACKUP_DIR
- Se todas as dependências foram instaladas corretamente

#### 7. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

#### 8. Acesse a aplicação

**⚠️ Importante**: Por segurança, altere essa senha após o primeiro login!

## 📝 Uso da Aplicação

### Dashboard

A página inicial apresenta as funcionalidades principais e métricas do sistema:

![Dashboard](/public/dashboard.png)

- Número de bancos de dados gerenciados
- Backups disponíveis
- Histórico de operações recentes
- Status do servidor PostgreSQL

### Bancos de Dados

Esta seção permite:

![Gerenciamento de Bancos de Dados](/public/bancoDeDados.png)

- Visualizar todos os bancos de dados PostgreSQL disponíveis
- Criar novos bancos de dados com facilidade
- Fazer backup manual de bancos existentes
- Excluir bancos de dados não utilizados
- Restaurar bancos de dados a partir de backups anteriores

#### Como fazer um backup

1. Acesse a seção "Bancos de Dados"
2. Localize o banco desejado na lista
3. Clique no botão "Backup"
4. Confirme a operação
5. O arquivo de backup será salvo na pasta configurada em BACKUP_DIR

#### Como restaurar um backup

1. Acesse a seção "Bancos de Dados"
2. Clique em "Restaurar Backup"
3. Selecione o arquivo de backup na lista
4. Escolha o nome do banco de destino
5. Confirme a operação

### Logs

A seção de logs exibe um histórico detalhado de todas as operações:

![Logs do Sistema](/public/logs.png)

- Timestamps precisos de cada ação
- Tipo de operação realizada
- Usuário responsável pela ação
- Status de conclusão
- Mensagens de erro (se houver)

## 🔒 Segurança

![Tela de Login](/public/login.png)

- O sistema utiliza autenticação baseada em JWT com NextAuth.js
- Todas as operações exigem autenticação
- As senhas são armazenadas com hash seguro (bcrypt)
- As operações de banco de dados são protegidas contra injeção SQL

## ⚠️ Solução de Problemas Comuns

1. **Erro de conexão com PostgreSQL**

   - Verifique se o PostgreSQL está em execução
   - Confirme se as credenciais em `.env.local` estão corretas
   - Teste a conexão manualmente: `psql -U postgres -h localhost`

2. **Erro ao executar o script setup.ts**

   - Verifique se o TypeScript está instalado: `npm install -g typescript`
   - Certifique-se que todas as variáveis de ambiente estão configuradas
   - Verifique se o banco de dados `pg_manager` foi criado

3. **Problemas de permissão nos backups**

   - Certifique-se que o diretório BACKUP_DIR tem permissões de escrita
   - Verifique se o usuário que executa a aplicação tem acesso ao PostgreSQL

4. **Comandos pg_dump ou pg_restore não encontrados**
   - Verifique se o PostgreSQL está instalado corretamente
   - Adicione os binários do PostgreSQL ao PATH do sistema
   - No Windows, verifique o PATH em Variáveis de Ambiente do Sistema

## 📄 Licença

Este projeto está licenciado sob a licença MIT.
