module.exports = (sequelize, DataTypes) => {
  const Customers = sequelize.define(
    "customers",
    {
      name: {
        type: DataTypes.STRING,
      },
      extra_details: {
        type: DataTypes.JSON,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  Customers.get = async (whereData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await Customers.findAll({
          raw: true,
          ...(Object.keys(whereData).length && { where: whereData }),
        });
        if (data && Array.isArray(data) && data.length) {
          resolve({ status: 200, data });
        } else {
          resolve({ status: 400 });
        }
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };
  Customers.insertData = async (newObject, transaction) => {
    return new Promise(async (resolve, reject) => {
      try {
        const insertData = await Customers.create(newObject, {
          transaction,
        });
        if (insertData && insertData.dataValues) {
          resolve({ status: 200, data: insertData.dataValues });
        } else {
          reject("Data cannot be inserted into account_transaction table.");
        }
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  Customers.updateData = async (
    newObject,

    whereData,
    transaction
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        const updateData = await Customers.update(
          newObject,
          {
            where: whereData,
          },
          { transaction }
        );
        resolve({ status: 200, data: {} });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };
  return Customers;
};
