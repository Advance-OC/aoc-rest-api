const { getWorkbook, getSheet, getRows } = require("../../utils");
const { sheetNames, dictionary } = require("./constants");
const { Overlay } = require("./model");

const getOverlayData = async (_req, res) => {
	try {
		res.json(dictionary);
	} catch (err) {
		res.status(500).json(err.message);
	}
};

const getOverlayByType = async (req, res) => {
	try {
		const { type } = req.params;
		const overlays = await Overlay.find({ overlayType: type });
		res.json(overlays);
	} catch (err) {
		res.status(500).json(err.message);
	}
};

const addOverlayData = async (req, res) => {
	try {
		if (!req?.file?.buffer) {
			return res.status(404).json("File not found.");
		}

		const file = req.file.buffer;
		const workbook = getWorkbook(file);

		const overlays = [];
		sheetNames.forEach((sheetName) => {
			const sheet = getSheet(workbook, sheetName);
			const rows = getRows(sheet);
			const updatedRows = rows.map((row) => {
				const obj = {};
				for (const key in row) {
					obj[key] = row[key];
				}
				return obj;
			});
			overlays.push(
				...updatedRows.map((row) => ({
					overlayType: sheetName,
					content: { ...row },
				}))
			);
		});

		await Overlay.deleteMany();
		const newOverlays = await Overlay.insertMany(overlays);
		res.json(newOverlays);
	} catch (err) {
		res.status(500).json(err.message);
	}
};

module.exports = {
	getOverlayData,
	getOverlayByType,
	addOverlayData,
};
