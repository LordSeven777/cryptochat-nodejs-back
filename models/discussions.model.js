// User's profile photo's url
const { urlPath: userPhotoURLPath } = require('../config/userPhoto.config');
// Group photo's url
const { urlPath: groupPhotoURLPath } = require('../config/groupPhoto.config');
// Discussions' images' url path
const { urlPath: discussionImageURLPath } = require('../config/discussionsImages.config') 

// MySQL connection pool
const pool = require('../dbPool');

// User's data refactorer
const refactorUser = require('../helpers/refactorUser.helper');
// Message data refactorer
const refactorMessage = require('../helpers/refactorMessage.helper');

module.exports = class {

    // Gets the number of unread discussions
    static async countUnreadDiscussions(userID = 1) {
        const SQL = `
        SELECT d.discussionID AS discussionID FROM users
        INNER JOIN requests ON requests.userID = users.userID
        INNER JOIN discussions AS d ON d.discussionID = requests.discussionID
        INNER JOIN messages AS m ON m.discussionID = d.discussionID
        WHERE users.userID = ${userID} AND m.status != "read" AND senderID != ${userID}
        GROUP BY d.discussionID
        UNION
        SELECT g.groupID AS discussionID FROM users AS u
        INNER JOIN memberships AS m ON m.userID = u.userID
        INNER JOIN groups AS g ON g.groupID = m.groupID
        INNER JOIN groups_messages AS gm ON gm.groupID = g.groupID
        WHERE u.userID = ${userID} AND senderID != ${userID} AND gm.date > (
            SELECT date FROM groups_messages 
            WHERE groups_messages.group_message_ID = m.lastReadMessageID
        )
        GROUP BY g.groupID
        `;
        const result = await pool.query(SQL);
        return result.length;
    }

    // Gets discussions
    static async getDiscussions(userID = 1, page = 1, limit = 7, search = '') {
        // Select limit most recent discussions statement
        let SQL = `
        SELECT "peer" AS type, discussions.discussionID AS discussionID, MAX(messages.date) AS date,
        users.userID AS ownerID, users.firstName AS firstName, users.lastName AS lastName, 
        users.pseudo AS pseudo, CONCAT("${userPhotoURLPath}",users.photo) AS photoURL, users.hidden AS hidden,
        users.gender AS gender, users.lastOnlineDate AS lastOnlineDate, users.online AS online, 
        requests.isSeen AS isSeen, discussions.status AS status, discussions.statusDate AS statusDate,
        requests.role AS role, NULL AS creationDate
        FROM users
        INNER JOIN requests ON requests.userID = users.userID
        INNER JOIN discussions ON discussions.discussionID = requests.discussionID
        INNER JOIN messages ON messages.discussionID = discussions.discussionID
        WHERE users.userID != ${userID}
        AND discussions.discussionID = ANY(
            SELECT discussions.discussionID FROM users
            INNER JOIN requests ON requests.userID = users.userID
            INNER JOIN discussions ON discussions.discussionID = requests.discussionID
            INNER JOIN messages ON messages.discussionID = discussions.discussionID
            WHERE users.userID=${userID}
        )
        ${search ? 
            `AND (users.firstName LIKE "%${search}%" OR users.lastName LIKE "%${search}%" 
            OR users.pseudo LIKE "%${search}%")` 
        : ''}
        GROUP BY discussions.discussionID
        UNION
        SELECT "group" AS type, groups.groupID AS discussionID, MAX(groups_messages.date) AS date,
        groups.groupID AS ownerID, groups.name AS firstName, NULL AS lastName, "" AS pseudo,
        CONCAT("${groupPhotoURLPath}",groups.photo) AS photoURL, NULL AS hidden, NULL AS gender,
        NULL AS lastOnlineDate, 0 AS online, memberships.isSeen AS isSeen,
        memberships.status AS status, memberships.statusDate AS statusDate, NULL AS role,
        groups.creationDate AS creationDate
        FROM users
        INNER JOIN memberships ON memberships.userID = users.userID
        INNER JOIN groups ON groups.groupID = memberships.groupID
        INNER JOIN groups_messages ON groups_messages.groupID = groups.groupID
        WHERE users.userID = ${userID}
        ${search ? `AND groups.name LIKE "%${search}%"` : ''}
        GROUP BY groups.groupID
        ORDER BY date DESC
        LIMIT ${(page - 1) * limit},${limit}
        `;

        // Recent discussions ordered by date
        const orderedRecentDiscussions =  await pool.query(SQL);

        // An array of promises which query the 10 last messages of each discussion
        const queryMessagesPromises = orderedRecentDiscussions.map(({ type, discussionID, date }) => {
            let SQL = '';
            if (type === 'peer') {
                SQL = `
                SELECT m.*
                FROM discussions
                INNER JOIN messages AS m ON m.discussionID = discussions.discussionID
                WHERE discussions.discussionID = ${discussionID}
                AND m.date = "${date}"
                ORDER BY m.date DESC
                `;
                return pool.query(SQL);
            }
            else if (type === 'group') {
                SQL = `
                SELECT m.*
                FROM groups
                INNER JOIN groups_messages AS m ON m.groupID = groups.groupID
                WHERE groups.groupID = ${discussionID}
                AND m.date = "${date}"
                ORDER BY m.date ASC
                `;

                // Select group members statement
                const selectGroupMembersSQL = `
                SELECT u.userID, u.firstName, u.lastName, u.online, u.hidden,
                u.gender, CONCAT("${userPhotoURLPath}",u.photo) AS photoURL, u.pseudo, m.lastReadMessageID,
                m.status, m.statusDate, m.mDate
                FROM users AS u
                INNER JOIN memberships AS m ON m.userID = u.userID
                INNER JOIN groups ON groups.groupID = m.groupID
                WHERE groups.groupID = ${discussionID}
                ORDER BY m.statusDate ASC, m.status ASC
                `;

                // Querying the group messages and group members at the same time
                return Promise.all([pool.query(SQL), pool.query(selectGroupMembersSQL)]);
            }
        });

        // Querying the messages (and group members)
        const discussionsMessages = await Promise.all(queryMessagesPromises);

        let recentDiscussionsWith10LastMessages = [];
        const orderedRecentDiscussionsLength = orderedRecentDiscussions.length;
        for (let i = 0; i < orderedRecentDiscussionsLength; i++) {
            const { type, discussionID, ownerID, firstName, lastName, gender, pseudo, isSeen,
                hidden, photoURL, status, lastOnlineDate, online, statusDate, role, creationDate
            } = orderedRecentDiscussions[i];

            const messages = refactorMessage(
                type === 'peer' ? discussionsMessages[i] : discussionsMessages[i][0],
                type
            );
            
            const _discussion = { 
                type, 
                discussionID,
                [type === 'peer' ? 'user' : 'group']: {
                    [type === 'peer' ? 'userID' : 'groupID']: ownerID,
                    photoURL
                },
                status: {
                    name: status,
                    date: statusDate,
                    isSeen
                },
                messages,
                mEnd: messages.length === 0
            };

            if (type === 'peer') {
                _discussion.user.hidden = parseInt(hidden); // Fix
                _discussion.status.role = role;
                if (parseInt(hidden)) {
                    _discussion.user.pseudo = pseudo;
                    delete _discussion.user["photoURL"];
                }
                else {
                    _discussion.user.firstName = firstName;
                    _discussion.user.lastName = lastName;
                    _discussion.user.gender = gender;
                }
                if (status === 'accepted') {
                    _discussion.user.lastOnlineDate = lastOnlineDate;
                    _discussion.user.online = online;
                }
            }
            else if (type === 'group') {creationDate
                _discussion.group.name = firstName;
                _discussion.group.creationDate = creationDate;
                _discussion.members = discussionsMessages[i][1].map(member => refactorUser(member));
            }

            recentDiscussionsWith10LastMessages.push(_discussion);
        }

        return recentDiscussionsWith10LastMessages;
    }

    
    // Gets one discussion and its messages
    static async getDiscussionMessages(type = 'peer', id = 1, limit = 10, dateCheckUp = null) {
        const messagesTableName = (type === 'peer') ? 'messages' : 'groups_messages';
        const messagesIDColName = (type === 'peer') ? 'messageID' : 'group_message_ID';
        const discussionsTableName = (type === 'peer') ? 'discussions' : 'groups';
        const discussionIDColName = (type === 'peer') ? 'discussionID' : 'groupID';
        
        const SQL = `
        SELECT ${messagesTableName}.* FROM ${discussionsTableName}
        INNER JOIN ${messagesTableName}
        ON ${messagesTableName}.${discussionIDColName} = ${discussionsTableName}.${discussionIDColName}
        WHERE ${discussionsTableName}.${discussionIDColName} = ${id}
        ${dateCheckUp ? `AND ${messagesTableName}.date < ${dateCheckUp}` : ''}
        GROUP BY ${messagesTableName}.${messagesIDColName}
        ORDER BY ${messagesTableName}.date DESC
        LIMIT ${limit}
        `;

        return await pool.query(SQL);
    }

    // Gets the active contact users' userIDs and the groups' goupIDs and types
    static async getActiveDiscussionsTypesIDs(userID = 1) {
        const SQL = `
        SELECT "peer" AS type, u.userID AS discussionID FROM users AS u
        INNER JOIN requests AS r ON u.userID = r.userID
        INNER JOIN discussions AS d ON r.discussionID = d.discussionID
        WHERE u.userID != ${userID}
        AND d.discussionID = ANY (
            SELECT discussions.discussionID FROM users
            INNER JOIN requests ON requests.userID = users.userID
            INNER JOIN discussions ON discussions.discussionID = requests.discussionID
            INNER JOIN messages ON messages.discussionID = discussions.discussionID
            WHERE users.userID=${userID} AND discussions.status = "accepted"
            AND users.online = TRUE
        )
        GROUP BY u.userID
        UNION
        SELECT "group" AS type, g.groupID AS discussionID FROM users AS u
        INNER JOIN memberships AS m ON u.userID = m.userID
        INNER JOIN groups AS g ON m.groupID = g.groupID
        WHERE u.userID = ${userID}
        GROUP BY g.groupID
        ORDER BY type ASC
        `;
        return pool.query(SQL);
    }
}