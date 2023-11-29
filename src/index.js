const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db");
const dotenv = require("dotenv");
const verifyToken = require("./middleware/verifyToken");

const PORT = process.env.PORT || 3001;
const app = express();
dotenv.config();
connectDb();

app.use(
	cors({
		origin: function (origin, callback) {
			callback(null, true);
		},
		credentials: true,
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", require("./api/health"));
app.use(verifyToken);
app.use("/baselayers", require("./api/baselayer"));
app.use("/overlays", require("./api/overlay"));

app.use((err, _req, res, _next) => {
	console.log(err);
	res.status(500).json(err.message);
});

app.listen(PORT, (err) => {
	if (!err) {
		console.log(`Server running on port ${PORT}`);
	} else {
		console.log(`Error occured: ${err}`);
	}
});
