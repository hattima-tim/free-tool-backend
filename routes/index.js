var express = require("express");
var router = express.Router();
const SitemapGenerator = require("sitemap-generator");
const fs = require("fs");
const { pipeline } = require("node:stream/promises");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();

async function getResponseFromAI(input, temperature, signal, req, next) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-1106",
        messages: [
          {
            role: "user",
            content: ` ${input}`,
          },
        ],
        temperature: temperature,
        stream: true,
      }),
      signal: signal,
    });

    return response;
  } catch (err) {
    if (err.name === "AbortError") {
      console.log("Fetch aborted");
    } else {
      console.log(err);
      next(err);
    }
  }
  req.on("close", () => {
    controller.abort();
  });
}

router.post("/", async function (req, res, next) {
  const controller = new AbortController();
  const signal = controller.signal;

  let response = await getResponseFromAI(
    req.body.input,
    req.body.temperature,
    signal,
    req,
    next
  );

  if (response.status === 429) {
    res.sendStatus(429);
  }

  response.body.pipe(res);
});

router.get('/',async function(req,res){
    res.send('Hello something!')
})

// router.post("/", async function (req, res, next) {
//   const writeStream = fs.createWriteStream("sitemap.txt", { flags: "a" });

//   const generator = SitemapGenerator(req.body.siteUrl, {
//     stripQuerystring: false,
//   });

//   generator.on("add", (url) => {
//     // Write the URL to the file
//     writeStream.write(url + "\n");

//     let readStream = fs.createReadStream("sitemap.txt");

//     readStream.on("data", (chunk) => {
//       res.write(chunk);
//     });

//     readStream.on("error", (err) => {
//       console.error(err);
//       return;
//     });
//   });

//   generator.on("error", (error) => {
//     const { code, message, url } = error;

//     if (code === 403) {
//       res
//         .status(403)
//         .json({ sitemap: "You are not allowed to access the sitemap" });
//       return;
//     }
//   });

//   generator.on("done", () => {
//     // this is done because removing the sitemap.txt means I have to create it again. But I did not find
//     // a way to create the file on time.
//     fs.truncate("sitemap.txt", 0, function () {
//       console.log("Done removing sitemap.txt content.");
//     });

//     try {
//       fs.unlinkSync("sitemap.xml");
//       console.log("sitemap.xml deleted successfully");
//     } catch (err) {
//       if (err.code === "ENOENT") {
//         res.status(404).send(err.code);
//       } else {
//         res.status(500).send(err.code);
//       }
//     }
//     res.end();
//   });

//   // start the crawler
//   generator.start();
// });
module.exports = router;
