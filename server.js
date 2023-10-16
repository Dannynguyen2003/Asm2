const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;

const connectionString =
  "mongodb+srv://anhtdgcs210304:taoladucanh27@cluster0.muox7i3.mongodb.net/";

MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to Database");

    const db = client.db("test");
    const productsCollection = db.collection("products");

    app.set("view engine", "ejs");
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static("public"));
    app.use(bodyParser.json());

    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "public/images");
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
      },
    });

    const upload = multer({ storage: storage });
    function fetchProductById(productId) {
      const objectId = new ObjectID(productId);

      return productsCollection
        .findOne({ _id: objectId })
        .then((product) => {
          return product;
        })
        .catch((error) => {
          console.error("Error fetching product by ID:", error);
          return null;
        });
    }
    app.get("/", (req, res) => {
      db.collection("products")
        .find()
        .toArray()
        .then((results) => {
          res.render("index.ejs", { products: results });
        })
        .catch();
    });

    app.get("/add-product", (req, res) => {
      const errorMessage = "";
      res.render("add-product.ejs", { errorMessage });
    });

    app.post('/add-product', upload.single('image'), (req, res) => {
      const { product_name, description, price, quantity, category_id, status } = req.body;
    
      if (!product_name || !description || isNaN(price) || isNaN(quantity)) {
        const errorMessage = "Invalid input data";
        res.render("add-product.ejs", { errorMessage });
        return;
      }
    
      const image = req.file ? req.file.filename : null; // Check if a file was uploaded
    
      productsCollection
        .insertOne({
          product_name,
          description,
          price: parseFloat(price),
          quantity: parseInt(quantity),
          image,
          category_id,
          status: parseInt(status)
        })
        .then((result) => {
          console.log("Product added successfully");
          res.redirect("/");
        })
        .catch((error) => {
          console.error("Error adding product:", error);
          res.status(500).send("Error adding product");
        });
    });

    app.get("/edit-products/:_id", (req, res) => {
      const productId = req.params._id;
      fetchProductById(productId).then((product) => {
        if (!product) {
          return res.status(404).send("Product not found");
        }
        res.render("edit-products.ejs", { product: product }); // Pass the product object to the template
      });
    });
    
    app.post("/update-product/:_id", async (req, res) => {
      const productId = req.params._id;
      const { product_name, description, price, quantity, category_id, status } = req.body;
    
      if (!product_name || !description || isNaN(price) || isNaN(quantity) || !category_id || !status) {
        const errorMessage = "Invalid input data";
        res.render("edit-products.ejs", { errorMessage });
        return;
      }
    
      const updatedProduct = {
        product_name,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        category_id: parseInt(category_id),
        status: parseInt(status),
      };
    
      if (req.file) {
        updatedProduct.image = req.file.filename;
      }
    
      try {
        await productsCollection.updateOne(
          { _id: ObjectID.createFromHexString(productId) },
          { $set: updatedProduct }
        );
    
        console.log("Product updated successfully");
        res.redirect("/");
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Error updating product");
      }
    });
    

    app.get("/delete-product/:_id", (req, res) => {
      const productId = req.params._id;
      productsCollection
        .deleteOne({ _id: new ObjectID(productId) })
        .then((result) => {
          console.log("Product deleted successfully");
          res.redirect("/");
        })
        .catch((error) => {
          console.error("Error deleting product:", error);
          res.status(500).send("Error deleting product");
        });
    });


    app.listen(3000, function () {
      console.log("Listening on port 3000");
    });
  })
  .catch((error) => console.error("MongoDB connection error:", error));