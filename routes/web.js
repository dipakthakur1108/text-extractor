const express =require("express");
const {uploadController,upload}  = require("../controllers/uploadController.js");

const router = express.Router();

router.get("/",(req,res)=>{
    res.render("index.ejs",{'text':" "})
})

router.post("/processimage", upload.single("file"), uploadController)

module.exports = router;

