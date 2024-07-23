const express=require('express')
const route=express.Router();
const uploadController=require('../controllers/uploadController')



route.post('/upload',uploadController.upload)

module.exports=route



// const run = async () => {
//     await consumer.connect();
//     await consumer.subscribe({ topic: 'video-upload', fromBeginning: true });
  
//     await consumer.run({
//       eachMessage: async ({ topic, partition, message }) => {
//         const videoMessage = JSON.parse(message.value.toString());
//         const { bucket, key, filePath } = videoMessage;
  
//         const downloadPath = path.join(__dirname, 'downloads', key);
  
//         // Download the video from MinIO
//         minioClient.fGetObject(bucket, key, downloadPath, async (err) => {
//           if (err) {
//             console.error('Error downloading video from MinIO:', err);
//             return;
//           }
  
//           console.log(`Video downloaded: ${downloadPath}`);
  
//           // Process the video (e.g., encode to multiple versions)
//           const processedFilePaths = await processVideo(downloadPath);
  
//           // Upload processed videos to MinIO
//           for (const processedFilePath of processedFilePaths) {
//             const processedKey = path.basename(processedFilePath);
//             minioClient.fPutObject('processed-videos', processedKey, processedFilePath, (err) => {
//               if (err) {
//                 console.error('Error uploading processed video to MinIO:', err);
//                 return;
//               }
  
//               console.log(`Processed video uploaded: ${processedFilePath}`);
  
//               // Delete the original video from MinIO
//               minioClient.removeObject(bucket, key, (err) => {
//                 if (err) {
//                   console.error('Error deleting original video from MinIO:', err);
//                   return;
//                 }
  
//                 console.log(`Original video deleted: ${key}`);
  
//                 // Delete local temporary files
//                 fs.unlinkSync(downloadPath);
//                 fs.unlinkSync(processedFilePath);
//               });
//             });
//           }
//         });
//       }
//     });
//   };
  