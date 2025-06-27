import pdfParse from 'pdf-parse';

export default async function extrairTextoPdf(buffer) {
  const result = await pdfParse(buffer);
  return result.text;
}
