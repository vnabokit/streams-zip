import axios from "axios";
import fs from "fs";
import archiver from "archiver";

const fileUnzipped = "response.txt";
const fileZipped = "response_zipped.zip";
const url = "https://api.publicapis.org/entries";
let response;

try {
  response = await axios.request({
    method: "GET",
    url,
    responseType: "stream",
  });
} catch (err) {
  throw new Error(`Unable to get data from the ${url}`);
}

for await (let chunk of response.data) {
  fs.appendFile(
    fileUnzipped,
    Buffer.from(chunk, "base64").toString("ascii"),
    {},
    () => {}
  );
}

const output = fs.createWriteStream(fileZipped);
const archive = archiver("zip", {
  zlib: { level: 9 },
});

output.on("close", function () {
  console.log(archive.pointer() + " total bytes");
  console.log(
    "archiver has been finalized and the output file descriptor has closed."
  );
});

output.on("end", function () {
  console.log("Data has been drained");
});

archive.pipe(output);
archive.append(fs.createReadStream(fileUnzipped), { name: fileUnzipped });
archive.finalize();
