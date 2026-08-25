//stating point of your app
const express = require("express");

const app = express();

app.use("/app" , (req ,res )=>{
    res.send("Hello bhaioo")
})

app.listen(8080 , ()=> {
    console.log("Succesfully running on 3000...");
});

