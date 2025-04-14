const express = require('express');
const cors = require('cors');

const groupRoutes = require('./routes/groups');
const expenseRoutes = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/', (req, res) => {
    res.send("Expense Splitter API is running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});