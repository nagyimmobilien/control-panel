import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import clientPromise from "../../../../config/database.js";
import { ObjectId } from "mongodb";
import Project from "../../../../modules/projects/model/project.model.js";

const generateHTMLContent = (projectWithUnitsAndDistrict) => {
  const { district, project, units } = projectWithUnitsAndDistrict;
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title></title>
    </head>
    <body>
      <header>
        ${JSON.stringify(district.zipCode)}
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
        ${units.map(unit => {
          return `
            <tr>
              <td>${unit.houseNumber}</td>
              <td>
                <a target="_blank" href="${unit.floorPlanUrl}">TOP ${unit.apartmentNumber}</a>
              </td>
              <td>${unit.floorNumber}</td>
              <td>${unit.roomNumber}</td>
              <td>${unit.livingArea}</td>
              <td>${unit.loggiaArea}</td>
              <td>${unit.balconyArea}</td>
              <td>${unit.terraceArea}</td>
              <td>${unit.roofTerraceArea}</td>
              <td>${unit.gardenTerraceArea}</td>                                 
              <td>${unit.gardenArea}</td>                                 
              <td>${unit.sumOfOutsideAreas}</td>                                 
              <td>${unit.sumOfAllAreas}</td>                                                              
              <td>${unit.listingPriceForInvestors}</td>
              <td>${unit.listingPriceForPersonalUse}</td>
              <td class="${unit.status === "Elérhető" ? "active-status" : "inactive-status"}">${unit.status}</td>
            </tr>
          `;
        }).join('')}
        </tbody>
      </table>
    </body>
  </html>
  `;
}

export default async function handler(req, res) {
  try {
  
    res.setHeader('Access-Control-Allow-Origin', 'https://becsingatlan.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { id } = req.query;

    if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const project = await db.collection("projects").aggregate([
    { 
      $match: { _id: new ObjectId(id) } 
    },
    {
      $lookup: {
        from: "units",
        localField: "_id",
        foreignField: "project",
        as: "units",
      },
    },
    {
      $lookup: {
        from: "districts",
        localField: "district",
        foreignField: "_id",
        as: "district",
      },
    },
    { 
      $unwind: { path: "$district", preserveNullAndEmptyArrays: true } 
    },
    ]).toArray();

    const projectWithUnitsAndDistrict = project[0];

    
    if (!projectWithUnitsAndDistrict) return res.status(404).json({ error: "Project not found" });

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
    res.setHeader('Content-Disposition', `attachment; filename="${project}_arlista.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Failed generate units pricelist pdf:", err);
    res.status(500).json({ error: "Failed to generate units pricelist pdf:" });
  }
}