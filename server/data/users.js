const { stringTrim } = require('../utils/utils');

let users = [];

const findUser = (user) => {
    const userName = stringTrim(user.name);
    const userRoom = stringTrim(user.room);

    return users.find((u) => stringTrim(u.name) === userName && stringTrim(u.room) === userRoom);
};

const addUser = (user) => {
    const isExist = findUser(user);
    const currentUser = isExist || user;

    !isExist && users.push(user);

    return { isExist: !!isExist, user: currentUser };
};

const getRoomUsers = (room) => users.filter((u) => u.room === room);

const removeUser = (user) => {
    const found = findUser(user);

    if (found) {
        users = users.filter(({ room, name }) => room === found.room && name !== found.name);
    }

    return found;
};

module.exports = { addUser, findUser, getRoomUsers, removeUser };