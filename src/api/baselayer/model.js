const { Schema, model } = require("mongoose");

const censusTractSchema = new Schema(
	{
		geoId: { type: String, required: true },
		spi: { type: Schema.Types.Mixed, required: true },
		cdc: { type: Schema.Types.Mixed, required: true },
		demographics: { type: Schema.Types.Mixed, required: true },
	},
	{
		timestamps: true,
	}
);

const baselayerSchema = new Schema(
	{
		year: { type: Number, required: true, unique: true },
		censusTracts: [censusTractSchema],
	},
	{
		timestamps: true,
	}
);

const Baselayer = model("Baselayer", baselayerSchema);

module.exports = {
	baselayerSchema,
	Baselayer,
};
