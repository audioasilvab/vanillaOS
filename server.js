const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 8000;

// 1. Servir tus archivos estáticos (tu index.html, CSS y JS de WinBox)
app.use(express.static('public'));

// 2. Servir la carpeta de aplicaciones para que el navegador pueda descargar los main.js
app.use('/apps', express.static(path.join(__dirname, 'apps')));

// 3. El Endpoint de "Descubrimiento"
app.get('/api/packages', (req, res) => {
    const appsPath = path.join(__dirname, 'apps');
    const folders = fs.readdirSync(appsPath);
    
    const manifest = folders.map(folder => {
        const metaPath = path.join(appsPath, folder, 'metadata.json');
        
        // Verificamos si la carpeta tiene un metadata.json
        if (fs.existsSync(metaPath)) {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            
            // Construimos la ruta real para que el Frontend sepa dónde está el ejecutable
            return {
                ...meta,
                entry: `/apps/${folder}/${meta.executable}`, // Ruta para el 'import()'
                path: `/apps/${folder}/` // Ruta base de la app
            };
        }
        return null;
    }).filter(app => app !== null); // Limpiamos carpetas vacías o sin metadata

    res.json(manifest);
});

app.listen(PORT, () => {
    console.log(`🚀 Sistema Operativo iniciado en http://localhost:${PORT}`);
});