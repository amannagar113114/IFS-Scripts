//'use strict';
//Initializing variables.
const screenshotBtn=document.getElementById("screenshot");
const img = document.getElementById("imgout");
const video = document.querySelector('#container video');
const canvas = document.createElement('canvas');

var dynamo_output = document.getElementById("dynamo_output");
var description = document.getElementById("description");
var treatment = document.getElementById("treatment");

//Function to call the disease prediction API
function api_call(ctx,bucket_name,key_name){
	//Createing payload required for API request
	var y = {data:'https://new-plant-disease-dataset.s3.us-east-2.amazonaws.com/output-model/pepperbellbacterialspot.jpg',
                test:'cool',
			bucket:bucket_name,
			key:key_name};
        y = JSON.stringify(y);
        console.log("Calling APIgateway");
		//CAlling the diseases prediction API
        var response = $.post("https://8vywkld5b1.execute-api.us-east-1.amazonaws.com/invokesagetest/predictdisease",y,function(data, status) {
			console.log(data);
			console.log(data.searchCode);
		//If -ve recognize  - couldn't recognize
		if (data.searchCode == 'N'){
		$('.output-prompt').css({
			'background-color': 'rgba(235, 235, 235, 0.5)'
		});
		dynamo_output.style.color="#000000";
		dynamo_output.innerHTML = "Couldn't recognize";
		setTimeout(ctx.entityData.Speech.playSpeech("Couldn't Recognize"));
			dynamo_output.style.display = "block";
			description.style.display = "none";
			treatment.style.display = "none";
		}
		//If +ve response
		else{
			//Check if leaf is healthy
			if (data.Disease == "HEALTHY"){
				$('.output-prompt').css({
					'background-color': 'rgba(43, 235, 38, 0.5)'
				});
				//Making block green and displaying message
				dynamo_output.style.color="#006400";
				strSpeechText = "Hurray! Your plant is healthy.";
				setTimeout(ctx.entityData.Speech.playSpeech(strSpeechText));
				dynamo_output.innerHTML=strSpeechText;
				dynamo_output.style.display = "block";
				description.style.display = "none";
				treatment.style.display = "none";
			}
			//If disease detected
			else{
				$('.output-prompt').css({
					'background-color': 'rgba(235, 43, 38, 0.5)'
				});
				//Making block red and displaying message
				dynamo_output.style.color="#ff0000";
				dynamo_output.innerHTML=data.Disease;
				description.innerHTML=data.Description;
				treatment.innerHTML=data.Treatment;
				//Calling polly to read the message
				strSpeechText = data.Disease + "<break time ='500ms'/>" + data.Description + "<break time='500ms'/>" +data.Treatment;
				setTimeout(ctx.entityData.Speech.playSpeech(strSpeechText));
				dynamo_output.style.display = "block";
				description.style.display = "block";
				treatment.style.display = "block";
			}
		}
		
    },"json");
}

//FUnction to take screenshot and upload to s3
function s3_upload(ctx) {
    // set width and height
    //console.log("hihi");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    // draw image
    canvas.getContext('2d').drawImage(video, 0, 0);
    //create a dataUrl
    let dataUrl = canvas.toDataURL('image/png');
    img.src = dataUrl;
	//console.log(dataUrl);
    // for downloading the image
    var hrefElement = document.createElement('a');
    hrefElement.href = dataUrl;
    document.body.append(hrefElement);
	
	/////////////////////////////////////
	//Uploading image to s3 with date added to name
	var d = new Date();
	//var file = new File([blob], 'aman_'+d+'.png', dataUrl);
	var fileName = 'aman_'+d+'.png';
	var albumName = "sumerian_uploads";
	var albumPhotosKey = encodeURIComponent(albumName) + "/";
	var photoKey = albumPhotosKey + fileName;
	//	 console.log(file);
	  // Use S3 ManagedUpload class as it supports multipart uploads
	  // 
	  // Capture the rendered canvas as a png
        canvas.toBlob(function(blob){
            let url = URL.createObjectURL(blob);

			var d = new Date();
			 var file = new File([blob], 'aman '+d+'.png', blob);
			console.log(file);
		  var fileName = file.name;
			 var albumName = "aman_path";
		  var albumPhotosKey = encodeURIComponent(albumName) + "/";

		  var photoKey = albumPhotosKey + fileName;
		 console.log(file);
		
	  // Use S3 ManagedUpload class as it supports multipart uploads
	  var upload = new AWS.S3.ManagedUpload({
		params: {
		  Bucket: "sumerian-apptest",
		  Key: photoKey,
		  Body: file
		}
	  });
		console.log("s3 path ", photoKey);
	  var promise = upload.promise();

	  promise.then(
		function(data) {
		  console.log("Successfully uploaded photo.");
		  //Calling the disease prediction using API
		   api_call(ctx,"sumerian-apptest",photoKey);
		  //viewAlbum(albumName);
		},
		function(err) {
			console.log("There was an error uploading your photo: ", err);
		  return console.log("There was an error uploading your photo: ", err.message);
		}
	  );
		});
			
}

// when user clicks on the
screenshotBtn.onclick = function() {
    // set width and height
    console.log("hihi");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    // draw image
    canvas.getContext('2d').drawImage(video, 0, 0);
    //create a dataUrl
    let dataUrl = canvas.toDataURL('image/png');
    img.src = dataUrl;
	//console.log(dataUrl);
    // for downloading the image
    var hrefElement = document.createElement('a');
    hrefElement.href = dataUrl;
    document.body.append(hrefElement);
	
	/////////////////////////////////////
	var d = new Date();
	//var file = new File([blob], 'aman_'+d+'.png', dataUrl);
	var fileName = 'aman_'+d+'.png';
	var albumName = "sumerian_uploads";
	var albumPhotosKey = encodeURIComponent(albumName) + "/";
	var photoKey = albumPhotosKey + fileName;
	//	 console.log(file);
	  // Use S3 ManagedUpload class as it supports multipart uploads
	  // 
	  // Capture the rendered canvas as a png
        canvas.toBlob(function(blob){
            let url = URL.createObjectURL(blob);

			var d = new Date();
			 var file = new File([blob], 'aman '+d+'.png', blob);
			console.log(file);
		  var fileName = file.name;
			 var albumName = "aman_path";
		  var albumPhotosKey = encodeURIComponent(albumName) + "/";

		  var photoKey = albumPhotosKey + fileName;
		 console.log(file);
		// Use S3 ManagedUpload class as it supports multipart uploads
	  var upload = new AWS.S3.ManagedUpload({
		params: {
		  Bucket: "sumerian-apptest",
		  Key: photoKey,
		  Body: file
		}
	  });
		console.log("s3 path ", photoKey);
	  var promise = upload.promise();

	  promise.then(
		function(data) {
		  console.log("Successfully uploaded photo.");
			api_call("sumerian-apptest",photoKey);
		  //viewAlbum(albumName);
		},
		function(err) {
			console.log("There was an error uploading your photo: ", err);
		  return console.log("There was an error uploading your photo: ", err.message);
		}
	  );
		});
			
};


// // Called when play mode starts
let timerId = null;
async function setup(args, ctx) {
	// Cache a reference to the RenderSystem and HTML image element
	// Displaying only the description block
	dynamo_output.style.display = "none";
	description.style.display = "block";
	treatment.style.display = "none";
    ctx.rendersystem = ctx.world.getSystem('RenderSystem');
	description.innerHTML = "Welcome!";
	await sleep(2000);
	description.innerHTML = "";
	var y = {data:'Testing'};
	y = JSON.stringify(y);
	console.log("CAlling");
	description.style.display = "none";
	
	//Calling APi for weather prediction
	var response = $.post("https://7e5cfl9exg.execute-api.us-east-1.amazonaws.com/deploy1/getweather",y,function(data, status) {
		var text = "Avg Temp:"+data.Average_Temperature+"<br>Avg Humidity:"+data.Average_Humidity;
		dynamo_output.innerHTML = "Average forecasted temparature and humidity for the coming week.";
		description.innerHTML = text;
		treatment.innerHTML = data.Predicted_Disease+" could probably affect your crop.";
		treatment.style.color="#ff0000";
		//Displaying forecasted weather and diseases predicted
		dynamo_output.style.display = "block";
		description.style.display = "block";
		treatment.style.display = "block";
    },"json");
	await sleep(10000);
	//Displaying Scanning.. message
	dynamo_output.style.display = "none";
	description.style.display = "none";
	treatment.style.display = "none";
	treatment.style.color="#000000";
	description.innerHTML = "Scanning...";
	description.style.display = "block";
// 	api_call(ctx,'bucket_name','key_name');
// 	Calling the s3_upload every 3s to take screenshit
	let i =1;
	timerId = setInterval(function() {
	  console.log('tick'+i++);
		s3_upload(ctx);
	}, 3000);
}





// Called when play mode stops
function cleanup(args, ctx) {
//const html2canvas = require('html2canvas');
    // Close the webCam media stream
    clearInterval(timerId);

    if(ctx.mediaStream) {

       ctx.mediaStream.getTracks()[0].stop();

}
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

