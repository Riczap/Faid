const fs = require('fs');
let data = fs.readFileSync('src/template/layout/AppSidebar.tsx', 'utf8');

// Fix Educacion encoding
data = data.replace(/name: "Educaci[^"]+n Financiera",/, 'name: "Educación Financiera",');

// Insert Radar into Education
const edTarget = 'subItems: [\n      { name: "Contenido Educativo", path: "/education", pro: false },';
const edReplacement = 'subItems: [\n      { name: "Radar de Rendimientos", path: "/yield-radar", pro: false },\n      { name: "Contenido Educativo", path: "/education", pro: false },';
data = data.replace(edTarget, edReplacement);

// Just in case it has different spacing or carriage returns
data = data.replace(/subItems:\s*\[\s*\{\s*name:\s*"Contenido Educativo"/, 'subItems: [\n      { name: "Radar de Rendimientos", path: "/yield-radar", pro: false },\n      { name: "Contenido Educativo"');


fs.writeFileSync('src/template/layout/AppSidebar.tsx', data, 'utf8');
console.log("Replaced successfully!");
