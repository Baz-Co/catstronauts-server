import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import typeDefs from "./schema.js";
import resolvers from "./resolvers.js";
import TrackAPI from "./datasources/track-api.js";


// const { startStandaloneServer } = require("@apollo/server/standalone");
// const typeDefs = require("./schema");
// const resolvers = require("./resolvers");
// const TrackAPI = require("./datasources/track-api");

// async function startApolloServer() {
//   const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//   });

//   const { url } = await startStandaloneServer(server, {
//     context: async () => {
//       return {
//         dataSources: {
//           trackAPI: new TrackAPI(),
//         },
//       };
//     },
//     listen: {
//       port: process.env.PORT || 4000,
//     },
//   });

//   console.log(`
//       🚀  Server is running
//       📭  Query at ${url}
//     `);
// }

// startApolloServer();

// Required logic for integrating with Express
const app = express();
// Our httpServer handles incoming requests to our Express app.
// Below, we tell Apollo Server to "drain" this httpServer,
// enabling our servers to shut down gracefully.
const httpServer = http.createServer(app);

// Same ApolloServer initialization as before, plus the drain plugin
// for our httpServer.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
// Ensure we wait for our server to start
await server.start();

// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.
app.use(
  "/",
  cors(),
  // cors({ origin: ['https://*.up.railway.app', 'http://localhost:3000', 'https://bazco.de', 'https://studio.apollographql.com'] }),
  bodyParser.json(),
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    context: async () => {
      return {
        dataSources: {
          trackAPI: new TrackAPI(),
        },
      };
    },
    listen: {
      port: process.env.PORT || 4000,
    },
  })
);

// Modified server startup
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));

console.log(`🚀 Server ready at http://localhost:4000/`);

// Specify the path where we'd like to mount our server
//highlight-start
// app.use("/", cors(), bodyParser.json({ limit: '50mb' }), expressMiddleware(server));
// app.use(
//   "/",
//   cors(),
//   bodyParser.json({ limit: '50mb' }),
//   expressMiddleware(server, {
//     context: async () => {
//       return {
//         dataSources: {
//           trackAPI: new TrackAPI(),
//         },
//       };
//     },
//     listen: {
//       port: process.env.PORT || 4000,
//     },
//   })
// );

//highlight-end
