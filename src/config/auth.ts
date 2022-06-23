const JEST_JWT_SECRET = "946c1fb5c000b8bd932b621de659f4dd";

export default {
  jwt: {
    secret:
      process.env.NODE_ENV === "test"
        ? JEST_JWT_SECRET
        : (process.env.JWT_SECRET as string),
    expiresIn: "1d",
  },
};
