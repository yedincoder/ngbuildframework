
function getValueType(value) {
  if (Array.isArray(value)) {
    return 'array';
  }

  if (value === null) {
    return 'null';
  }

  return typeof value;
}

export function validateBody(body, schema = {}) {
  const errors = {};

  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body)
  ) {
    return {
      valid: false,
      errors: {
        body: 'Request body must be a JSON object'
      }
    };
  }

  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];

    const missing =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '');

    // Required
    if (rules.required && missing) {
      errors[field] = `${field} is required`;
      continue;
    }

    // Optional and empty
    if (missing) {
      continue;
    }

    // Type
    if (rules.type) {
      const actualType = getValueType(value);

      if (actualType !== rules.type) {
        errors[field] =
          `${field} must be ${rules.type}`;
        continue;
      }
    }

    // String validation
    if (typeof value === 'string') {
      if (
        rules.minLength !== undefined &&
        value.length < rules.minLength
      ) {
        errors[field] =
          `${field} must contain at least ${rules.minLength} characters`;
        continue;
      }

      if (
        rules.maxLength !== undefined &&
        value.length > rules.maxLength
      ) {
        errors[field] =
          `${field} must contain at most ${rules.maxLength} characters`;
        continue;
      }
    }

    // Number validation
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        errors[field] =
          `${field} must be a finite number`;
        continue;
      }

      if (
        rules.min !== undefined &&
        value < rules.min
      ) {
        errors[field] =
          `${field} must be at least ${rules.min}`;
        continue;
      }

      if (
        rules.max !== undefined &&
        value > rules.max
      ) {
        errors[field] =
          `${field} must be at most ${rules.max}`;
        continue;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
