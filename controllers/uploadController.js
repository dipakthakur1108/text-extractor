require('dotenv').config()
const multer = require("multer")
const   path  =require( "path");
const fs = require('fs');
const async =require("async")
const createReadStream = require('fs').createReadStream
const sleep = require('util').promisify(setTimeout);
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;
const ejs = require("ejs");
var data;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });
   
  const imageFilter = function (req, file, cb) {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"||
      file.mimetype == "image/gif" 
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg, .gif and .jpeg format allowed!"));
    }
  };
  var upload = multer({ storage: storage, fileFilter: imageFilter });

  const key = process.env.KEY;
  const endpoint = process.env.ENDPOINT;
  
  const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } }), endpoint);

  const uploadController = (req,res)=>{
    
   
    /**
     * END - Authenticate
     */
    
   function computerVision() {
       async.series([
         async function () {
     
           /**
            * OCR: READ PRINTED & HANDWRITTEN TEXT WITH THE READ API
            * Extracts text from images using OCR (optical character recognition).
            */
           console.log('-------------------------------------------------');
           console.log('READ PRINTED, HANDWRITTEN TEXT AND PDF');
           console.log();
           
           // URL images containing printed and/or handwritten text. 
           // The URL can point to image files (.jpg/.png/.bmp) or multi-page files (.pdf, .tiff).
           const printedTextSampleURL = "./"+req.file.path;
     
           // Recognize text in printed image from a URL
           //console.log('Read printed text from URL...', printedTextSampleURL.split('/').pop());
           const printedResult = await readTextFromURL(computerVisionClient, printedTextSampleURL);
           printRecText(printedResult);
     
           // Perform read and await the result from URL
           async function readTextFromURL(client, url) {
             // To recognize text in a local image, replace client.read() with readTextInStream() as shown:
             let result = await client.readInStream(fs.readFileSync(url));
             // Operation ID is last path segment of operationLocation (a URL)
             let operation = result.operationLocation.split('/').slice(-1)[0];
     
             // Wait for read recognition to complete
             // result.status is initially undefined, since it's the result of read
             while (result.status !== "succeeded") { await sleep(1000); result = await client.getReadResult(operation); }
             return result.analyzeResult.readResults; // Return the first page of result. Replace [0] with the desired page if this is a multi-page file such as .pdf or .tiff.
           }
     
           // Prints all text from Read result
           function printRecText(readResults) {
             //console.log('Recognized text:');
             data=[]
             for (const page in readResults) {
               if (readResults.length > 1) {
                 console.log(`==== Page: ${page}`);
               }
               const result = readResults[page];
               if (result.lines.length) {
                 for (const line of result.lines) {
                 data=data+line.words.map(w => w.text).join(' ');
                 }
                
               }
               
               else { console.log('No recognized text.'); }
             }
             
           }
   
          //  console.log();
          //  console.log('-------------------------------------------------');
          //  console.log('End of quickstart.');
           res.render('index',{'text':data})
         
          
         },
         function () {
           return new Promise((resolve) => {
             resolve();
            // console.log(data);
           })
         }
       ], (err) => {
         throw (err);
       });
       
     }
     
      computerVision()
     //  console.log(data)
    
    }
   
module.exports = {upload,uploadController}