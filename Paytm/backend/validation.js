const zod = require("zod");

const signUpValidation = zod.object({
  username: zod.string(), // .email({ message: "Invalid email address" }),
  firstName: zod.string(),
  lastName: zod.string()
})

const signInValidation = zod.object({
  username: zod.string().email({ message: "Invalid email address" }),
})

const updateValidation = zod.object({
  firstName: zod.string(),
  lastName: zod.string()
})

module.exports = {
  signUpValidation,
  signInValidation, 
  updateValidation
};