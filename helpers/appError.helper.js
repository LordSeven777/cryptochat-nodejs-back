// App error class
module.exports = class extends Error {
    constructor(status, message) {
        super();
        this.status = status;
        this.message = message;
    }

    // Error status code
    status;

    // Error message
    message;
}