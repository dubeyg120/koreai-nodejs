const db = require(_pathconst.FilesPath.Db);
const sequelize = db.sequelize;
const ResHelper = require(_pathconst.FilesPath.ResHelper);
const {
  checkObjectById,
  checkQuantityEligibilty,
  checkRemainingCapacity,
} = require(_pathconst.FilesPath.Queries);

const { get_query_success, insert_query_success } = require(_pathconst.FilesPath
  .QueryCheck);

const moment = require("moment");
// (res, status, message, code, data)
const AddCustomer = async (req, res) => {
  try {
    var resDict = {
      status: 400,
      message: "Error",
      data: {},
    };
    var transaction = await sequelize.transaction();
    const { name } = req.body;
    if (name) {
      const insert_row = await db.customers.insertData({ name }, transaction);
      if (
        insert_row &&
        insert_row.status &&
        insert_row.status === 200 &&
        insert_row.data &&
        Array.isArray(Object.keys(insert_row.data)) &&
        Object.keys(insert_row.data).length
      ) {
        resDict = {
          status: 201,
          message: "Customer successfully added",
          data: insert_row.data,
        };
      }
    }
    if (transaction && resDict.status === 201) {
      await transaction.commit();
    } else {
      transaction.rollback();
    }
    ResHelper.apiResponse(
      res,
      resDict.status === 201,
      resDict.message,
      resDict.status,
      resDict.data
    );
  } catch (error) {
    console.log(error);
    transaction.rollback();
    ResHelper.apiResponse(res, false, "Server error", 500, { error });
  }
};

const AddVendor = async (req, res) => {
  try {
    var resDict = {
      status: 400,
      message: "Error",
      data: {},
    };
    var transaction = await sequelize.transaction();
    const { name, capacity, extra_details } = req.body;
    if (name && capacity) {
      const insert_row = await db.vendors.insertData(
        { name, capacity, ...(extra_details && { extra_details }) },
        transaction
      );
      if (
        insert_row &&
        insert_row.status &&
        insert_row.status === 200 &&
        insert_row.data &&
        Array.isArray(Object.keys(insert_row.data)) &&
        Object.keys(insert_row.data).length
      ) {
        resDict = {
          status: 201,
          message: "Vendor successfully added",
          data: insert_row.data,
        };
      }
    }
    if (transaction && resDict.status === 201) {
      await transaction.commit();
    } else {
      transaction.rollback();
    }
    ResHelper.apiResponse(
      res,
      resDict.status === 201,
      resDict.message,
      resDict.status,
      resDict.data
    );
  } catch (error) {
    console.log(error);
    transaction.rollback();
    ResHelper.apiResponse(res, false, "Server error", 500, { error });
  }
};

const AddOrder = async (req, res) => {
  try {
    var resDict = {
      status: 400,
      message: "Error",
      data: {},
    };
    var transaction = await sequelize.transaction();
    const { quantity, vendor_id, customer_id, extra_details } = req.body;
    var { expected_delivery } = req.body;
    if (quantity && vendor_id && customer_id && expected_delivery) {
      const [customer, vendor] = await Promise.all([
        checkObjectById(customer_id, "customers"),
        checkObjectById(vendor_id, "vendors"),
      ]);
      if (customer && vendor) {
        expected_delivery = moment(expected_delivery).isValid
          ? moment(expected_delivery).format("DD-MM-YYYY")
          : "";
        const quantity_eligibility = await checkQuantityEligibilty(
          vendor_id,
          quantity,
          expected_delivery
        );
        if (
          quantity_eligibility &&
          quantity_eligibility.status &&
          quantity_eligibility.status === 200 &&
          quantity_eligibility.data &&
          quantity_eligibility.data.capacity
        ) {
          if(quantity_eligibility.data.capacity >= quantity) {
            const insert_row = await db.orders.insertData(
                {
                  quantity,
                  vendor_id,
                  customer_id,
                  ...(extra_details && { extra_details }),
                  vendor_capacity: quantity_eligibility.data.capacity - quantity,
                  expected_delivery 
                },
                transaction
              );
              if (
                insert_row &&
                insert_row.status &&
                insert_row.status === 200 &&
                insert_row.data &&
                Array.isArray(Object.keys(insert_row.data)) &&
                Object.keys(insert_row.data).length
              ) {
                resDict = {
                  status: 201,
                  message: "Order successfully created",
                  data: insert_row.data,
                };
              }
          } else {
            resDict = {
                status : 400,
                message : "Not enough vendor quantity",
                data : quantity_eligibility.data
            }
          }
        }
      } else {
        resDict = {
          status: 400,
          data: {},
          message:
            `could not find` +
            (customer ? " customer " : "") +
            (vendor ? "vendor" : ""),
        };
      }
    }
    if (transaction && resDict.status === 201) {
      await transaction.commit();
    } else {
      transaction.rollback();
    }
    ResHelper.apiResponse(
      res,
      resDict.status === 201,
      resDict.message,
      resDict.status,
      resDict.data
    );
  } catch (error) {
    console.log(error);
    transaction.rollback();
    ResHelper.apiResponse(res, false, "Server error", 500, { error });
  }
};

const UpdateOrder = async (req, res) => {
  try {
    var resDict = {
      status: 400,
      message: "Error",
      data: {},
    };
    var transaction = await sequelize.transaction();
    const order_id = req.params.id;
    const { update_data } = req.body;
    const curr_order = await db.orders.get({
      id: order_id,
    });
    if (get_query_success(curr_order)) {
      var expected_delivery =
        update_data && update_data.expected_delivery
          ? update_data.expected_delivery
          : curr_order.data[0].expected_delivery;
      const quantity =
        update_data && update_data.quantity
          ? update_data.quantity
          : curr_order.data[0].quantity;

      if (quantity && expected_delivery) {
        expected_delivery = moment(expected_delivery).isValid
          ? moment(expected_delivery).format("DD-MM-YYYY")
          : "";
        const quantity_eligibility = await checkQuantityEligibility(
          vendor_id,
          quantity,
          expected_delivery
        );
        if (
          quantity_eligibility &&
          quantity_eligibility.status &&
          quantity_eligibility.status === 200 &&
          quantity_eligibility.data &&
          quantity_eligibility.data.capacity
        ) {
          const update_row = await db.orders.updateData(
            update_data,
            { id: order_id },
            transaction
          );
          if (update_row && update_row.status && update_row.status === 200) {
            resDict = {
              status: 201,
              message: "Order successfully updated",
              data: {},
            };
          }
        }
      }
    }

    if (transaction && resDict.status === 201) {
      await transaction.commit();
    } else {
      transaction.rollback();
    }
    ResHelper.apiResponse(
      res,
      resDict.status === 201,
      resDict.message,
      resDict.status,
      resDict.data
    );
  } catch (error) {
    console.log(error);
    transaction.rollback();
    ResHelper.apiResponse(res, false, "Server error", 500, { error });
  }
};

const UpdateStatus = async (req, res) => {
  try {
    const order_id = req.params.id;
    var transaction = await sequelize.transaction();
    var resDict = {
      status: 400,
      message: "Error",
      data: {},
    };
    const curr_order = await db.orders.get({
      id: order_id,
    });
    if (get_query_success(curr_order)) {
      const curr_status = curr_order.data[0].status;
      const possible_status = ["PLACED", "PACKED", "DISPATCHED", "DELIVERED"];
      const ind = possible_status.indexOf(curr_status);
      if (ind <= possible_status.length - 2) {
        const update_order = await db.orders.updateData(
          { status: possible_status[ind + 1] },
          { id: order_id },
          transaction
        );
        if (
          update_order &&
          update_order.status &&
          update_order.status === 200
        ) {
          resDict = {
            status: 200,
            message: `Order status updated to ${possible_status[ind+1]}`,
          };
        }
      } else {
        resDict = {
          status: 400,
          message: "Order already delivered",
        };
      }
    } else {
      resDict = {
        status: 400,
        message: "Could not find order",
      };
    }
    if (transaction && resDict.status === 200) {
      await transaction.commit();
    } else {
      transaction.rollback();
    }
    ResHelper.apiResponse(
      res,
      resDict.status === 201,
      resDict.message,
      resDict.status,
      resDict.data
    );
  } catch (error) {
    console.log(error);
    transaction.rollback();
    ResHelper.apiResponse(res, false, "Server error", 500, { error });
  }
};

const DeleteOrder = async (req, res) => {
  try {
    const order_id = req.params.id;
    var transaction = await sequelize.transaction();
    var resDict = {
      status: 400,
      message: "Could not delete data",
      data: {},
    };
    const curr_order = await db.orders.get({
      id: order_id,
    });
    if (get_query_success(curr_order)) {
        const update_order = await db.orders.updateData(
          { is_deleted : true },
          { id: order_id },
          transaction
        );
        if (
          update_order &&
          update_order.status &&
          update_order.status === 200
        ) {
          resDict = {
            status: 200,
            message: "Order updated",
          };
        }
    } else {
      resDict = {
        status: 400,
        message: "Could not find order",
      };
    }
    if (transaction && resDict.status === 201) {
      await transaction.commit();
    } else {
      transaction.rollback();
    }
    ResHelper.apiResponse(
      res,
      resDict.status === 201,
      resDict.message,
      resDict.status,
      resDict.data
    );
  } catch (error) {
    console.log(error);
    transaction.rollback();
    ResHelper.apiResponse(res, false, "Server error", 500, { error });
  }
};

const CheckRemainingCapacity = async (req, res) => {
    try {
        var {id, date} = req.query;
        var resDict = {
          status: 400,
          message: "Could not fetch data",
          data: {},
        };
        date = date ? moment(date).format("DD-MM-YYYY") : moment(Date.now()).format("DD-MM-YYYY")
        const curr_data = await checkRemainingCapacity(id, date) 
        if(curr_data && curr_data.status && curr_data.status === 200 && curr_data.data && curr_data.data.capacity) {
            resDict = {
                status : 200,
                message : "Fetched successfully",
                data : curr_data.data
            }
        }
        ResHelper.apiResponse(
          res,
          resDict.status === 201,
          resDict.message,
          resDict.status,
          resDict.data
        );
      } catch (error) {
        ResHelper.apiResponse(res, false, "Server error", 500, { error });
      }
}
module.exports = {
  AddCustomer,
  AddVendor,
  AddOrder,
  UpdateOrder,
  UpdateStatus,
  DeleteOrder,
  CheckRemainingCapacity
};
