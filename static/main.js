
var x = document.getElementById("geoloc");
var loc = document.getElementById("loc");
var uploadspan = document.getElementById("goforit");
var spinspan = document.getElementById("spinnerspan");


function isUploadSupported() {
    if (navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) {
    	x.innerHTML += "This browser does not support file upload.<br>"
        return false;
    }
    var elem = document.createElement('input');
    elem.type = 'file';
    return !elem.disabled;
};


// Get geolocation coordinates

var getCurrentPosition = function () {
  if (navigator.geolocation) {
    return new Promise(
      (resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject)
    )
  } else {
    return new Promise(
      resolve => resolve({})
    )
  }
}

function showPosition(position) {
  x.innerHTML = "Latitude: " + parseFloat(position.coords.latitude).toFixed(1) + 
  "\nLongitude: " + parseFloat(position.coords.longitude).toFixed(1);
  loc.style.display = "inline";
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      x.innerHTML = "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      x.innerHTML = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      x.innerHTML = "The request to get user location timed out."
      break;
    case error.UNKNOWN_ERROR:
      x.innerHTML = "An unknown error occurred."
      break;
  }
}

function geoLocButtonClick() {
	getCurrentPosition()
	.then((position) => {
	  if (position.coords) {
	    showPosition(position);
	  } else {
	    x.innerHTML += "This browser does not support geolocation.<br>";
	  }
	})
	.catch((error) => {
		showError(error);
	});
}

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

// Image input button
function resizeifneeded(files) {
	var file = files[0];
	if (file) {
		if (/^image\//i.test(file.type)) {
			readFile(file)
			.then( (newFile) => {
				sessionStorage.setItem("imgDataURL", newFile);
				spinspan.innerHTML = "";
			})
			.catch( (error) => {
				spinspan.innerHTML = "There was an error reading the file";
			});

		} else {
			alert('Not a valid image!');
		}
	}
};

// Form submit button
function submitImage() {
	let img = sessionStorage.getItem("imgDataURL");
	let geoLocation = x.innerHTML;
	sendFile(dataURItoBlob(img), geoLocation);
}

function readFile(file) {
	return new Promise(function(resolve, reject) {
		var reader = new FileReader();

		reader.onloadend = function () {
			spinspan.innerHTML = '<img src="spinner.gif" width="70" height="50"></img>';
			resolve(processFile(reader.result, file.type));
		}

		reader.onerror = function () {
			reject("");
		}

		reader.readAsDataURL(file);
		spinspan.innerHTML = '<img src="spinner.gif" width="70" height="50"></img>';
	});
}


// resize

function processFile(dataURL, fileType) {

	return new Promise(function(resolve, reject) {

		var maxWidth = 200;
		var maxHeight = 200;

		var image = new Image();
		image.src = dataURL;

		image.onload = function () {
			var width = image.width;
			var height = image.height;
			var shouldResize = (width > maxWidth) || (height > maxHeight);

			var img = this;

			if (!shouldResize) {
				uploadspan.style.display = "inline";
				resolve(dataURL);
			}
			else {
				shrinkFile(img, width, height, maxWidth, maxHeight, fileType)
				.then( function(dataURL) {
					uploadspan.style.display = "inline";
					resolve(dataURL);
				})
				.catch( function(e) {
					console.error(e);
					reject("");
				});
			}

		};

		image.onerror = function (e) {
			console.trace(e);
			alert('There was an error processing your file!');
		};

	});
}

function shrinkFile(img, width, height, maxWidth, maxHeight, fileType) {

	return new Promise(function(resolve, reject) {

		var newWidth;
		var newHeight;

		if (width > height) {
			newHeight = height * (maxWidth / width);
			newWidth = maxWidth;
		} else {
			newWidth = width * (maxHeight / height);
			newHeight = maxHeight;
		}

		var canvas = document.createElement('canvas');

		canvas.width = newWidth;
		canvas.height = newHeight;

		var context = canvas.getContext('2d');

		context.drawImage(img, 0, 0, newWidth, newHeight);

		dataURL = canvas.toDataURL(fileType);

		resolve(dataURL);

	});

}


// upload from client to destination

function sendFile(fileData, geoLocation) {
	let fm1 = document.getElementById("fm1");
	// var formData = new FormData(fm1);
	formData.append('geoLocation', geoLocation);
	formData.append('file2', fileData);

	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (this.readyState < 4) {
			spinspan.innerHTML = '<img src="spinner.gif" width="70" height="50"></img>';
		}
		if (this.readyState == 4 && this.status == 200) {
		   	spinspan.innerHTML = "";
		}
	};
	request.open("POST", "/", true);
	request.send(formData);
}