import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

export default async function parsePDF(dataBuffer, options = {}) {
  const loadingTask = pdfjsLib.getDocument({ data: dataBuffer });
  const pdfDocument = await loadingTask.promise;

  const maxPages = pdfDocument.numPages;
  const pageTextPromises = [];

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    pageTextPromises.push(
      pdfDocument.getPage(pageNum).then((page) => {
        return page.getTextContent().then((textContent) => {
          return textContent.items.map((item) => item.str).join(' ');
        });
      })
    );
  }

  const pageTexts = await Promise.all(pageTextPromises);
  return {
    numpages: maxPages,
    text: pageTexts.join('\n'),
  };
}
