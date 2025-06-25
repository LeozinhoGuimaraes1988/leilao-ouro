// src/services/firebase/uploadPdfParaStorage.js
// import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { app } from './firebaseConfig'; // Ajuste se o arquivo tiver nome diferente

// const storage = getStorage(app);

// export async function uploadPdfParaStorage(file) {
//   const timestamp = Date.now();
//   const storageRef = ref(storage, `catalogos/catalogo-${timestamp}.pdf`);

//   await uploadBytes(storageRef, file);
//   const url = await getDownloadURL(storageRef);

//   return url;
// }
