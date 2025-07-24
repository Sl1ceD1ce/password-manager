import validUrl from "valid-url";

/**
 * validates the contents of an created/updated password post
 * @param {string} website
 * @param {string} username
 * @param {string} password
 */
export function validateContents(
  website: string,
  username: string,
  password: string
) {
  if (
    typeof website !== "string" ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    throw new Error("Invalid input format");
  }

  if (!validUrl.isWebUri(website)) {
    throw new Error("Invalid website");
  } else if (!validateUsername(username)) {
    throw new Error("Username is too short");
  } else if (!validatePassword(password)) {
    throw new Error("Password must be at least 8 characters long");
  }

  return;
}

/**
 * Ensures the username is only alphanumeric characters
 * @param username
 * @returns
 */
function validateUsername(username: string): boolean {
  return (
    /^[a-zA-Z0-9]+$/.test(username) &&
    username.length >= 2 &&
    username.length <= 20
  );
}

/**
 * Ensures the password has a combination of lower + upper case letters.
 * Numbers and a length of at least 12 characters.
 * @param password
 */
export function validatePassword(password: string): boolean {
  return password.length >= 8 && password.length <= 65;
}
