import chromium from "@sparticuz/chromium";
import mongoose from "mongoose";
import puppeteer from "puppeteer-core";
import connectDB from "../../../../config/database/mongodb.js";
import Project from "../../../../modules/project/model/project.model.js";
import District from "../../../../modules/district/district.model.js";
import Unit from "../../../../modules/unit/model/unit.model.js";

const generateHTMLContent = (projectWithUnitsAndDistrict) => {
  const { district, units } = projectWithUnitsAndDistrict;
  const project = projectWithUnitsAndDistrict;

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>${project.name} – Árlista</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 4px; text-align: center; }
        th { background-color: #f5f5f5; }
        .active-status { color: green; font-weight: bold; }
        .inactive-status { color: red; font-weight: bold; }
      </style>
    </head>
    <body>
      <header>
        <h2>${project.name}</h2>
        <p><strong>Cím:</strong> ${project.address}</p>
        <p><strong>Kerület:</strong> ${district?.name || ""} (${district?.zipCode || ""})</p>
      </header>

      <table>
        <thead>
          <tr>
            <th>Lh.</th>
            <th>Lakás*</th>
            <th>Emelet</th>
            <th>Szobák</th>
            <th>Alapterület (m²)</th>
            <th>Loggia (m²)</th>
            <th>Erkély (m²)</th>
            <th>Terasz (m²)</th>
            <th>Tetőterasz (m²)</th>
            <th>Kerti terasz (m²)</th>
            <th>Kert (m²)</th>
            <th>Teljes külső (m²)</th>
            <th>Összterület (m²)</th>
            <th>Eladási ár (befektetés)</th>
            <th>Eladási ár (saját)</th> 
            <th>Státusz</th>
          </tr>
        </thead>
        <tbody>
        ${units.map(unit => `
          <tr>
            <td>${unit.houseNumber || ""}</td>
            <td><a target="_blank" href="${unit.floorPlanUrl || "#"}">TOP ${unit.apartmentNumber || ""}</a></td>
            <td>${unit.floorNumber || ""}</td>
            <td>${unit.roomNumber || ""}</td>
            <td>${unit.livingArea || ""}</td>
            <td>${unit.loggiaArea || ""}</td>
            <td>${unit.balconyArea || ""}</td>
            <td>${unit.terraceArea || ""}</td>
            <td>${unit.roofTerraceArea || ""}</td>
            <td>${unit.gardenTerraceArea || ""}</td>                                 
            <td>${unit.gardenArea || ""}</td>                                 
            <td>${unit.sumOfOutsideAreas || ""}</td>                                 
            <td>${unit.sumOfAllAreas || ""}</td>                                                              
            <td>${unit.listingPriceForInvestors || ""}</td>
            <td>${unit.listingPriceForPersonalUse || ""}</td>
            <td class="${unit.status === "Elérhető" ? "active-status" : "inactive-status"}">${unit.status || ""}</td>
          </tr>
        `).join('')}
        </tbody>
      </table>
    </body>
  </html>
  `;
};

export default async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', 'https://becsingatlan.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { id } = req.query;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    await connectDB();

    const project = await Project.findById(id)
      .populate("units")
      .populate("district")
      .lean({ virtuals: true });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const projectWithUnitsAndDistrict = {
      ...project,
      units: project.units || [],
      district: project.district || {}
    };

    /*
      const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true,
        ignoreHTTPSErrors: true
      });
    */

    const browser = await puppeteer.launch({
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    const content = generateHTMLContent(projectWithUnitsAndDistrict);

    await page.setContent(content, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
      scale: 0.75
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${project.name}_arlista.pdf"`);
    res.send(pdfBuffer);

  } catch (err) {
    console.error("Failed to generate units pricelist pdf:", err);
    res.status(500).json({ error: "Failed to generate units pricelist pdf" });
  }
}
