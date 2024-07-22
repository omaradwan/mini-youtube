const express=require("express");
const authRoute=require('./routes/auth')
const serviceRoute=require('./routes/service');

const {primarydb,replicadb}=require("./config/database")

primarydb.authenticate()
  .then(() => console.log('Connected to PostgreSQL primary'))
  .catch(err => console.error('Connection error primary', err.stack));

replicadb.authenticate()
  .then(() => console.log('Connected to PostgreSQL replica'))
  .catch(err => console.error('Connection error replica', err.stack));    

require('dotenv').config();
const app=express();


// for creation of tables
primarydb.sync({ force: false }) //Use { force: true } for development only
  .then(() => {
    console.log('Database & tables created!');
    app.use(express.json());
    app.use('/api/auth',authRoute)
    app.use('/api/service',serviceRoute)


    app.use((err, req, res, next) => {
      // console.error("An error occurred:", err.message);
      // Optionally, you can also send an error response to the client
      res.status(500).send(err.message);
    });

    app.listen(process.env.PORT,()=>{
      console.log("connected to server ...")
  })

})


