const validator = require("validator");

const validateSignupData = (req) => {
  const { firstName, lastName, password, email } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is not valid ");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is not valid ");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("password is not strong");
  }
};

const validateEditProfileData = (req, res) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "email",
    "age",
    "gender",
    "photoUrl",
    "about",
    "skills",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) => allowedEditFields.includes(field));

  return isEditAllowed ;
    
};

module.exports =  {validateSignupData, validateEditProfileData };
