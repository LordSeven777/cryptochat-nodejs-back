// User photos url paths
const { urlPath } = require('../config/userPhoto.config');

// MySQL connection pool
const pool = require('../dbPool');

// User's data refactorer
const refactorUser = require('../helpers/refactorUser.helper');

// User model
module.exports = class {

    // Gets accpeted users suggestions
    static async getAcceptedUsersSuggestions(userID = 1, page = 1, limit = 10) {
        let SQL = `
        SELECT u.userID, u.firstName, u.lastName, u.gender, u.pseudo, u.online, u.hidden,
        CONCAT("${urlPath}",u.photo) AS photoURL, d.discussionID,
        COUNT(m.messageID) AS messagesNumber, MIN(m.date) AS lastMessageDate
        FROM users AS u
        INNER JOIN requests ON u.userID = requests.userID
        INNER JOIN discussions AS d ON requests.discussionID = d.discussionID
        INNER JOIN messages AS m ON d.discussionID = m.discussionID
        WHERE u.online = TRUE
        AND d.status = "accepted"
        AND u.userID != '${userID}'
        AND d.discussionID = ANY(
            SELECT discussions.discussionID FROM users
            INNER JOIN requests ON users.userID = requests.userID
            INNER JOIN discussions ON requests.discussionID = discussions.discussionID
            WHERE users.userID = ${userID}
        )
        GROUP BY u.userID
        ORDER BY COUNT(m.messageID) DESC, MIN(m.date) DESC
        LIMIT ${(page - 1) * limit},${limit}
        `;

        const result = await pool.query(SQL);

        // Refactoring
        const users = result.map((user) => refactorUser(user));
        
        return users;
    }


    // Gets non-accepted users
    static async getNonAcceptedUsers(userID = 1, page = 1, limit = 5, search = '') {
        const SQL = `
        SELECT users.userID, users.firstName, users.lastName, users.gender, users.pseudo, users.hidden,
        users.registrationDate,
        CONCAT("${urlPath}",users.photo) AS photoURL
        FROM users
        LEFT JOIN requests ON users.userID = requests.userID
        LEFT JOIN discussions AS d ON requests.discussionID = d.discussionID
        LEFT JOIN messages ON d.discussionID = messages.discussionID
        WHERE users.userID != ${userID}
        ${search ? 
            `AND (firstName LIKE "%${search}%" OR lastName LIKE "%${search}%" OR pseudo LIKE "%${search}%")` 
        : ''}
        AND NOT users.userID = ANY(
            SELECT users.userID FROM users
            INNER JOIN requests ON users.userID = requests.userID
            INNER JOIN discussions ON requests.discussionID = discussions.discussionID
            WHERE discussions.discussionID = ANY(
                SELECT discussions.discussionID FROM users
                INNER JOIN requests ON users.userID = requests.userID
                INNER JOIN discussions ON requests.discussionID = discussions.discussionID
                WHERE users.userID = ${userID}
            )
        )
        GROUP BY users.userID 
        ORDER BY${search ? ' users.firstName, users.lastName, users.pseudo,' : ''} users.registrationDate DESC
        LIMIT ${(page - 1) * limit},${limit}
        `;

        const result = await pool.query(SQL);

        // Refactoring
        const users = result.map(user => refactorUser(user));

        return users;
    }


    // Gets a specific user
    static async getUser(id = 1, userID = 2) {
        // Selects the user's details statement
        let SQL = `
        SELECT u.userID, u.firstName, u.lastName, u.gender, u.pseudo, u.registrationDate, u.online, u.hidden,
        CONCAT("${urlPath}",u.photo) AS photoURL, u.lastOnlineDate, u.email
        FROM users AS u
        WHERE u.userID = ${id}
        `;
        const result = await pool.query(SQL);
        const user = result[0];

        if (parseInt(id) === parseInt(userID)) return user;

        const userDetails = refactorUser(user);

        // If there's no current userID associated with the query, return only the user's details
        if (!userID) return userDetails;

        // Selects the user's request data associated with the current user statement
        SQL = `
        SELECT r.requestID, r.role, r.userID, discussions.*
        FROM users AS u
        INNER JOIN requests AS r ON r.userID = u.userID
        INNER JOIN discussions ON discussions.discussionID = r.discussionID
        WHERE r.userID = ${id} AND discussions.discussionID = ANY(
            SELECT discussions.discussionID FROM users
            INNER JOIN requests ON users.userID = requests.userID
            INNER JOIN discussions ON requests.discussionID = discussions.discussionID
            WHERE users.userID = ${userID}
        )
        GROUP BY r.requestID
        `;
        const requestData = await pool.query(SQL);
        
        // Request data to send to return
        const request = requestData.find(({ userID }) => parseInt(userID) === parseInt(id));

        const userData = { ...userDetails, request };

        // Omitting the lastOnlineDate field if the status is not accepted
        if (userData.request.status !== 'accepted') {
            delete userData['lastOnlineDate'];
            delete userData['email'];
        }

        return userData;
    }


    // Gets a user by email / pseudo
    static async getUserByEmailOrPseudo(value) {
        const SQL = `
        SELECT u.userID, u.firstName, u.lastName, u.gender, u.hidden, u.password,
        CONCAT("${urlPath}", u.photo) AS photoURL, u.registrationDate, u.email, u.online
        FROM users AS u WHERE u.email = "${value}" OR u.pseudo = "${value}"
        `;
        const result = await pool.query(SQL);
        if (result.length === 0) return null;
        else return result[0];
    }


    // Verifies if a value already exists in a field
    static async checkIfExists(field, value) {
        const SQL = `SELECT COUNT(*) AS count FROM users WHERE ${field} = "${value}"`;
        const result = await pool.query(SQL);
        return result[0].count > 0;
    }


    // Inserts a new user
    static async insertUser(user) {
        const { firstName, lastName, gender, pseudo, email, password } = user;

        const SQL = `
        INSERT INTO users(firstName, lastName, gender, pseudo, email, password) VALUES
        ("${firstName}", "${lastName}", "${gender}", "${pseudo}", "${email}", "${password}")
        `;
        const result = await pool.query(SQL);

        return result.insertId.toString().padStart(10, 0);
    }

    // Sets a user as online
    static async setUserAsOnline(userID, status = true) {
        const SQL = `
        UPDATE users
        SET online = ${status}
        WHERE users.userID = ${userID}
        `;
        await pool.query(SQL);
    }

    // Updates the password of a user
    static async updateUserPassword(userID, hashedPassword) {
        const SQL = `
        UPDATE users
        SET password = "${hashedPassword}"
        WHERE users.userID = ${userID}
        `;
        await pool.query(SQL);
    }
}