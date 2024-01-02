const router = require("express").Router();
router.get("/", (_req, res) => {
  res
    .status(200)
    .json({ ok: true })
    .header("Cache-Control", "no-store");
});
module.exports = router;
