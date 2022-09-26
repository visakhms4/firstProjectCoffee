
const Joi = require('joi')

module.exports = Joi.object({

        name: Joi.string()
        .min(10)
            .alphanum()
            .required(),

        //     password:Joi.string()
        //         .required(),
        // email: Joi.string()
        //     .required(),
        //     phone: Joi.string()
        //         .required(),

        //         confirmPassword:Joi.string()
        //             .required(),


        })