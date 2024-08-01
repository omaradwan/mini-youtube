const express=require("express");
const authRoute=require('./routes/auth')
const serviceRoute=require('./routes/service');
const uploadRoute=require('./routes/upload')
const {primarydb}=require('./config/database')
const comment=require('./models/comments');
const like=require('./models/like');
const sub=require('./models/subscription');
const user=require('./models/user');
const video=require('./models/video');
const watchL=require('./models/watchLater')

// const {primarydb,replicadb}=require("./config/database")

// primarydb.authenticate()
//   .then(() => console.log('Connected to PostgreSQL primary'))
//   .catch(err => console.error('Connection error primary', err.stack));

// replicadb.authenticate()
//   .then(() => console.log('Connected to PostgreSQL replica'))
//   .catch(err => console.error('Connection error replica', err.stack));    

require('dotenv').config();
const app=express();



const syncDatabase = async () => {

  if (process.env.NODE_APP_HANDLE_DB_INIT !== 'true') {
    console.log('Skipping database setup.');
    return;
  }
  try {
      // Sync all models with the database
      await primarydb.sync({ force: true }); // Use { force: true } only in development
      
      console.log('Database & tables created!');
  } catch (error) {
      console.error('Error creating database tables:', error);

  }
};
// syncDatabase();
// for creation of tables
// primarydb.sync({ force: true }) //Use { force: true } for development only
//   .then(() => {

//     console.log('Database & tables created!!!');
  

    
   
//     app.use(express.json());
//     app.use('/api/service',serviceRoute)
//     app.use('/api/auth',authRoute)
//     app.use('/api/video',uploadRoute)


//     app.use((err, req, res, next) => {
//       // console.error("An error occurred:", err.message);
//       // Optionally, you can also send an error response to the client
//       res.status(500).send(err.message);
//     });
   
//     app.listen(8000,'0.0.0.0',()=>{
//       console.log("connected to server ..")
//     })
    

// })


app.use(express.json());
app.use('/api/service',serviceRoute)
app.use('/api/auth',authRoute)
app.use('/api/video',uploadRoute)
app.get('/', (req, res) => {
  res.send(`Response from ${process.env.PORT}`);
});

app.use((err, req, res, next) => {
  // console.error("An error occurred:", err.message);
  // Optionally, you can also send an error response to the client
  res.status(500).send(err.message);
});

app.listen(8000,'0.0.0.0',()=>{
  console.log("connected to server ..",process.env.PORT)
})










