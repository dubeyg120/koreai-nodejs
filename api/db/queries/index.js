const db = require(_pathconst.FilesPath.Db);
const sequelize = db.sequelize;
const moment = require("moment");
const { Op } = require("sequelize");
const { get_query_success, insert_query_success } = require(_pathconst.FilesPath
  .QueryCheck);
const checkObjectById = async (id, objectType) => {
  return new Promise(async (resolve, reject) => {
    try {
      const check_data = await db[objectType].get({ id });
      if (
        check_data &&
        check_data.status &&
        check_data.status === 200 &&
        check_data.data &&
        Array.isArray(check_data.data) &&
        check_data.data.length
      ) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

const checkQuantityEligibilty = async (
  vendor_id,
  quantity,
  expected_delivery
) => {
  return new Promise(async (resolve, reject) => {
    try {
      var vendor_data = await db.vendors.get({
        id: vendor_id,
        capacity: { [Op.gte]: quantity },
      });
      if (get_query_success(vendor_data)) {
        const order_vendor_data = await db.orders.get(
          {
            vendor_id: vendor_id,
            expected_delivery,
          },
          1,
          [["created_at", "DESC"]]
        );
        if (!get_query_success(order_vendor_data)) {
          resolve({
            status: 200,
            data: { capacity: vendor_data.data[0].capacity },
          });
        } else {
          resolve({
            status: 200,
            data: { capacity: order_vendor_data.data[0].vendor_capacity },
          });
        }
      } else {
        resolve({ status: 400, message: "Could not fetch vendor" });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const checkRemainingCapacity = async (vendor_id, expected_delivery) => {
  return new Promise(async (resolve, reject) => {
    try {
      var vendor_data = await db.vendors.get({
        id : vendor_id,
      });
      if (get_query_success(vendor_data)) {
        const order_vendor_data = await db.orders.get(
          {
            vendor_id,
            expected_delivery,
          },
          1,
          [["created_at", "DESC"]]
        );
        if (!get_query_success(order_vendor_data)) {
          resolve({
            status: 200,
            data: { capacity: vendor_data.data[0].capacity },
          });
        } else {
          resolve({
            status: 200,
            data: { capacity: order_vendor_data.data[0].vendor_capacity },
          });
        }
      } else {
        resolve({ status: 400 });
      }
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = {
  checkObjectById,
  checkQuantityEligibilty,
  checkRemainingCapacity,
};
