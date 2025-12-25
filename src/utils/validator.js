const Joi = require("joi");

class Validator {
  static validateLogin(data) {
    const schema = Joi.object({
      no_telp: Joi.string()
        .pattern(/^62\d{9,13}$/)
        .required(),
    });
    return schema.validate(data);
  }

  static validatePresensi(data) {
    const schema = Joi.object({
      id_fp_finger_mesin: Joi.number().required(),
      status: Joi.number().valid(0, 1).required(),
    });
    return schema.validate(data);
  }
}

module.exports = Validator;