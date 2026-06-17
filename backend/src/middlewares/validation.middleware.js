const {body, validationResult} = require("express-validator");

const validator = async(req,res,next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({
            message : errors.array()
        });
    }

    next(); //pass request to next handler
} 


//rules for validation of user provided data for registration
const registerUserValidationRules = [
    body("username")
     .isString()
     .withMessage("Username must be a string.")
     .isLength({min:3, max:15})
     .withMessage("Username must be between 3 to 15 characters."),

     body("email")
      .isEmail()
      .withMessage("Invalid Email"),

    body("password")
     .isStrongPassword()
     .withMessage("Password must be of minimum 8 characters having atleast 1 uppercase letter,1 lower letter,1 number and 1 symbol."),
    
    validator
];



module.exports = {registerUserValidationRules}