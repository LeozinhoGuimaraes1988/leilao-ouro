import pdfParse from 'pdf-parse/lib/pdf-parse.js';
export default async function extrairTextoPdf(buffer) {
  const result = await pdfParse(buffer);
  return result.text;
}
