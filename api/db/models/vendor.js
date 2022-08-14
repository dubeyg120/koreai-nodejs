module.exports = (sequelize, DataTypes) => {
  const Vendors = sequelize.define(
    "vendors",
    {
      name: {
        type: DataTypes.STRING,
      },
      capacity: {
        type: DataTypes.INTEGER,
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
  Vendors.get = async (whereData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await Vendors.findAll({
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
  Vendors.insertData = async (newObject, transaction) => {
    return new Promise(async (resolve, reject) => {
      try {
        const insertData = await Vendors.create(newObject, {
          transaction,
        });
        if (insertData && insertData.dataValues) {
          resolve({ status: 200, data: insertData.dataValues });
        } else {
          reject("Data cannot be inserted into vendor table.");
        }
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  Vendors.updateData = async (newObject, whereData, transaction) => {
    return new Promise(async (resolve, reject) => {
      try {
        const updateData = await Vendors.update(
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
  return Vendors;
};
