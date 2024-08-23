const asyncHandler=require('express-async-handler')
const minio=require('minio')
const Busboy=require('busboy')
const {Kafka}=require('kafkajs')
const User=require('../models/user');
const Video=require('../models/video')

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

const producer=kafka.producer({
  requestTimeout: 30000
});


 const bucketName="videobuffer"

 const upload = asyncHandler(async (req, res, next) => {
  
   
    //  need to check that this user has already an account
    if(!req.isAuth){
      throw new Error("not authenticated")
    }
    let userId=req.userId;
     

    const busboy =  Busboy({ headers: req.headers });// know the header of the file to know how it will parse it
    const formData={};
    formData["userId"]=userId;
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


const watch=asyncHandler(async(req,res,next)=>{
       if(!req.isAuth){
         throw new Error("not authenticated")
       }
       let userId=req.userId;
       const result={err:[],status:"successfull"};  
       const {url,quality}=req.body;
      
      //  const checkUser=await User.findByPk(userId)
      //  if(!checkUser){
      //       result.err.push("invalid user id");
      //       result.status='failed';
      //       return res.status(400).json(result);
      //  }
      
       const video=await Video.findOne({
        where:{
          url:url
        }
       })
       if(!video){
        result.err.push("invalid video url")
        result.status="failed"
        return res.status(400).json(result);
       }
       let bucket="videostore";
       let newUrl=`${url}-${quality}.mp4`;
       console.log(newUrl)
       try{
         const statObject=await minioClient.statObject(bucket,newUrl);
         const fileSize=statObject.size;
         const ContentType='video/mp4'
        console.log(ContentType)
        res.writeHead(200,{
          'Content-Length': fileSize,
          'content-Type': ContentType,
        })

        minioClient.getObject(bucket,newUrl,(err,stream)=>{
          if (err) {
            return res.status(500).send(err);
          }
          stream.pipe(res);
          stream.on('end',()=>{
            console.log("video has sent successfully")
          })

        })
       }catch (err) {
        res.status(500).send(err.message);
      }

})
module.exports={
    upload,
    watch
}




