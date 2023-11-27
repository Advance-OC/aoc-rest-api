const multer = require("multer");
const {
	getOverlayData,
	addOverlayData,
	getOverlayByType,
} = require("./controller");

const router = require("express").Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", getOverlayData);
router.get("/:type", getOverlayByType);
router.post("/", upload.single("file"), addOverlayData);

module.exports = router;
