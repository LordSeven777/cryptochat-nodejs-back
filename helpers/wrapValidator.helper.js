const { validationResult } = require('express-validator');

// App error class
const AppError = require('./appError.helper');

// Filters the errors provided by express-validator to prevent from duplicating fields
function filterErrors (errors) {
    return errors.filter((error, index, errors) => {
        if (index === 0) return true;
        if (error.param !== errors[index - 1].param) return true;
    })
}

// Middleware: Formats and forwards the errors array
const checkErrors = (req, res, next) => {
    const errorsResult = validationResult(req);
    if (!errorsResult.isEmpty()) {
        // Formating the errors array
        let errors = filterErrors(errorsResult.array());
        errors = errors.map(({ param, msg }) => ({ field: param, message: msg }));
        // Forwarding the errors to the error handler middleware
        next(new AppError(400, errors));
        return;
    }
    next();
}

// Takes in the schema array,
// Pushes a middleware for: formatting and forwarding the error onject
function validateSchema(schema) {
    schema.push(checkErrors);
    return schema;
}

// Exporting the helper function
module.exports = validateSchema;