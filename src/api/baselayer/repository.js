const GenericRepository = require("../../repository");
const { Baselayer } = require("./model");

const baselayerRepo = new GenericRepository(Baselayer);

module.exports = baselayerRepo;
