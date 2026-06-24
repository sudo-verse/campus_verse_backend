const jwt = require("jsonwebtoken");

// Wraps JWT signing/verifying. Secret and expiry are kept private.
class TokenService {
  #secret;
  #expiresIn;

  constructor(secret = process.env.JWT_SECRET || "dev123", expiresIn = "1d") {
    this.#secret = secret;
    this.#expiresIn = expiresIn;
  }

  issue(user) {
    if (!user || !user._id) {
      throw new Error("Cannot issue a token without a user id");
    }
    return jwt.sign({ id: user._id }, this.#secret, {
      expiresIn: this.#expiresIn,
    });
  }

  verify(token) {
    if (!token) {
      throw new Error("Authentication Invalid");
    }
    return jwt.verify(token, this.#secret);
  }

  decode(token) {
    return jwt.decode(token);
  }
}

module.exports = new TokenService();
module.exports.TokenService = TokenService;
