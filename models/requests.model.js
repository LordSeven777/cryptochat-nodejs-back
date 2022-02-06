// MySQL connection pool
const pool = require('../dbPool');

// User photo url path
const { urlPath: photoURLPath } = require('../config/userPhoto.config');

// User data refactorer
const refactorUser = require('../helpers/refactorUser.helper');

module.exports = class {


    // Gets pending requests from other users
    static async getPendingRequests(userID = 1, limit = 7, checkupDate = "2021-08-01 10:37") {
        let SQL = `
        SELECT u.userID, u.firstName, u.lastName, u.pseudo, CONCAT("${photoURLPath}",u.photo) AS photoURL,
        u.gender, u.hidden, d.*
        FROM users AS u
        INNER JOIN requests AS r ON r.userID = u.userID
        INNER JOIN discussions AS d ON d.discussionID = r.discussionID
        WHERE d.status = "pending" AND r.role = "requested" AND u.userID != ${userID} 
        AND d.discussionID = ANY(
            SELECT discussions.discussionID FROM users
            INNER JOIN requests ON requests.userID = users.userID
            INNER JOIN discussions ON discussions.discussionID = requests.discussionID
            WHERE users.userID = ${userID}
        )
        ${checkupDate ? `AND d.requestDate < "${checkupDate}"` : ''}
        ORDER BY d.requestDate DESC
        LIMIT ${limit}
        `;
        let result = await pool.query(SQL);

        const { userID: _userID, firstName, lastName, gender, pseudo, photoURL, hidden,
        discussionID, requestDate, requestSeen, status} = result[0];

        // Refactored user data data
        const user = refactorUser({ userID: _userID, firstName, lastName, gender, pseudo, photoURL, hidden });

        // Request data
        const requestData = { discussionID, requestDate, requestSeen, status, user };

        // Select the last message with the user statement
        SQL = `
        SELECT messages.* FROM discussions
        INNER JOIN messages ON messages.discussionID = discussions.discussionID
        WHERE discussions.discussionID = ${discussionID}
        GROUP BY messages.messageID
        HAVING MAX(messages.date) = messages.date
        LIMIT 1
        `;
        result = await pool.query(SQL);

        // Attaching the last message to the request data
        requestData.messages = result;

        return requestData;
    }


}

