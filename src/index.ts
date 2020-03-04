import "dotenv/config";
import "reflect-metadata";
import express from 'express';
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import {verify} from "jsonwebtoken";
import {ApolloServer} from "apollo-server-express";
import {createConnection} from "typeorm";
import {separateOperations} from "graphql";
import {fieldExtensionsEstimator, getComplexity, simpleEstimator} from "graphql-query-complexity";

import {createSchema} from "./utils/createSchema";
import {createAccessToken, createRefreshToken, sendRefreshToken} from "./utils/auth";
import {User} from "./entity/User.entity";
import {UserRole} from "./entity/user/UserRole.enum";
import {getAuthorizationPayloadFromToken} from "./modules/middleware/isAuthorized";

const main = async () => {
    const app = express();

    app.use(cors({
       credentials: true,
       origin: 'http://localhost:3000'
    }));

    app.use(cookieParser());
    app.use(bodyParser.json());

    app.post('/modify_user_roles', async (req, res) => {
        // TODO: Check if authorized, Right now we are just checking if user is authenticated
        try {
            getAuthorizationPayloadFromToken({ req, res });
        } catch (e) {
            console.log(e);
            return res.send({ ok: false, message: 'Not authorized' });
        }

        const [user] = await User.find({ where: { id: req.body.userId }, take: 1 });
        const role: UserRole = (UserRole as any)[req.body.role];
        const type = req.body.type;

        if (!role) {
            return res.send({ ok: false, message: 'invalid role' });
        }
        if (type !== 'ADD' && type !== 'REMOVE') {
            return res.send({ ok: false, message: 'invalid operation' });
        }
        if (type === 'ADD' && !user.roles.includes(role)) {
            user.roles.push(role);
        }
        if(type === 'REMOVE' && user.roles.includes(role)) {
            user.roles.splice(user.roles.indexOf(role), 1);
        }
        await user.save();
        return res.send({ ok: true, message: 'Modified user roles' });
    });

    app.post('/refresh_token', async (req, res) => {
        const token = req.cookies[`${process.env.REFRESH_COOKIE_NAME}`];
        if (!token) {
            console.error(`Invalid token ${token}`);
            return res.send({ ok: false, accessToken: "" });
        }

        let payload: any = null;

        try {
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
        } catch (e) {
            console.error(e);
            return res.send({ ok: false, accessToken: "" })
        }

        const [user] = await User.find({ where: { id: payload.userId }, take: 1 });

        if (!user) {
            console.error(`User ${payload.userId} is not defined`);
            return res.send({ ok: false, accessToken: "" })
        }

        if (user.tokenVersion !== payload.tokenVersion) {
            console.error(`token version mismatch for user ${user.id}`)
            return res.send({ ok: false, accessToken: "" })
        }

        sendRefreshToken(res, createRefreshToken(user));

        return res.send({ ok: true, accessToken: createAccessToken(user.id) })
    });

    await createConnection();

    const schema = await createSchema();
    const apolloServer = new ApolloServer({
        schema,
        context: ({ req, res }) => ({ req, res }),
        plugins: [
            {
                requestDidStart: () => ({
                    didResolveOperation({ request, document }) {
                        /**
                         * This provides GraphQL query analysis to be able to react on complex queries to your GraphQL server.
                         * This can be used to protect your GraphQL servers against resource exhaustion and DoS attacks.
                         * More documentation can be found at https://github.com/ivome/graphql-query-complexity.
                         */
                        const complexity = getComplexity({
                            // Our built schema
                            schema,
                            // To calculate query complexity properly,
                            // we have to check if the document contains multiple operations
                            // and eventually extract it operation from the whole query document.
                            query: request.operationName
                                ? separateOperations(document)[request.operationName]
                                : document,
                            // The variables for our GraphQL query
                            variables: request.variables,
                            // Add any number of estimators. The estimators are invoked in order, the first
                            // numeric value that is being returned by an estimator is used as the field complexity.
                            // If no estimator returns a value, an exception is raised.
                            estimators: [
                                // Using fieldConfigEstimator is mandatory to make it work with type-graphql.
                                // fieldConfigEstimator(), // <--- deprecated

                                fieldExtensionsEstimator(),

                                // Add more estimators here...
                                // This will assign each field a complexity of 1
                                // if no other estimator returned a value.
                                simpleEstimator({ defaultComplexity: 1 }),
                            ],
                        });
                        // Here we can react to the calculated complexity,
                        // like compare it with max and throw error when the threshold is reached.
                        if (complexity >= 20) {
                            throw new Error(
                                `Sorry, too complicated query! ${complexity} is over 20 that is the max allowed complexity.`,
                            );
                        }
                        // And here we can e.g. subtract the complexity point from hourly API calls limit.
                        if (complexity > 0) {
                            console.log("Used query complexity points:", complexity);
                        }
                    },
                }),
            },
        ]
    });
    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
       console.log('server started at http://localhost:4000/graphql')
    })
};

main();
