const { Schema, model } = require("mongoose");

const overlaySchema = new Schema(
	{
		overlayType: String,
		content: Object,
	},
	{
		timestamps: true,
	}
);

const Overlay = model("Overlay", overlaySchema);

module.exports = {
	overlaySchema,
	Overlay,
};
