const asyncHandler=require('express-async-handler')
const minio=require('minio')
const Busboy=require('busboy')
const {Kafka}=require('kafkajs')
// const { fstat } = require('minio/dist/esm/internal/async.mjs')

const minioClient=new minio.Client({
  endPoint: 'minio',// change it when contanerize the app
  port: 9000,
  useSSL: false,
  accessKey: "storedObject",
  secretKey: 'CHANGEME123'
})

const kafka = new Kafka({
  clientId: 'kafkajs',
  brokers: ['kafka1:9092', 'kafka2:9092'], // Use your Kafka broker addresses
});

const producer=kafka.producer({});


 const bucketName="videobuffer"

 const upload = asyncHandler(async (req, res, next) => {
  
   

    // still need to check that this user has already an account

    const busboy =  Busboy({ headers: req.headers });// know the header of the file to know how it will parse it
    const formData={};
    busboy.on('field', (fieldname, val) => {
      console.log(`Field [${fieldname}]: ${val}`);
      formData[fieldname] = val;
    });

    busboy.on('file', (fieldname, file, info) => { // will put all the chunks that are coming in file object and after recieving all it will be 
                                                   // sent to minio objectstore and object store will internally take them as streams
        const { filename, encoding, mimeType } = info;
        console.log(`Receiving file: ${filename}`);

        // Upload the file stream directly to MinIO
        minioClient.putObject(bucketName, filename, file, { 'Content-Type': mimeType }, async(err, etag) => {// filename will be the key of the vid in minio
            if (err) {
                console.error('Upload error:', err);
                return res.status(500).send('Upload failed');
            }
            console.log('Video has been sent to MinIO');

            // Send event to Kafka after the file upload is complete
  
            try{
            await producer.connect();
            console.log("Connected to producer!");
        
            const eventData = {
              filename: filename,
              bucket: bucketName,
              mimetype: mimeType,
              title:formData['title'],
              description:formData['description'],
              userId:formData['userId']
            };
        
            const result = await producer.send({
              topic: 'video',
              messages: [
                {
                  value: JSON.stringify(eventData),
                },
              ],
            });
        
            console.log("Message sent successfully:", result);
          } catch (error) {
            console.error("Error sending message:", error.message, error.stack);
          } finally {
            await producer.disconnect();
            console.log("Disconnected from producer.");
          }
            console.log("DONE")
            res.status(200).json("video uploaded successfully")
        });
    });

    // // Pipe the incoming request to Busboy
     req.pipe(busboy);// will recieve the req which is the file and send it to busboy instance and when busboy recieve files it emit event named file and it will listen at it
 });

// Graceful shutdown on SIGINT
process.on('SIGINT', async () => {
  await producer.disconnect();
  console.log('Kafka producer disconnected');
  process.exit();
});



module.exports={
    upload
}




