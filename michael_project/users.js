const mysql = require("mysql");
const crypto = require("crypto");
const SALT_LENGTH = 50;
const HASH_LENGTH = 64;
module.exports = {
    getUserById: (id) =>
    {
        return new Promise((resolve, reject) =>
        {
            const connection = getNewConnection();
            connection.connect();
            connection.query(`SELECT * FROM users WHERE id=${id}`, function (error, results, fields)
            {
                connection.end();
                if (error) reject(error);
                resolve(results[0]);
            });
        });
    },
    createUser: (user) =>
    {
        return new Promise((resolve, reject) =>
        {
            let passwordData = getHashedPasswordWithNewSalt(user.password);
            const connection = getNewConnection();
            connection.connect();
            connection.query(`INSERT INTO users (username, password_hash, full_name, about, salt) VALUES("${user.username}", "${passwordData.hash}", "${user.full_name}", "${user.about}", "${passwordData.salt}")`, function (error, results, fields)
            {
                connection.end();
                if (error) reject(error);
                resolve(results);
            });
        });
    },
    getIdFromUsernameAndPassword: (username, password) =>
    {
        return new Promise((resolve, reject) =>
        {
            const connection = getNewConnection();
            connection.connect();
            connection.query(`SELECT (salt) FROM users WHERE username='${username}'`, function (error, results1, fields)
            {
                if (error) reject(error);
                if (results1.length !== 1) reject("invalid username or password");
                let salt = results1[0].salt;
                let hash = getHashedPasswordWithExistingSalt(password, salt).hash;
                connection.query(`SELECT * FROM users WHERE username='${username}' AND password_hash='${hash}'`, function (error, results2, fields)
                {
                    connection.end();
                    if (error) reject(error.message);
                    if (results2[0] === undefined) reject("invalid username or password");
                    resolve(results2[0].id);
                });
            });
        });
    },
    updateUserDetails: (id, details) =>
    {
        return new Promise((resolve, reject) =>
        {
            const connection = getNewConnection();
            connection.connect();
            connection.query(getUpdateQuery(id, details), function (error, results, fields)
            {
                connection.end();
                if (error) reject(error);
                if (results.affectedRows !== 1) reject("user not found");
                resolve(results);
            });
        });
    },
    changePassword: (id, newPassword) =>
    {
        return new Promise((resolve, reject) =>
        {
            const connection = getNewConnection();
            connection.connect();
            let passwordData = getHashedPasswordWithNewSalt(newPassword);
            let passwordObj = { "password_hash": passwordData.hash, "salt": passwordData.salt };
            connection.query(getUpdateQuery(id, passwordObj), function (error, results, fields)
            {
                connection.end();
                if (error) reject(error);
                if (results.affectedRows !== 1) reject("user not found");
                resolve(results);
            });
        });
    }
}

function getNewConnection()
{
    return mysql.createConnection(
        {
            host: 'royhadadusers.ctblchui610j.us-east-2.rds.amazonaws.com',
            user: 'admin',
            password: '12345678',
            database: 'usersDB'
        }
    );
}

function getUpdateQuery(id, details)
{
    let setString = "";
    let keys = Object.keys(details);
    for (let key of keys)
    {
        if (typeof details[key] === "string")
            setString += ` ${key}='${details[key]}',`;
        else
            setString += ` ${key}=${details[key]},`;
    }
    setString = setString.substr(0, setString.length - 1)
    return `UPDATE users SET${setString} WHERE id=${id}`;
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
    let value = crypto.pbkdf2Sync(userpassword, salt, 1000, HASH_LENGTH/2, `sha512`).toString(`hex`); 
    return {
        salt: salt,
        hash: value
    };
}