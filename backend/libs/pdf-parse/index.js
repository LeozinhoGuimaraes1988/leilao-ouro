import fs from 'fs';
import defaultParser from './pdf.js';

export default function pdf(dataBuffer, options = {}) {
  return defaultParser(dataBuffer, options);
}

pdf.fs = {
  readFileSync: fs.readFileSync,
};
