module.exports = {
  extends: ["@commitlint/config-conventional", "@uphold/commitlint-config"],
  plugins: ["commitlint-plugin-tense"],
  rules: {
    "subject-case": [2, "always", "lower-case"],
    "tense/subject-tense": [2, "always"],
    "type-empty": [2, "never"],
  },
};
