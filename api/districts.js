import clientPromise from '../config/database.js';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("immobilien");
    const districts = await db.collection("districts").find({}).toArray();

    res.status(200).json(districts);
  } catch (err) {
    console.error("Failed to fetch districts:", err);
    res.status(500).json({ error: "Failed to fetch districts" });
  }
}
