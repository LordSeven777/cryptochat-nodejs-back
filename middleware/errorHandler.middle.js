// Handles the errors
module.exports = (err, req, res, next) => {
    // Status code
    const status = err.status || 500;

    console.log(err.message || err);

    res.status(status).json({
        error: err.message
    })
}   