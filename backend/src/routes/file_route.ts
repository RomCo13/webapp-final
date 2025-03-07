import express from "express";
const router = express.Router();
import multer from "multer";

// const base = "http://" + process.env.DOMAIN_BASE + ":" + process.env.PORT + "/";
const base = "http://localhost:3000/";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/')
    },
    filename: function (req, file, cb) {
        // Get the post ID from URL parameters
        const postId = req.params.postId;
        
        // Extract the extension from the original file
        const ext = file.originalname.split('.')
            .filter(Boolean) // removes empty extensions (e.g. `filename...txt`)
            .slice(1)
            .join('.')
        
        // Use the post ID as filename if available, otherwise use timestamp
        const filename = postId ? `${postId}.${ext}` : `${Date.now()}.${ext}`;
        cb(null, filename);
    }
})
const upload = multer({ storage: storage });

// Standard file upload route
router.post('/', upload.single("file"), function (req, res) {
    console.log("router.post(/file: " + base + req.file.path)
    res.status(200).send({ url: base + req.file.path })
});

// New route specifically for post image uploads
router.post('/:postId', upload.single("file"), function (req, res) {
    console.log("Uploading file for post:", req.params.postId);
    console.log("File path:", base + req.file.path);
    res.status(200).send({ url: base + req.file.path })
});

export = router;
