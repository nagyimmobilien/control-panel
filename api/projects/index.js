import clientPromise from "../../config/database.js";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const projects = await db.collection("projects").find({}).toArray();

    res.status(200).json(projects);
  } catch (err) {
    console.error("Failed to fetch projects:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
}