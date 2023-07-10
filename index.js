const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const multer = require("multer");
const app = express();
const path = require('path')

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    // Generate a unique name for the file
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);

    // Get the file extension
    const ext = path.extname(file.originalname);

    // Create the final filename with the extension
    const filename = uniqueName + ext;
    const relativePath = 'uploads/' + filename;

    console.log("relativ", relativePath);

    cb(null, filename);
  },
});

const upload = multer({ storage: storage });
// const upload = multer({ dest: "uploads/" });

const uri =
  "mongodb+srv://asadm2258:eciPwezapztAaDFv@cluster0.lc9x2t1.mongodb.net/?retryWrites=true&w=majority";
// asadm2258
// eciPwezapztAaDFv

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const db = client.db("drive-storage");
    const filesCollection = db.collection("files");
    //   const catCollection = db.collection("category");

    app.get("/files", async (req, res) => {
      const blogs = await filesCollection.find({}).toArray();
      res.send(blogs);
      // console.log(blogs);
    });

    // upload.array("files", 5)

    app.post("/files", upload.fields([
      { name: 'thumb', maxCount: 1 },
      { name: 'files', maxCount: 5 },
    ]) , async (req, res) => {
      const files = req.files; 
      const {
        l_subject,
        desc,
        uploader_name,
        price,
        sub_sub_category,
        sub_category,
        category,
        doc_name,
      } = req.body;

      if (!files) {
        return res.status(400).json({ message: "Missing required files" });
      }


      const thumb = req.files['thumb'] ? req.files['thumb'][0] : null;
      const multipleFiles = req.files['files'] || [];

      // Process the singleFile and multipleFiles as needed
      const singleFilePath = thumb ? 'uploads/' + thumb.filename : null;
      const multipleFilePaths = multipleFiles.map(file => 'uploads/' + file.filename);


      const newProduct = {
        l_subject,
        desc,
        uploader_name,
        price,
        sub_sub_category,
        sub_category,
        category,
        doc_name,
        files:multipleFilePaths,
        thumb:singleFilePath
      };

      const newBlog = await filesCollection.insertOne(newProduct);
      res.send(newBlog);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("drive server is Running");
});

app.listen(port, () => {
  console.log(`drive server running on port: ${port}`);
});
