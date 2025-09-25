import clientPromise from "../../config/database.js";

export default async function handler(req, res) {
  const { id } = req.query; 
  const number = parseInt(id, 10);

  try {
    const client = await clientPromise;
    const db = client.db();
    const district = await db.collection("districts").findOne({ number: number });

    if (!district) {
      return res.status(404).json({ error: "District not found" });
    }

    res.status(200).json(district);
  } catch (err) {
    console.error("Failed to fetch district:", err);
    res.status(500).json({ error: "Failed to fetch district" });
  }
}
