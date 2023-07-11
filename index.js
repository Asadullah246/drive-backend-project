const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const multer = require("multer");
const app = express();
const path = require("path");

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    // Generate a unique name for the file
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);

    // Get the file extension
    const ext = path.extname(file.originalname);

    // Create the final filename with the extension
    const filename = uniqueName + ext;
    const relativePath = "uploads/" + filename;

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
    const memberCollection = db.collection("member");

    // member

    app.get("/member", async (req, res) => {
      const blogs = await memberCollection.find({}).toArray();
      res.send(blogs);
      // console.log(blogs);
    });
    app.get("/member/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email:email };
      const newBlog = await memberCollection.findOne(query);
      res.send(newBlog);
    });



    app.post("/member", async (req, res) => {
      const body = req.body;
      // console.log("b", body);
      const newBlog = await memberCollection.insertOne(body);
      res.send(newBlog);
    });

    app.delete("/member/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await memberCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/member/:id", async (req, res) => {
      const body = req.body;
      // console.log("body", body);
      const id = req.params.id;
      console.log("id", id);
      const query = { _id: new ObjectId(id) };
      const updatedData = {
        $set: body,
      };
      const newBlog = await memberCollection.updateOne(query, updatedData);
      res.send(newBlog);
      // console.log(newBlog);
    });

    // end member



    // app.get('/uploads/:filename', (req, res) => {
    //   const filePath = `/uploads/${req.params.filename}`;

    //   res.setHeader('Content-Disposition', `attachment; filename=${req.params.filename}`);
    //   res.sendFile(filePath);
    // });

    app.get('/uploads/:filename', (req, res) => {
      const filename = req.params.filename;
      const filePath = path.join(__dirname, 'uploads/', filename);

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.sendFile(filePath);
    });

    app.get("/files", async (req, res) => {
      const blogs = await filesCollection.find({}).toArray();
      res.send(blogs);
      // console.log(blogs);
    });
    app.get("/files/:email", async (req, res) => {
      const email=req.params.email;
      const query = { uploader_email: email }

      const blogs = await filesCollection.find(query).toArray();
      res.send(blogs);
      // console.log(blogs);
    });
    app.get("/files/single/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await filesCollection.findOne(query);
      res.send(result);
      // console.log(blogs);
    });

    app.put("/files/rating/:id", async (req, res) => {
      const body = req.body;
      const id = req.params.id;
      console.log("b", body);
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const getMem = await filesCollection.findOne(query);
      console.log("getmem", getMem);

      if (!Array.isArray(getMem.reviews)) {
        getMem.reviews = []; // Initialize reviews as an empty array if it's not already an array
      }

      const updatedData = {
        $set: {
          reviews: [...getMem?.reviews, body],
        },
      };

      const newBlog = await filesCollection.updateOne(
        query,
        updatedData,
        options
      );
      res.send(newBlog);
    });

    app.patch("/files/:id", async (req, res) => {
      const body = req.body;
      // console.log("body", body);
      const id = req.params.id;
      console.log("id", id);
      const query = { _id: new ObjectId(id) };
      const updatedData = {
        $set: body,
      };
      const newBlog = await filesCollection.updateOne(query, updatedData);
      res.send(newBlog);
      // console.log(newBlog);
    });

    app.put("/files/:id", async (req, res) => {
      const body = req.body;
      // console.log("body", body);
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      // const getMem = await memberCollection.findOne(query);
      // console.log("getmem", getMem);

      // if (!Array.isArray(getMem.reviews)) {
      //   getMem.reviews = []; // Initialize reviews as an empty array if it's not already an array
      // }
      const updatedData = {
        $set: body,
      };


      const result = await filesCollection.updateOne(
        query,
        updatedData,
        options
      );
      res.send(result);
      // console.log(newBlog);
    }); 

    app.delete("/files/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await filesCollection.deleteOne(query);
      res.send(result);
    });


    // upload.array("files", 5)

    app.post(
      "/files",
      upload.fields([
        { name: "thumb", maxCount: 1 },
        { name: "files", maxCount: 5 },
      ]),
      async (req, res) => {
        // const files = req.files;
        const {
          l_subject,
          desc,
          uploader_name,
          uploader_email,
          price,
          sub_sub_category,
          sub_category,
          category,
          doc_name,
          status
        } = req.body;

        // if (!files) {
        //   return res.status(400).json({ message: "Missing required files" });
        // }

        const thumb = req.files["thumb"] ? req.files["thumb"][0] : null;
        const multipleFiles = req.files["files"] || [];

        // Process the singleFile and multipleFiles as needed
        const singleFilePath = thumb ? "uploads/" + thumb.filename : null;
        const multipleFilePaths = multipleFiles.map(
          (file) => "uploads/" + file.filename
        );

        const newProduct = {
          l_subject,
          desc,
          uploader_name,
          uploader_email,
          price,
          sub_sub_category,
          sub_category,
          category,
          doc_name,
          status,
          files: multipleFilePaths,
          thumb: singleFilePath,
        };

        const newBlog = await filesCollection.insertOne(newProduct);
        res.send(newBlog);
      }
    );

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
