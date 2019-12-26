const mysql = require("mysql");

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
            const connection = getNewConnection();
            connection.connect();
            connection.query(`INSERT INTO users (username, password_hash, full_name, about) VALUES("${user.username}", "${user.password}", "${user.full_name}", "${user.about}")`, function (error, results, fields)
            {
                connection.end();
                if (error) reject(error);
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

function changePassword(id, newPassword)
{

}
function updateUserDetails(id, details)
{


}
function checkPassword(id, password)
{


}













//module.exports;