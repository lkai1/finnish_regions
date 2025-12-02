import fs from "fs";
import path from "path";

// CSV-tiedoston polku
const csvFilePath = path.resolve("./kunta_1_20210101#maakunta_1_20210101.csv");

// Lue CSV
const csvData = fs.readFileSync(csvFilePath, "utf-8");

// Pilko rivit ja poista tyhjät
const rows = csvData.split("\n").filter(Boolean);

// Poista otsikkorivi
const headers = rows.shift().split(";").map(h => h.replace(/"/g, "").trim());

// Tarkistus odotetuista sarakkeista
if (!headers.includes("sourceName") || !headers.includes("targetName")) {
    throw new Error("CSV ei sisällä odotettuja sarakkeita: sourceName, targetName");
}

// Käytetään map:ia maakunnille
const regionsMap = {};
const municipalityCounters = {};

rows.forEach((row) => {
    const cols = row.split(";").map(c => c.replace(/"/g, "").trim());
    const sourceName = cols[1]; // kunnan nimi
    const targetName = cols[3]; // maakunnan nimi

    if (!regionsMap[targetName]) {
        regionsMap[targetName] = { name: targetName, municipalities: [] };
        municipalityCounters[targetName] = 1;
    }

    regionsMap[targetName].municipalities.push({
        id: municipalityCounters[targetName]++,
        name: sourceName,
    });
});

// Muutetaan map listaksi ja annetaan peräkkäiset id:t maakunnille
const finnishRegions = Object.entries(regionsMap).map(([name, data], index) => ({
    id: index + 1,
    name,
    municipalities: data.municipalities,
}));

// Kirjoitetaan JavaScript-tiedostoon
fs.writeFileSync(
    "finnishRegions.js",
    `export const finnishRegions = ${JSON.stringify(finnishRegions, null, 2)};`
);

console.log("finnishRegions.js luotu!");
