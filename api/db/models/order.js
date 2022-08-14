module.exports = (sequelize, DataTypes) => {
  const Orders = sequelize.define(
    "orders",
    {
      customer_id: {
        type: DataTypes.INTEGER,
      },
      vendor_id: {
        type: DataTypes.INTEGER,
      },
      quantity: {
        type: DataTypes.INTEGER,
      },
      expected_delivery: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.ENUM("PLACED", "PACKED", "DISPATCHED", "DELIVERED"),
        defaultValue: "PLACED",
      },
      extra_details: {
        type: DataTypes.JSON,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      vendor_capacity: {
        type: DataTypes.INTEGER,
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  Orders.get = async (whereData, limit, orderBy) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await Orders.findAll({
          raw: true,
          ...(Object.keys(whereData).length && { where: {...whereData, is_deleted : false} }),
          ...(orderBy && {order : orderBy}),
          ...(limit && {limit})
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
  Orders.insertData = async (newObject, transaction) => {
    return new Promise(async (resolve, reject) => {
      try {
        const insertData = await Orders.create(newObject, {
          transaction,
        });
        if (insertData && insertData.dataValues) {
          resolve({ status: 200, data: insertData.dataValues });
        } else {
          reject("Data cannot be inserted into orders table.");
        }
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  Orders.updateData = async (newObject, whereData, transaction) => {
    return new Promise(async (resolve, reject) => {
      try {
        const updateData = await Orders.update(
          newObject,
          {
            where: whereData,
          },
          { transaction }
        );
        if(updateData[0])
        resolve({ status: 200, data: {} }); 
        else 
        resolve({status : 400})
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };
  return Orders;
};
