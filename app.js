const dotenv = require("dotenv")
dotenv.config()

const express = require("express")
const ejs = require("ejs")
const { Server } = require("http")
const { join } = require("path")
const web = require( "./routes/web.js")

const app = express()

const port = process.env.PORT || '3000'

// static files
app.use('/',express.static(join(process.cwd(),'public')))

// set template engine

app.set("view engine",'ejs')

//load routes

app.use("/",web)

app.listen(port,()=>{
    console.log("server listening at $(port)")
})