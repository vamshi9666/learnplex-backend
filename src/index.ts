import "reflect-metadata";
import express from 'express';
import cookieParser from "cookie-parser";
import cors from "cors";
import {verify} from "jsonwebtoken";
import {ApolloServer} from "apollo-server-express";
import {createConnection} from "typeorm";
import {separateOperations} from "graphql";
import {fieldExtensionsEstimator, getComplexity, simpleEstimator} from "graphql-query-complexity";

import {createSchema} from "./utils/createSchema";
import {User} from "./entity/User";
import {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} from "./constants";
import {createCookiesAndLogin, createTokens} from "./utils/auth";

const main = async () => {
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
                       console.log("Used query complexity points:", complexity);
                   },
               }),
           },
       ]
   });

   const app = express();

   app.use(cors({
       credentials: true,
       origin: 'http://localhost:3000'
   }));

    app.use(cookieParser());

   app.use(async (req: any, res, next) => {
       const accessToken = req.cookies['access-token'];
       const refreshToken = req.cookies['refresh-token'];

       console.log(accessToken, refreshToken);

       if (!refreshToken && !accessToken) {
           return next();
       }

       try {
           const data = verify(accessToken, ACCESS_TOKEN_SECRET) as any;
           req.userId = data.userId;
           return next();
       } catch {}

       if (!refreshToken) {
           return next();
       }

       let data;

       try {
           data = verify(refreshToken, REFRESH_TOKEN_SECRET) as any;
       } catch {
           return next();
       }

       const [user] = await User.find({ where: { id: data.userId } });

       if (!user || user.refreshTokenCount !== data.count) {
           return next()
       }

       const tokens = createTokens(user);
       createCookiesAndLogin({ req, res }, tokens.refreshToken, tokens.accessToken, user.id);

       next()
   });


   apolloServer.applyMiddleware({ app });

   app.listen(4000, () => {
       console.log('server started at http://localhost:4000/graphql')
   })
};

main();
