import path from 'path'
import { Connection, createConnection } from 'typeorm'

export const testConnection: (_?: boolean) => Promise<Connection> = (
  drop = false
) => {
  return createConnection({
    name: 'default',
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'dbpwdpsql',
    database: 'boilerplate-test',
    synchronize: drop,
    dropSchema: drop,
    entities: [path.join(__dirname, '/../entity/*.*')],
  })
}
