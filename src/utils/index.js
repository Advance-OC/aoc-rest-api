const xlsx = require("xlsx");
const baselayerData = require("../api/data/baseLayerData");

const getWorkbook = (file) => {
	return xlsx.read(file, { type: "buffer" });
};

const getSheet = (workbook, sheet) => {
	return workbook.Sheets[sheet];
};

const getRows = (sheet) => {
	const range = xlsx.utils.decode_range(sheet["!ref"]);

	const columnNames = [];
	for (let col = range.s.c; col <= range.e.c; col++) {
		const cellAddress = xlsx.utils.encode_cell({ r: range.s.r, c: col });
		const columnName = sheet[cellAddress] ? sheet[cellAddress].v : null;
		columnNames.push(columnName);
	}

	const rows = [];
	for (let row = range.s.r + 1; row <= range.e.r; row++) {
		const rowData = {};
		for (let col = range.s.c; col <= range.e.c; col++) {
			const cellAddress = xlsx.utils.encode_cell({ r: row, c: col });
			const cellValue = sheet[cellAddress] ? sheet[cellAddress].v : null;
			const columnName = columnNames[col];
			rowData[columnName] = cellValue;
		}
		rows.push(rowData);
	}

	return rows;
};

const getContentKey = (layerType, title) => {
	return baselayerData.find(
		(layer) => layer.layerType == layerType && layer.title == title
	);
};

module.exports = {
	getWorkbook,
	getSheet,
	getRows,
	getContentKey,
};
