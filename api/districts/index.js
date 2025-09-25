import clientPromise from "../../config/database.js";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const districts = await db.collection("districts").find({}).sort({ number: 1 }).toArray();

    res.status(200).json(districts);
  } catch (err) {
    console.error("Failed to fetch districts:", err);
    res.status(500).json({ error: "Failed to fetch districts" });
  }
}
