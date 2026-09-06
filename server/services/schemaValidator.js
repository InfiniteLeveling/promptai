/**
 * AJV Schema Validator for CanonicalRequirementSpec (Draft-07)
 */
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const schemaPath = join(__dirname, '../schemas/canonicalRequirementSpec.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

const ajv = new Ajv({ allErrors: true, coerceTypes: true });
addFormats(ajv);

const compiledValidator = ajv.compile(schema);

/**
 * Validates an object against CanonicalRequirementSpec schema.
 * @param {object} data
 * @returns {{ isValid: boolean, errors: Array<object> }}
 */
export function validateRequirementSpec(data) {
  const isValid = compiledValidator(data);
  return {
    isValid: Boolean(isValid),
    errors: compiledValidator.errors ? [...compiledValidator.errors] : []
  };
}

export default {
  validateRequirementSpec
};
