import clientPromise from "../../../config/database.js";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid project ID" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const project = await db.collection("projects").findOne({ _id: new ObjectId(id) });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json(project);
  } catch (err) {
    console.error("Failed to fetch project:", err);
    res.status(500).json({ error: "Failed to fetch project" });
  }
}