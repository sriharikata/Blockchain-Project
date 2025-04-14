const express = require("express");
const { v4: uuidv4 } = require("uuid");
const dynamoDB = require("../services/dynamodbClient");

const router = express.Router();

// Create a new group
router.post("/", async (req, res) => {
    const { groupName, createdBy, members } = req.body;

    if (!groupName || !createdBy || !members || !members.length) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    const groupId = uuidv4();
    const createdAt = new Date().toISOString();

    const params = {
        TableName: "Groups", // ✅ make sure this matches your DynamoDB table name
        Item: {
            groupId,
            groupName,
            createdBy,
            members,
            createdAt,
        },
    };

    try {
        await dynamoDB.put(params).promise();
        res.status(201).json({ message: "Group created", groupId });
    } catch (error) {
        console.error("DynamoDB put error:", error);
        res.status(500).json({ error: "Failed to create group" });
    }
});

// Get all groups
router.get("/", async (req, res) => {
    const params = {
      TableName: "Groups"
    };
  
    try {
      const data = await dynamoDB.scan(params).promise();
      res.status(200).json(data.Items); // ✅ send JSON array
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  });
  

module.exports = router;
