const Joi = require("joi");

const schema = Joi.object({
    warehouse_id: Joi.string().pattern(/^[A-Z0-9-]{2,20}$/).required(),
    category: Joi.string().valid(
        "Electronics",
        "Textiles",
        "Chemicals",
        "Furniture",
        "Pharma"
    ).required(),
    item_name: Joi.string().min(1).max(100).required(),
    week_number: Joi.number().integer().min(1).max(52).required(),
    quantity: Joi.number().integer().min(0).required(),
    unit: Joi.string().valid("units", "kg", "litres").required(),
    recorded_by: Joi.string().min(1).max(80).required()
});

module.exports = schema;
