const secretVariables = require('./secretVariables');
const mysql = require("mysql");
const crypto = require("crypto");
const SALT_LENGTH = 50;
const HASH_LENGTH = 64;

const Sequelize = require("sequelize");
const sequelize = new Sequelize(secretVariables.DB_NAME, secretVariables.DB_USERNAME, secretVariables.DB_PASSWORD, {
    host: secretVariables.DB_HOST,
    dialect: 'mysql'
});
const Model = require('./models/users.js')(sequelize, Sequelize.DataTypes);

module.exports = {
    getUserById: (id) =>
    {
        return new Promise((resolve, reject) =>
        {
            Model.findOne({ where: { id } })
                .then(user =>
                {
                    resolve(user.dataValues);
                })
                .catch((error) =>
                {
                    reject(error);
                });
        });
    },
    createUser: (user) =>
    {
        return new Promise((resolve, reject) =>
        {
            let passwordData = getHashedPasswordWithNewSalt(user.password);
            Model.create({
                "username": user.username,
                "passwordHash": passwordData.hash,
                "fullName": user.fullName,
                "about": user.about,
                "salt": passwordData.salt
            }).then((user) =>
            {
                resolve(user);
            }).catch((error) =>
            {
                reject(error);
            });
        });
    },
    getIdFromUsernameAndPassword: (username, password) =>
    {
        return new Promise((resolve, reject) =>
        {
            Model.findOne({ where: { username } })
                .then(user1 =>
                {
                    if (user1 === null)
                    {
                        reject(new Error("username or password does not exist"));
                    }
                    else
                    {
                        let salt = user1.salt;
                        let hash = getHashedPasswordWithExistingSalt(password, salt).hash;
                        Model.findOne({ where: { username, passwordHash: hash } })
                            .then((user2) =>
                            {
                                resolve(user2.id);
                            })
                            .catch((error) =>
                            {
                                reject(error);
                            });
                    }
                })
                .catch((error) =>
                {
                    reject(error);
                });
        });
    },
    updateUserDetails: (id, details) =>
    {
        return new Promise((resolve, reject) =>
        {
            Model.update(details, { where: { "id": id } })
                .then((results) =>
                {
                    if (results[0] !== 1)
                    {
                        reject(new Error("user not found"));
                    }
                    else
                    {
                        resolve(results);
                    }
                })
                .catch((error) =>
                {
                    reject(error);
                });
        });
    },
    changePassword: (id, newPassword) =>
    {
        return new Promise((resolve, reject) =>
        {
            let passwordData = getHashedPasswordWithNewSalt(newPassword);
            Model.update({ "passwordHash": passwordData.hash, "salt": passwordData.salt }, { where: { id } })
                .then((results) =>
                {
                    if (results[0] !== 1)
                    {
                        reject(new Error("user not found"));
                    }
                    else
                    {
                        resolve(results);
                    }
                })
                .catch((error) =>
                {
                    reject(error);
                });
        });
    }
}

function genRandomSalt()
{
    return crypto.randomBytes(Math.ceil(SALT_LENGTH / 2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0, SALT_LENGTH);   /** return required number of characters */
};

function getHashedPasswordWithNewSalt(userpassword)
{
    return getHashedPasswordWithExistingSalt(userpassword, genRandomSalt());
}
function getHashedPasswordWithExistingSalt(userpassword, salt)
{
    let value = crypto.pbkdf2Sync(userpassword, salt, 1000, HASH_LENGTH / 2, `sha512`).toString(`hex`);
    return {
        salt: salt,
        hash: value
    };
}

//not needed
// sequelize
//     .authenticate()
//     .then(() =>
//     {
//         console.log('Connection has been established successfully.');
//     })
//     .catch(err =>
//     {
//         console.error('Unable to connect to the database:', err);
//     });
//
//deprecated
// function getNewConnection()
// {
//     return mysql.createConnection(
//         {
//             host: 'royhadadusers.ctblchui610j.us-east-2.rds.amazonaws.com',
//             user: 'admin',
//             password: '12345678',
//             database: 'usersDB'
//         }
//     );
// }
// function getUpdateQuery(id, details)
// {
//     let setString = "";
//     let keys = Object.keys(details);
//     for (let key of keys)
//     {
//         if (typeof details[key] === "string")
//             setString += ` ${key}='${details[key]}',`;
//         else
//             setString += ` ${key}=${details[key]},`;
//     }
//     setString = setString.substr(0, setString.length - 1)
//     return `UPDATE users SET${setString} WHERE id=${id}`;
// }