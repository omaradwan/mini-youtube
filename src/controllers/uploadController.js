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
    clientId: 'kafkajs',
    brokers: ['localhost:9096']
})

const producer=kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner
});

const startProducer = async () => {
    await producer.connect();
    console.log('Kafka producer is connected');
  };
  
startProducer().catch(console.error);

const bucketName="videobuffer"

const upload = asyncHandler(async (req, res, next) => {
   
    const busboy =  Busboy({ headers: req.headers });

    busboy.on('file', (fieldname, file, info) => {
        const { filename, encoding, mimeType } = info;
        console.log(`Receiving file: ${filename}`);

        // Upload the file stream directly to MinIO
        minioClient.putObject(bucketName, filename, file, { 'Content-Type': mimeType }, (err, etag) => {
            if (err) {
                console.error('Upload error:', err);
                return res.status(500).send('Upload failed');
            }
            console.log('Video has been sent to MinIO');

            // Send event to Kafka after the file upload is complete
            const eventData = {
                filename: filename,
                bucket: bucketName,
                mimetype: mimeType,
            };

            producer.send({
                topic: 'uploadVideo',
                messages: [
                    {
                        value: JSON.stringify(eventData),
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
        });
    });

    // Pipe the incoming request to Busboy
    req.pipe(busboy);
});



module.exports={
    upload
}



