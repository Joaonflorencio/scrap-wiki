// Requerir las dependencias
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

// Inicializar Express
const app = express();
const port = 4007; // El puerto en el que se ejecutará el servidor

// URL 
const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap';

app.get('/scrape', async (req, res) => {
    try {
        // Array para almacenar los datos scrapeados
        const data = [];

        // Obtener HTML de la categoría de músicos de rap
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        //  Recoger todos los enlaces dentro de #mw-pages
        const links = [];
        $('#mw-pages a').each((index, element) => {
            const href = $(element).attr('href');
            if (href) {
                links.push(`https://es.wikipedia.org${href}`);
            }
        });

        //  Recorrer cada enlace y realizar scraping de los datos
        for (let link of links) {
            const pageResponse = await axios.get(link);
            const $$ = cheerio.load(pageResponse.data);

            // Obtener el título
            const title = $$('h1').text();

            // Obtener todas las imágenes
            const images = [];
            $$('img').each((index, image) => {
                images.push($$(image).attr('src'));
            });

            // Obtener todos los textos de los párrafos
            const texts = [];
            $$('p').each((index, paragraph) => {
                texts.push($$(paragraph).text());
            });

            // Guardar los datos en el array
            data.push({ title, images, texts });
        }

        //  Enviar los datos scrapeados
        console.log(data); // O enviar con res.send(data);
        res.send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error during scraping');
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});