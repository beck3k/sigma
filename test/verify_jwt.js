const jwt = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MzM4MzA2MzcsImV4cCI6MTYzMzgzMTIzN30.SHlbZWycFyxlI_y8Wa9ZlCFG0tu88D30w8jT6Uv9Lnk_pJgWfoENYOOPiT5bO9pjqeuMpKO1_8L0Yzq5l42SuQ"
const key = "BC1YLijj8ZMdXFR4CJLGPgSZth9u1ZpK1bKeUtuDhBczscsQqcoCnS8";

const jsonwebtoken = require("jsonwebtoken");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const KeyEncoder = require("key-encoder").default;
const bs58check = require("bs58check");

const decodedKey = bs58check.decode(key);
const decodedKeyArray = [...decodedKey];
const rawPK = decodedKeyArray.slice(3);
const hexPK = ec.keyFromPublic(rawPK).getPublic().encode('hex', true);

const keyEncoder = new KeyEncoder("secp256k1");
const encodedPK = keyEncoder.encodePublic(hexPK, "raw", "pem");

const result = jsonwebtoken.verify(jwt, encodedPK, {
    algorithms: ["ES256"]
});

console.log(result);