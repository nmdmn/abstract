var http = require("http");
var fs = require("fs");

var BASE64_MARKER = ';base64,';

function convertDataURIToBinary(dataURI) {
  var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  var base64 = dataURI.substring(base64Index);
  var raw = atob(base64);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for (i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}

http.createServer(function (req, res) {
  var idx = req.url.split("/")[1];
  var filename = "capture/" + ("0000" + idx).slice(-5) + ".png";
  var img = "";

  req.on("data", function (chunk) {
    img += chunk;
  });
  req.on("end", function () {
    f = fs.writeFileSync(filename, Buffer(convertDataURIToBinary(img)));
    res.end();
  });
  console.log("Wrote file: " + filename);
}).listen(2345, "127.0.0.1");
console.log("Capture running at 127.0.0.1:2345")
