require("dotenv").config();

const verifyToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	if (!authHeader) return res.sendStatus(401);
	const token = authHeader.split(" ")[1];
	if (token === process.env.API_TOKEN) {
		next();
	} else {
		return res.sendStatus(403);
	}
};

module.exports = verifyToken;
