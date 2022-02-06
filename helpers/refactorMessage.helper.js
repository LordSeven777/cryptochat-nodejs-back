// Refactors a message joined with images data
const refactorMessage = (messageRows, type) => {
    if (messageRows.length === 0) return [];
    let message;
    const [_message] = messageRows;
    if (type === "group") {
        _message.messageID = _message.group_message_ID;
        delete _message['group_message_ID'];
    }
    if (_message.nature === 'text') {
        delete _message['imageID'];
        delete _message['imageURL'];
        message = _message;
    }
    else if (_message.nature === 'image') {
        const { messageID, content, nature, date, status, senderID } = _message;
        message = { messageID, content, nature, date, status, senderID };
        if (type === "group") message.groupID = _message.groupID;
        message.images = messageRows.map(({ imageID, imageURL }) => ({ imageID, imageURL }));
    }
    return [message];
}

module.exports = refactorMessage;