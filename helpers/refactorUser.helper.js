// Refactors a user's data
// Removes the first name, the last name and the photoURL if the user's hidden status is "hidden"
module.exports = (user) => {
    if (user.hidden) {
        delete user['firstName'];
        delete user['lastName'];
        delete user['gender'];
        delete user['photoURL'];
    }
    else delete user['pseudo'];
    return user;
}