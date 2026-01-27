/*
Middleware to validate points when updating a user
*/
module.exports.validateNonNegativePoints = (req, res, next) => {

    // 1) check if points exists
    if (req.body.points === undefined) {
        return res.status(400).json({
            message: "Error: points is undefined"
        });
    }

    // 2) convert points to number
    const points = Number(req.body.points);

    // 3) check if points is a valid number
    /*
    Number.isNaN(points) checks whether a value is the special JavaScript value NaN
    Number.isNaN(points) used to validate numeric input after type conversion, 
    ensuring that invalid values such as non-numeric strings 
    are rejected before database updates are executed.
    */
    if (Number.isNaN(points)) {
        return res.status(400).json({
            message: "Error: points must be a number"
        });
    }

    // 4) check if points is negative
    if (points < 0) {
        return res.status(400).json({
            message: "Error: points cannot be negative"
        });
    }

    // 5) attach cleaned value back to request
    req.body.points = points;

    // 6) allow request to continue
    next();
};
