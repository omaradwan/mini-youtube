const asyncHandler=require('express-async-handler')
const minio=require('minio')
const Busboy=require('busboy')
const {Kafka,Partitioners}=require('kafkajs')

const minioClient=new minio.Client({
  endPoint: 'localhost',// change it when contanerize the app
  port: 9000,
  useSSL: false,
  accessKey: 'ROOTUSER',
  secretKey: 'CHANGEME123'
})

const kafka=new Kafka({
    // will change the host when making container from the app
    "clientId": 'kafkajs',
    "brokers": ['localhost:9092']
})
run();
async function run(){
    const admin = kafka.admin();
    try {
      await admin.connect();
      console.log("Connected to admin!");
  
      const topicCreationResult = await admin.createTopics({
        "topics": [
          {
            "topic": "video",
            "numPartitions": 3,
          }
        ]
      });
      if (topicCreationResult) {
        console.log("Topics created successfully!");
      } else {
        console.log("Topics already exist or there was an issue creating them.");
      }
    } catch (err) {
      console.log("Error during topic creation:", err);
    } finally {
   //   await admin.disconnect();
      console.log("Disconnected from admin!");
    }
}





const bucketName="videobuffer"

const upload = asyncHandler(async (req, res, next) => {
   
    const busboy =  Busboy({ headers: req.headers });

    busboy.on('file', (fieldname, file, info) => {
        const { filename, encoding, mimeType } = info;
        console.log(`Receiving file: ${filename}`);

        // Upload the file stream directly to MinIO
        minioClient.putObject(bucketName, filename, file, { 'Content-Type': mimeType }, async(err, etag) => {
            if (err) {
                console.error('Upload error:', err);
                return res.status(500).send('Upload failed');
            }
            console.log('Video has been sent to MinIO');
///////////////////////////////////////////////////////////////////////////////////
            // Send event to Kafka after the file upload is complete
  
            const producer=kafka.producer();
            await producer.connect()
            console.log("connected to producer!")
        
            const eventData = {
                filename: filename,
                bucket: bucketName,
                mimetype: mimeType,
            };

           await producer.send({
                "topic": 'video',
                "messages": [
                    {
                        "value": JSON.stringify(eventData),
                    },
                ],
            })
            .then(() => {
                console.log('Message sent successfully to Kafka brokers');
                res.status(200).send('Upload successful and event sent');
            })
            .catch((error) => {
                console.error('Kafka send error:', error);
                res.status(500).send('Failed to notify Kafka');
            });
            console.log("DONE")
            await producer.disconnect();
    ////////////////////////////////////////////////////////////////////////////////
        });
    });

    // Pipe the incoming request to Busboy
    req.pipe(busboy);
});



module.exports={
    upload
}



