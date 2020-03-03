import {Connection} from "typeorm";
import {testConnection} from "../../../test-utils/testConnection";
import {graphqlCall} from "../../../test-utils/graphqlCall";

let connection: Connection;

beforeAll(async () => {
    connection = await testConnection(true);
});

afterAll(async () => {
    await connection.close()
});

const registerMutation = `
    mutation Register($data: RegisterInput!) {
        register(data: $data) {
            id
            firstName
            lastName
            email
            name
        }
    }
`;

describe('Register', () => {
    it("creates user", async () => {
        const response = await graphqlCall({
            source: registerMutation,
            variableValues: {
                data: {
                    firstName: "foo",
                    lastName: "bar",
                    email: 'foo@bar.com',
                    password: 'foobar'
                }
            }
        });
        console.log(response)
    })
});
