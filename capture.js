var http = require("http");
var fs = require("fs");

http.createServer(function (req, res) {
  var idx = req.url.split("/")[1];
  var filename = "capture/" + ("0000" + idx).slice(-5) + ".png";
  var img = "";

  req.on("data", function (chunk) {
    img += chunk;
  });
  req.on("end", function () {
    f = fs.writeFileSync(filename, Buffer(img));
    res.end();
  });
  console.log("Wrote file: " + filename);
}).listen(1337, "127.0.0.1");
console.log("Capture running at 127.0.0.1:1337")
