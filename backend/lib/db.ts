import oracledb from 'oracledb'

const {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_SERVICE,
} = process.env

type PoolGlobal = typeof globalThis & { __petpulsePool?: Promise<oracledb.Pool> }

function getConfig() {
  if (
    !DATABASE_HOST ||
    !DATABASE_PORT ||
    !DATABASE_USER ||
    !DATABASE_PASSWORD ||
    !DATABASE_SERVICE
  ) {
    throw new Error(
      'Faltan variables DATABASE_* de configuración en backend/.env'
    )
  }
  return {
    connectString: `//${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_SERVICE}`,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
  }
}

export function getPool(): Promise<oracledb.Pool> {
  const cache = globalThis as PoolGlobal
  let pool = cache.__petpulsePool
  if (!pool) {
    pool = oracledb.createPool({
      ...getConfig(),
      poolMin: 2,
      poolMax: 10,
      poolAlias: 'default',
    })
    pool.catch(() => {
      delete cache.__petpulsePool
    })
    cache.__petpulsePool = pool
  }
  return pool
}

const WRITE_RE = /^\s*(INSERT|UPDATE|DELETE)\b/i

export async function query<T = Record<string, unknown>>(
  sql: string,
  binds: oracledb.BindParameters = {},
  options: oracledb.ExecuteOptions = {}
): Promise<T[]> {
  const pool = await getPool()
  const connection = await pool.getConnection()
  try {
    const result = await connection.execute<T>(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: WRITE_RE.test(sql),
      ...options,
    })
    return (result.rows ?? []) as T[]
  } finally {
    await connection.close()
  }
}

export async function closePool(): Promise<void> {
  const cache = globalThis as PoolGlobal
  if (cache.__petpulsePool) {
    const pool = await cache.__petpulsePool
    await pool.close()
    delete cache.__petpulsePool
  }
}
