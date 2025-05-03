import { exec } from "child_process";
import path from "path";
import fs from "fs/promises";
import util from "util";
import os from "os";

// Promisificar exec
const execAsync = util.promisify(exec);

// Configuração do PostgreSQL (use variáveis de ambiente em produção)
const pgConfig = {
  host: process.env.POSTGRES_HOST || "localhost",
  port: process.env.POSTGRES_PORT || "5432",
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres",
};

// Determina o caminho para os binários do PostgreSQL com base no sistema operacional
const getPgBinPath = () => {
  // Se a variável de ambiente PG_BIN_PATH estiver definida, use-a
  // Esta é a forma recomendada de configurar o caminho para os binários do PostgreSQL
  if (process.env.PG_BIN_PATH) {
    return process.env.PG_BIN_PATH;
  }

  // Caminhos padrão para diferentes sistemas operacionais
  // Observe que esses são apenas fallbacks e podem não funcionar para todas as instalações
  switch (os.platform()) {
    case "win32":
      // No Windows, o PostgreSQL geralmente é instalado em Program Files
      // O número da versão pode variar (14, 15, etc.)
      return "C:\\Program Files\\PostgreSQL\\14\\bin";
    case "darwin": // macOS
      return "/Library/PostgreSQL/14/bin";
    default: // Linux e outros
      return "/usr/lib/postgresql/14/bin";
  }
};

// Caminhos para as ferramentas do PostgreSQL
const getPgDumpPath = () => path.join(getPgBinPath(), "pg_dump");
const getPgRestorePath = () => path.join(getPgBinPath(), "pg_restore");
const getPsqlPath = () => path.join(getPgBinPath(), "psql");

// Diretório de backup
const backupDir = process.env.BACKUP_DIR || "./backups";

// Certifique-se de que o diretório de backup existe
const ensureBackupDir = async () => {
  try {
    await fs.mkdir(backupDir, { recursive: true });
  } catch (error) {
    console.error("Erro ao criar diretório de backup:", error);
    throw error;
  }
};

// Listar todos os bancos de dados
export async function listDatabases() {
  // Usar o caminho completo para psql
  const psqlPath = getPsqlPath();

  try {
    const { stdout } = await execAsync(
      `"${psqlPath}" -U ${pgConfig.user} -h ${pgConfig.host} -p ${pgConfig.port} -t -c "SELECT datname FROM pg_database WHERE datistemplate = false AND datname NOT IN ('postgres', 'template0', 'template1')"`,
      {
        env: {
          ...process.env,
          PGPASSWORD: pgConfig.password,
        },
      }
    );

    const databases = stdout
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => line.trim());

    return databases;
  } catch (error) {
    console.error("Erro ao listar bancos de dados:", error);
    throw error;
  }
}

// Criar um novo banco de dados
export async function createDatabase(databaseName: string) {
  // Usar o caminho completo para psql
  const psqlPath = getPsqlPath();

  try {
    await execAsync(
      `"${psqlPath}" -U ${pgConfig.user} -h ${pgConfig.host} -p ${pgConfig.port} -c "CREATE DATABASE ${databaseName}"`,
      {
        env: {
          ...process.env,
          PGPASSWORD: pgConfig.password,
        },
      }
    );

    return {
      success: true,
      message: `Banco de dados '${databaseName}' criado com sucesso.`,
    };
  } catch (error: any) {
    console.error(`Erro ao criar banco de dados '${databaseName}':`, error);
    // Verificar se o erro é porque o banco já existe
    if (error.message.includes("already exists")) {
      throw new Error(`O banco de dados '${databaseName}' já existe.`);
    }
    throw error;
  }
}

// Excluir um banco de dados
export async function deleteDatabase(databaseName: string) {
  // Usar o caminho completo para psql
  const psqlPath = getPsqlPath();

  try {
    await execAsync(
      `"${psqlPath}" -U ${pgConfig.user} -h ${pgConfig.host} -p ${pgConfig.port} -c "DROP DATABASE ${databaseName}"`,
      {
        env: {
          ...process.env,
          PGPASSWORD: pgConfig.password,
        },
      }
    );

    return {
      success: true,
      message: `Banco de dados '${databaseName}' excluído com sucesso.`,
    };
  } catch (error) {
    console.error(`Erro ao excluir banco de dados '${databaseName}':`, error);
    throw error;
  }
}

// Fazer backup de um banco de dados
export async function backupDatabase(databaseName: string) {
  await ensureBackupDir();

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFileName = `${databaseName}_${timestamp}.backup`;
  const backupFilePath = path.join(backupDir, backupFileName);

  // Usar o caminho completo para pg_dump
  const pgDumpPath = getPgDumpPath();

  try {
    // Executa o comando pg_dump para gerar o backup
    const { stdout, stderr } = await execAsync(
      `"${pgDumpPath}" -U ${pgConfig.user} -h ${pgConfig.host} -p ${pgConfig.port} -F c -b -v -f "${backupFilePath}" ${databaseName}`,
      {
        env: {
          ...process.env,
          PGPASSWORD: pgConfig.password,
        },
      }
    );

    if (stderr && !stderr.includes("dumping") && !stderr.includes("dumped")) {
      console.warn("Avisos durante o backup:", stderr);
    }

    // Verificar se o arquivo de backup foi criado
    // Tentar múltiplas vezes, com um pequeno delay entre as tentativas
    let fileExists = false;
    let fileSize = 0;
    let attempts = 0;
    const maxAttempts = 10;

    while (!fileExists && attempts < maxAttempts) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Espera 500ms

        const stats = await fs.stat(backupFilePath);
        fileExists = true;
        fileSize = stats.size;

        if (fileSize === 0) {
          // Arquivo existe mas está vazio, vamos esperar mais
          fileExists = false;
        }
      } catch (err) {
        // Arquivo ainda não existe, vamos tentar novamente
      }

      attempts++;
    }

    if (!fileExists || fileSize === 0) {
      throw new Error(
        "O arquivo de backup não foi criado ou está vazio após múltiplas tentativas"
      );
    }

    return {
      success: true,
      message: `Backup do banco de dados '${databaseName}' concluído.`,
      filename: backupFileName,
      filePath: backupFilePath,
      size: fileSize,
    };
  } catch (error) {
    console.error(
      `Erro ao fazer backup do banco de dados '${databaseName}':`,
      error
    );
    throw error;
  }
}

// Restaurar um banco de dados a partir de um backup
export async function restoreDatabase(
  databaseName: string,
  backupFileName: string
) {
  const backupFilePath = path.join(backupDir, backupFileName);

  // Usar o caminho completo para pg_restore
  const pgRestorePath = getPgRestorePath();

  try {
    // Verifica se o arquivo de backup existe
    await fs.access(backupFilePath);

    // Variável para rastrear se o banco foi recém-criado
    let isNewDatabase = false;

    // Verifica se o banco de dados existe
    try {
      await createDatabase(databaseName);
      isNewDatabase = true;
    } catch (error: any) {
      if (!error.message.includes("already exists")) {
        throw error;
      }
    }

    // Define o comando pg_restore apropriado com base no estado do banco
    // Para bancos recém-criados, não use a flag --clean para evitar erros
    const restoreCommand = isNewDatabase
      ? `"${pgRestorePath}" -U ${pgConfig.user} -h ${pgConfig.host} -p ${pgConfig.port} -d ${databaseName} "${backupFilePath}"`
      : `"${pgRestorePath}" -U ${pgConfig.user} -h ${pgConfig.host} -p ${pgConfig.port} -d ${databaseName} --clean "${backupFilePath}"`;

    // Executa o comando pg_restore para restaurar o backup
    const { stdout, stderr } = await execAsync(restoreCommand, {
      env: {
        ...process.env,
        PGPASSWORD: pgConfig.password,
      },
    });

    if (stderr) {
      // Verificar se há erros reais ou apenas mensagens informativas
      if (
        !stderr.includes("pg_restore: executing") &&
        !stderr.includes("pg_restore: processing") &&
        !stderr.includes("pg_restore: creating")
      ) {
        console.warn(`Avisos durante a restauração: ${stderr}`);
      }
    }

    return {
      success: true,
      message: `Banco de dados '${databaseName}' restaurado a partir do backup '${backupFileName}'.`,
    };
  } catch (error) {
    console.error(`Erro ao restaurar banco de dados '${databaseName}':`, error);
    throw error;
  }
}

// Listar arquivos de backup disponíveis
export async function listBackups() {
  await ensureBackupDir();

  try {
    const files = await fs.readdir(backupDir);
    const backups = [];

    for (const file of files) {
      if (file.endsWith(".backup")) {
        const stats = await fs.stat(path.join(backupDir, file));

        backups.push({
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime,
        });
      }
    }

    return backups;
  } catch (error) {
    console.error("Erro ao listar backups:", error);
    throw error;
  }
}

// Listar todas as tabelas de um banco de dados específico
export async function listTables(databaseName: string) {
  // Usar o caminho completo para psql
  const psqlPath = getPsqlPath();

  try {
    const { stdout } = await execAsync(
      `"${psqlPath}" -U ${pgConfig.user} -h ${pgConfig.host} -p ${pgConfig.port} -d ${databaseName} -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"`,
      {
        env: {
          ...process.env,
          PGPASSWORD: pgConfig.password,
        },
      }
    );

    const tables = stdout
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => line.trim());

    return tables;
  } catch (error) {
    console.error(
      `Erro ao listar tabelas do banco de dados '${databaseName}':`,
      error
    );
    throw error;
  }
}

// Verificar se o PostgreSQL está acessível
export async function checkPostgresConnection() {
  // Usar o caminho completo para psql
  const psqlPath = getPsqlPath();

  try {
    const { stdout } = await execAsync(
      `"${psqlPath}" -U ${pgConfig.user} -h ${pgConfig.host} -p ${pgConfig.port} -c "SELECT version()"`,
      {
        env: {
          ...process.env,
          PGPASSWORD: pgConfig.password,
        },
      }
    );

    return {
      success: true,
      version: stdout.trim(),
    };
  } catch (error) {
    console.error("Erro ao verificar conexão com o PostgreSQL:", error);
    throw error;
  }
}
