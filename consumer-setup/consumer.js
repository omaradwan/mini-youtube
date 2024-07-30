const{Kafka }=require('kafkajs')
const minio=require('minio')
const ffmpeg = require('fluent-ffmpeg');
const fs=require('fs');
const path = require('path');
const Video=require('./video');



const kafka = new Kafka ({
    clientId: 'kafkajs',
    brokers: process.env.KAFKA_BROKER.split(',') // Use the brokers from environment variable
});

const minioClient = new minio.Client({
  endPoint: "minio",
  port: 9000,
  useSSL: false,
  accessKey: "storedObject",
  secretKey: "CHANGEME123"
});



const consumer=kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID });

const run = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: true });
  
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log({
        //  key: message.key.toString(),
          value: message.value.toString()
        });
        const videoData = JSON.parse(message.value.toString());
        const { bucket, filename,title,description,userId } = videoData;
        console.log("DDD",bucket,filename)
        // Download the video from the object store buffer
        const inputPath = `/tmp/${filename}`;
        const fileStream = fs.createWriteStream(inputPath);// create a write stream so chunks can be written in it and it will be stored locally for a time
                                                           // with name input path

        minioClient.getObject(bucket,filename,(err,dataStream)=>{//dataStream is instance of readable stream created by minio when getObject is called
              if (err) {                                         // so the callback function will be called when this readable stream is ready and for every chunk came it will emit event and write it in writable stream in .pipe function
              console.error('Error getting object from MinIO:', err);
              return;
              }
              dataStream.pipe(fileStream);// when chunk came from get object then dataStream.pipe will  write it in filestream

              dataStream.on('end', async () => {
                try {
                  console.log("encoding...")
                  const encodedVersions = await encodeVideo(inputPath, filename);

                  // Upload the encoded versions to the object store
                  console.log("ready to send to object store...")
                  for (const version of encodedVersions) {
                    const versionStream = fs.createReadStream(version.path);// generate readable stream to use it in putobject so encoded videos will be sent to minio as chunks which improve efficiency
                    const versionBucket = 'videostore'
                    
                    await minioClient.putObject(versionBucket, version.name, versionStream, (err) => {
                      if (err) {
                        console.error('Error uploading encoded video to MinIO:', err);
                      } else {
                        console.log(`Uploaded ${version.name} to ${versionBucket} successfully`);
                       
                      }
                    });
                    try{
                      SaveInDB(version.name,title,description,userId);
                      console.log("saved in db successfully")
                    }catch(err){
                      console.log("can not save in db")
                    }
                    //delete the local encoded video file
                    fs.unlinkSync(version.path);
                  }

                  // Delete the original video from the buffer
                  await minioClient.removeObject(bucket, filename, (err) => {
                    if (err) {
                      console.error('Error deleting original video from MinIO:', err);
                    } else {
                      console.log(`Deleted ${filename} from ${bucket} successfully`);
                    }
                  });

                  // delete the local original video file
                  fs.unlinkSync(inputPath);

                } catch (error) {
                  console.error('Error processing video:', error);
                }
              });
              dataStream.on('error', (err) => {
                console.error('Error streaming video from MinIO:', err);
              });
              
        })

      },


    });
  };
  
  run().catch(console.error);


const encodeVideo=(inputPath, originalFilename)=>{
    const versions = [
    { name: `${originalFilename}-480p.mp4`, resolution: '640x480' },
    { name: `${originalFilename}-720p.mp4`, resolution: '1280x720' },
    { name: `${originalFilename}-1080p.mp4`, resolution: '1920x1080' }
  ];

  return Promise.all(versions.map(version => {//will return single promise and will be resolved if all versions were resolved otherwise reject
    const outputPath = path.join('/tmp', version.name);

    return new Promise((resolve, reject) => {// will open many process to encode the video to diff versions in parallel and for each version return resolve or reject
      ffmpeg(inputPath)
        .size(version.resolution)
        .output(outputPath)
        .on('end', () => resolve({ name: version.name, path: outputPath }))
        .on('error', reject)
        .run();
    });
  }));
}

const SaveInDB=async(url,title,description,userId)=>{
 try{ 
  const newVideo=new Video({
    url,
    title,
    description,
    userId
  })
  await newVideo.save();
}catch(err){
  console.log("saving in vide DB" ,err);
}
  
}

