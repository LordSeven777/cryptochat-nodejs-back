// MySQL connection pool
const pool = require('../dbPool');

// User photo url path
const { urlPath: photoURLPath } = require('../config/groupPhoto.config');

// User's data refactorer
const refactorUser = require('../helpers/refactorUser.helper')

module.exports = class {

    static async getGroup(id = 1) {
        const SQL = `
        SELECT u.userID, u.firstName, u.lastName, u.gender, u.online, u.hidden,
        CONCAT("${photoURLPath}",u.photo) AS photoURL, u.pseudo, 
        g.groupID, g.name, g.description, g.creationDate, CONCAT("${photoURLPath}",g.photo) AS groupPhotoURL,
        m.membershipID, m.lastReadMessageID, m.status
        FROM users AS u
        INNER JOIN memberships AS m ON m.userID = u.userID
        INNER JOIN groups AS g ON g.groupID = m.groupID
        WHERE g.groupID = ${id}
        ORDER BY m.status, m.joiningDate DESC
        `;
        const result = await pool.query(SQL);

        // The group data
        let groupData;

        // Refactoring
        const members = result.map((member, i) => {
            const { groupID, name, description, creationDate, groupPhotoURL,
                userID, firstName, lastName, gender, pseudo, online, hidden, photoURL, 
                membershipID, lastSeenMessageID, status
            } = member;

            if (i === 0) groupData = { groupID, name, description, creationDate, photoURL: groupPhotoURL };

            // Refactored member data
            const refactoredMember = refactorUser({
                userID, firstName, lastName, gender, pseudo, online, hidden, photoURL,
                membershipID, lastSeenMessageID, status
            });

            return refactoredMember;
        });

        // Attaching the members data to the group's data
        groupData.members = members;

        return groupData;
    }

}