import 'dotenv/config';
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined.");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
});

const clientPromise = client.connect().then(() => {
  console.log("MongoDB connected successfully!");
  return client;
}).catch(err => {
  console.error("Failed to connect to MongoDB!", err);
  throw err;
});

export default clientPromise;
