
// Include all required libraries.

const express =require('express')
const jwt = require('jsonwebtoken')
const jsonpatch = require('fast-json-patch')
const multer =require('multer')
const path =require('path')
const bodyParser = require('body-parser');
const { applyOperation } = require('fast-json-patch');
var gm = require('gm').subClass({imageMagick: true});

const app = express();  // app define .	
app.use(express.static('./public')) // public folder stores all the uploaded and resized images and hence static.
app.use(bodyParser.json()); // We have to parse some json queries too .

var imagePath = path.join(__dirname + '/public/uploads/'); // default path for a image.
var defPath =imagePath;
var imageName="";

// Here we have created our storage which saves how the images should be saved.
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
  	const date =Date.now()
  	imageName =file.fieldname+'-'+date+path.extname(file.originalname);
  	imagePath =imagePath+file.fieldname+'-'+date+path.extname(file.originalname);
    cb(null,file.fieldname + '-' + date + path.extname(file.originalname));
  }
});
// Here we have created a multer object which would accept storage and the image file.
const upload = multer({
  storage: storage,
}).single('myImage');

// To handle pathData requests.
// Defined to handle post requests only.
// Takes input a json object containing json document and patch.
app.post('/api/patchData',isToken,function(req,res){
	// First we have to verify if user have a login token or not.
	jwt.verify(req.token,'secretkey',function(err,data){
		if(err){
			res.send('Login Required');
		}
		else{
			// Retrives document and patch from the json provided by the user.
			var document =req.body.document
			var patch1 =(req.body.patch)
			// Since the patch function accepts patch as a array of json. 
			// We have to convert the patch1 json object to a json array. 
			var patch =[]
			for(var i in patch1){
				patch.push(patch1[i]);
			}
			//document1 will store the patched document. 
			// Please refer   https://www.npmjs.com/package/fast-json-patch  for documentation.
			document1 = jsonpatch.applyPatch(document, patch).newDocument;
			console.log(document1)
			res.json({
				message:'New Patched Document',
				document1
			});
		}
	});
});

// To handle the image resize requests .
// Takes input a image to be resized.
app.post('/api/resize',isToken,function(req,res){
	// First we have to verify if user have a login token or not.
	jwt.verify(req.token,'secretkey',function(err,data){
		if(err){
			res.send('Sorry bro ! Maybe next time.. ');
		}
		else{
		// If user have token then we will call our upload function to download the image to the server. 
			 upload(req, res, (err) => {
			    if(err){
				    res.send(err);
			    } else {
			      if(req.file == undefined){
			      	res.send('Select image');
			      } else{
			      		// Please refer http://aheckmann.github.io/gm/docs.html for documentation.
						gm(imagePath)
						.resize(50,50)
						.write('./public/resized/ rdsdsdsadesized'+imageName, function (err) {
						    if( err ) res.send(err)	;
						});
						// imagePath has to be reseted to default path for next query.
						imagePath=defPath;
						res.send('Uploaded');
			      }
			    }
			});

		}
	});
});

// To handle login requests.
// Since it is a prototype this function accepts any random user and pass.
app.post('/api/login',function(req,res){
	const user = {
		username :'RickC-137',
		password :'morty'
	}
	// Refer https://www.npmjs.com/package/jsonwebtoken for documentation. 
	// jwt.sign returns a json web token for user verification.
	jwt.sign({user},'secretkey',function(err, token){
		if(err){
			res.json({
				message:'Some Error'
			});
		}
		res.json({
			token
		});
	});
});
// This function checks whether the request has a token or not
// If yes then returns the token. 
function isToken(req,res,next){
	// Token is passed in the authorizartion tag.
	const token =req.headers['authorization'];
	if(typeof token =='undefined'){
		res.send('Trying to be smart buddy.. ');
	}
	else{
		tokenvalue=token.split(' ');
		req.token=tokenvalue[1];
		next();
	}
}
// Stareted the app on a localhost at port 5000 
app.listen(5000,function(){
	console.log('Server on')
}); 