import { randomBytes } from "node:crypto";

const NAMES = ["Maja", "Ola", "Jan", "Adam", "Ewa", "Piotr", "Anna", "Leon"];
const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function alphanumeric(length: number) {
  const bytes = randomBytes(length);
  let value = "";
  for (let index = 0; index < length; index += 1) {
    value += ALPHABET[bytes[index] % ALPHABET.length];
  }
  return value;
}

export function createRegistrationDefaults() {
  const name = NAMES[randomBytes(1)[0] % NAMES.length];

  return {
    name: `${name}${alphanumeric(4)}`,
    email: `${alphanumeric(4)}@example.com`,
    password: alphanumeric(6),
  };
}
