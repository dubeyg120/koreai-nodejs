const express = require("express");
const router = express.Router();
const Controllers = require(_pathconst.FilesPath.Controllers)
router.get("/health", async (req, res) => {
  try {
    console.log("works fine");
    res.json({
      test: "works fine",
    });
  } catch (e) {
    console.log(e);
    res.json({
      error: e,
    });
  }
});

router.post("/customer", Controllers.AddCustomer)
router.post("/vendor", Controllers.AddVendor)
router.post("/add", Controllers.AddOrder)
router.post("/update/:id", Controllers.UpdateOrder);
router.post("/updateStatus/:id", Controllers.UpdateStatus);
router.post("/delete/:id", Controllers.DeleteOrder);
router.get("/capacity", Controllers.CheckRemainingCapacity)
// router.get("/get-users", Controllers.FetchUsers)
module.exports = router;
