const express=require("express");
const authRoute=require('./routes/auth')
const serviceRoute=require('./routes/service');
const uploadRoute=require('./routes/upload')

const {primarydb,replicadb}=require("./config/database")

primarydb.authenticate()
  .then(() => console.log('Connected to PostgreSQL primary'))
  .catch(err => console.error('Connection error primary', err.stack));

replicadb.authenticate()
  .then(() => console.log('Connected to PostgreSQL replica'))
  .catch(err => console.error('Connection error replica', err.stack));    

require('dotenv').config();
const app=express();


app.use(express.json());
app.use('/api/auth',authRoute)
// for creation of tables
primarydb.sync({ force: true }) //Use { force: true } for development only
  .then(() => {

    console.log('Database & tables created!!!');
  
    // app.use('/api/service',serviceRoute)
    
   
    
    app.use('/api/video',uploadRoute)


    app.use((err, req, res, next) => {
      // console.error("An error occurred:", err.message);
      // Optionally, you can also send an error response to the client
      res.status(500).send(err.message);
    });

  

})

app.post('/api/service/subscribe', (req, res) => {
  // Handle the request
  console.log("yarb")
  res.send('Subscription received');
});
app.listen(8000,'0.0.0.0',()=>{
  console.log("connected to server ..")
})



