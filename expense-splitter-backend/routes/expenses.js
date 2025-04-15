const express = require("express");
const dynamoDB = require("../services/dynamodbClient");

const router = express.Router();

router.get("/group/:groupId/balance", async (req, res) => {
  const { groupId } = req.params;

  try {
    // Fetch group members
    const groupParams = {
      TableName: "Groups",
      Key: { groupId },
    };
    const groupData = await dynamoDB.get(groupParams).promise();
    const group = groupData.Item;

    if (!group) return res.status(404).json({ error: "Group not found" });

    const nameMap = {}; // address => name
    group.members.forEach((m) => {
      const addr = m.address.toLowerCase();
      nameMap[addr] = m.name;
    });

    // Fetch all expenses for the group
    const expensesParams = {
      TableName: "Expenses",
      FilterExpression: "groupId = :g",
      ExpressionAttributeValues: { ":g": groupId },
    };
    const expensesData = await dynamoDB.scan(expensesParams).promise();
    const expenses = expensesData.Items;

    const rawBalances = {}; // address => net balance

    expenses.forEach((expense) => {
      const paidBy = expense.paidBy.toLowerCase();
      const splitDetails = expense.splitDetails || {};

      console.log("Expense:");
      console.log("Paid By:", paidBy);
      console.log("Split Details:", splitDetails);


      Object.entries(splitDetails).forEach(([addr, amt]) => {
        const member = addr.toLowerCase();
        const value = parseFloat(amt);

        if (!rawBalances[member]) rawBalances[member] = 0;
        if (!rawBalances[paidBy]) rawBalances[paidBy] = 0;

        if (member !== paidBy) {
          // Member owes payer
          rawBalances[member] -= value;
          rawBalances[paidBy] += value;
        }
        // Ignore payer's own share
      });
    });

    // Convert to named balances for frontend
    const namedBalances = {};
    Object.entries(rawBalances).forEach(([addr, amt]) => {
      const name = nameMap[addr] || addr;
      namedBalances[name] = parseFloat(amt.toFixed(4));
    });
    console.log("\n=== 🧾 Group Balance Debug ===");
    console.log("Group ID:", groupId);
    console.log("Named Balances:", namedBalances);
    console.log("Raw Balances:", rawBalances);
    console.log("=============================\n");

    res.status(200).json(namedBalances);
  } catch (err) {
    console.error("Balance error:", err);
    res.status(500).json({ error: "Failed to calculate balances" });
  }
});


// GET all expenses for a group
router.get("/group/:groupId", async (req, res) => {
  const { groupId } = req.params;

  const params = {
    TableName: "Expenses",
    FilterExpression: "groupId = :groupIdVal",
    ExpressionAttributeValues: {
      ":groupIdVal": groupId,
    },
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    res.status(200).json(data.Items);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Failed to fetch expense history" });
  }
});

// POST a new expense
router.post("/", async (req, res) => {
  const { groupId, paidBy, amount, description, splitBetween, splitDetails } = req.body;

  if (!groupId || !paidBy || !amount || !description || !splitBetween || !splitBetween.length) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const expenseId = Date.now().toString();
    const createdAt = new Date().toISOString();

    const params = {
      TableName: "Expenses",
      Item: {
        expenseId,
        groupId,
        paidBy,
        amount,
        description,
        splitBetween,
        splitDetails,
        createdAt,
      },
    };

    await dynamoDB.put(params).promise();
    res.status(201).json({ expenseId });
  } catch (error) {
    console.error("Failed to add expense:", error);
    res.status(500).json({ error: "Could not save expense" });
  }
});

// POST a settlement from smart contract
router.post("/settlement", async (req, res) => {
  const { groupId, from, to, amount, txHash } = req.body;

  if (!groupId || !from || !to || !amount || !txHash) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const groupData = await dynamoDB.get({
      TableName: "Groups",
      Key: { groupId },
    }).promise();

    const group = groupData.Item;

    if (!group || !group.members) {
      return res.status(404).json({ error: "Group not found or members missing" });
    }

    const toLower = to.toLowerCase();
    const matched = group.members.find(m => m.address.toLowerCase() === toLower);
    const recipientName = matched?.name || to;

    const item = {
      expenseId: `settle-${Date.now()}`,
      groupId,
      paidBy: from,
      description: `Settlement with ${recipientName}`,
      amount: parseFloat(amount),
      splitBetween: [recipientName],
      splitDetails: { [recipientName]: parseFloat(amount) },
      createdAt: new Date().toISOString(),
      type: "settlement",
      txHash,
    };

    await dynamoDB.put({
      TableName: "Expenses",
      Item: item,
    }).promise();

    res.status(201).json({ message: "Settlement recorded" });
  } catch (err) {
    console.error("Error logging settlement:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
