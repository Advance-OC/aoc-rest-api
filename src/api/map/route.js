const { getPlaceCensusTract } = require("./controller");

const router = require("express").Router();

router.get("/:placeId", getPlaceCensusTract);

module.exports = router;
