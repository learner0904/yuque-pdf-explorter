import fs from 'fs';
import path from 'path';
import { type } from './const.js';

export async function exportPDFFiles(page, books) {
    const folderPath = process.env.EXPORT_PATH;
    console.log("Download folder path: " + folderPath);
    if (!fs.existsSync(folderPath)) {
        console.error(`Export path: ${folderPath} does not exist`);
        process.exit(1);
    }

    for (let i = 0; i < books.length; i++) {
        await exportMarkDownFileTree(page, folderPath, books[i], books[i].root);
        console.log();
    }

    console.log(`=====> Export successfully! Have a good day!`);
    console.log();
}

async function exportMarkDownFileTree(page, folderPath, book, node) {
    switch (node.type) {
        case type.Book: 
        case type.Title: 
        case type.TitleDoc:
            folderPath = path.join(folderPath, node.name || book.name);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
            break;
        case type.Document:
            await printToPDF(page, folderPath, book.name, node.name.replace(/\//g, '_'), book.user_url + '/' + book.slug + '/' + node.object.url);
            break;
    }

    if (node.children) {
        for (const childNode of node.children) {
            await exportMarkDownFileTree(page, folderPath, book, childNode);
        }
    }
}

async function printToPDF(page, folderPath, bookName, mdname, docUrl) {
    const url = `https://www.yuque.com/${docUrl}/pdf`;
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    const pdfPath = path.join(folderPath, `${mdname}.pdf`);
    console.log(`Saving PDF for ${bookName}/${mdname} at: ${pdfPath}`);
    
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        landscape: false,
    });
    console.log(`PDF saved successfully: ${pdfPath}`);
}
