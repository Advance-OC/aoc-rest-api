const multer = require("multer");
const {
	getBaselayersByYear,
	getBaselayersByKey,
	getBaselayersDictionary,
	createBaselayersData,
	getBaselayers,
	deleteBaselayersByYear,
	getScorecardData,
	getBaselayersByLayer,
} = require("./controller");

const router = require("express").Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", getBaselayers);
router.get("/dictionary", getBaselayersDictionary);
router.get("/scorecard/:yearNumber/:geoId", getScorecardData);
router.get("/:yearNumber", getBaselayersByYear);
router.get("/:yearNumber/:layerType", getBaselayersByLayer);
router.get("/:yearNumber/:layerType/:contentKey", getBaselayersByKey);
router.post("/:yearNumber", upload.single("file"), createBaselayersData);
router.delete("/:yearNumber", deleteBaselayersByYear);

module.exports = router;
