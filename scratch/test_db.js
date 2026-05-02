const mongoose = require('mongoose');
const dburl = "mongodb+srv://careersteja9_db_user:JRTIJ0LDehbH1lNq@cluster0.yksf2jf.mongodb.net/?appName=Cluster0";

mongoose.connect(dburl)
  .then(() => {
    console.log("SUCCESS: Connected to MongoDB Atlas");
    process.exit(0);
  })
  .catch((err) => {
    console.error("FAILURE: Could not connect to MongoDB Atlas");
    console.error(err);
    process.exit(1);
  });
