import connectDB from "../../../config/database/mongodb.js";
import Project from "../../../modules/project/model/project.model.js"

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid project ID" });
  }

  try {
    await connectDB();

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json(project);
  } catch (err) {
    console.error("Failed to fetch project by ID:", err);
    res.status(500).json({ error: "Failed to fetch project by ID" });
  }
}
