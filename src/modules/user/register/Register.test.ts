import { Connection } from 'typeorm'
import faker from 'faker'

import { testConnection } from '../../../test-utils/testConnection'
import { graphqlCall } from '../../../test-utils/graphqlCall'
import { User } from '../../../entity/User.entity'

let connection: Connection

beforeAll(async () => {
  connection = await testConnection()
})

afterAll(async () => {
  await connection.close()
})

const registerMutation = `
    mutation Register($data: RegisterInput!) {
        register(data: $data)
    }
`

describe('Register', () => {
  it('creates user', async () => {
    const user = {
      name: faker.name.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password(8),
      username: faker.internet.userName()
    }
    const response = await graphqlCall({
      source: registerMutation,
      variableValues: {
        data: user
      }
    })
    expect(response).toMatchObject({
      data: {
        register: true
      }
    })

    const [dbUser] = await User.find({ where: { email: user.email }, take: 1 })
    expect(dbUser).toBeDefined()
    expect(dbUser.confirmed).toBeFalsy()
    expect(dbUser.name).toBe(user.name)
    expect(dbUser.username).toBe(user.username)
    expect(dbUser.email).toBe(user.email)
  })
})
