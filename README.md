# Vault
This is a password-manager constructed using the MERN stack (Mongodb, Express, React, Node.js) for the course COMP6841 Extended Cybersecurity Engineering for an undergraduate assignment.

**Disclaimer this password manager is NOT to be used for storing real passwords.**

Note since this project requires API keys and secrets you won't be able to run it yourself. However, you can cd into the client side and run **npm run dev** to try out the frontend on localhost.

There are several major components to my codebase that provide a certain level of security:

1. Authentication through JWTS encrypted using SHA-512.
2. Parsing of user data to ensure malicious payloads are intercepted.
3. Encryption of data at rest within the database through AES-256.
4. Storage of keys in a seperate location to the database.
5. Appropriate salting and hashing when storing passwords that do not require users to access in plaintext through bcrypt.

Additional todos:
- Implement delete and edit on the frontend side
- Implement MFA
- Rate limiters
- Prevent cross site scripting attacks using html escape function
- Utilise have I been pwned API to ensure that users are informed of data leakage
- Implement a secure and truly random password generator
