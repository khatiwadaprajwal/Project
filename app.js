const express = require('express');
const app = express();
require('./config/mongoconfig');

const PORT = process.env.PORT || 3000;



// Express setup
app.use(express.json());

//routes connected
//const routes = require("./routes/index")
//app.use("/v1",routes)

// Routes
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(3001,"localhost",(err)=>{
    if(err){
        console.log("Server Error")
    }
    else{
        console.log("Server connected to port 3001")
        console.log("Press Ctrl + C to end the connection")
    }
})