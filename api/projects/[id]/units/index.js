import clientPromise from "../../config/database.js";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid project ID" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const units = await db.collection("units").find({ projectId: new ObjectId(id) }).toArray();

    if (!units) {
      return res.status(404).json({ error: "Units not found" });
    }

    res.status(200).json(units);
  } catch (err) {
    console.error("Failed to fetch units:", err);
    res.status(500).json({ error: "Failed to fetch units" });
  }
}
