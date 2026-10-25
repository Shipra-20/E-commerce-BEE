function validateRegistration(name, email, password) {
  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 60
  ) {
    return "Name must contain 2 to 60 characters.";
  }

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return "Enter a valid email address.";
  }

  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 72
  ) {
    return "Password must contain 8 to 72 characters.";
  }

  return null;
}

module.exports = { validateRegistration };