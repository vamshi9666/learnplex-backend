import {Connection} from "typeorm";
import faker from "faker";

import {testConnection} from "../../../test-utils/testConnection";
import {graphqlCall} from "../../../test-utils/graphqlCall";
import {User} from "../../../entity/User";

let connection: Connection;

beforeAll(async () => {
    connection = await testConnection();
});

afterAll(async () => {
    await connection.close()
});

const meQuery = `
    query {
        me {
            id
            firstName
            lastName
            email
            name
        }
    }
`;

describe('Me', () => {
    it("gets user", async () => {
        const user = await User.create({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password(8)
        }).save();

        const response = await graphqlCall({
            source: meQuery,
            userId: user.id
        });

        expect(response).toMatchObject({
            data: {
                me: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                }
            }
        })
    });

    it("returns null", async () => {
        const response = await graphqlCall({
            source: meQuery
        });

        expect(response).toMatchObject({
            data: {
                me: null
            }
        })
    })
});
