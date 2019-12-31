/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'username'
    },
    passwordHash: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'passwordHash'
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'fullName'
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'about'
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deletedAt'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updatedAt'
    },
    salt: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'salt'
    }
  }, {
    tableName: 'users'
  });
};
