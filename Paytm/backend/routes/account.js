const express = require("express");
const { authMiddleware } = require("../middleware");
const { Account } =  require("../db");
const { default: mongoose } = require("mongoose");

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
  const account = await Account.findOne({
    userId: req.userId
  });

  res.json({
    balance: account.balance
  })
});

/*
 Handling the situation using session for 2 trnx occuring at same time,
 1 will deduct the amount and somehow the server broke etc leads to not
 updating the balance and 2nd transaction takes place
*/
router.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();
  const {amount, to} = req.body;

  // Fetch the acc within the trnx
  const account = await Account.findOne({
    userId: req.userId
  }).session(session);

  if (!account || account.balance < amount){
    await session.abortTransaction();
    return res.status(400).json({
      msg: "Insufficient funds"
    });
  }

  //Make the trnx
  await Account.updateOne({userId: req.userId},{$inc: {balance: -amount}}).session(session);
  await Account.updateOne({userId: to}, {$inc: {balance: amount}}).session(session);

  // commit the trnx
  await session.commitTransaction();
  res.json({
    msg: "Money Transferred"
  });

})

module.exports = router;