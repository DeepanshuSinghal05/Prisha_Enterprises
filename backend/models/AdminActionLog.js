module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const AdminActionLog = sequelize.define('AdminActionLog', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    admin_user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    action_type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    target_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    target_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    old_value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    new_value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'admin_action_logs',
    timestamps: false,
    underscored: true
  });

  return AdminActionLog;
};
