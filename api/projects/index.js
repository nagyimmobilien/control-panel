import connectDB from "../../config/database/mongodb.js";
import Project from "../../modules/project/model/project.model.js"

export default async function handler(req, res) {
  try {
    await connectDB();

    const projects = await Project.find({}).sort({ number: 1 });
    
    res.status(200).json(projects);
  } catch (err) {
    console.error("Failed to fetch projects::", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
}