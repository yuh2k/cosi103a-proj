const express = require('express');
const router = express.Router();
const User = require('../models/User')
const Transaction = require('../models/Transaction');

// Middleware to check if the user is logged in
isLoggedIn = (req, res, next) => {
    if (res.locals.loggedIn) {
      next()
    } else {
      res.redirect('/transaction')
    }
}

// Get all transactions
router.get('/transaction', isLoggedIn, async (req, res, next) => {
  try {
    const transactions = await Transaction.find();
    res.render('transaction', {transactions})
  } catch (error) {
    res.status(500).json({message: error.message});
  }
});

// Render the new transaction form
router.get('/transactions/new', isLoggedIn, (req, res) => {
    res.render('newTransaction');
});

// Create a new transaction
router.post('/transactions/new', isLoggedIn, async (req, res) => {
    try {
        const transaction = new Transaction({
            description: req.body.description,
            amount: req.body.amount,
            category: req.body.category,
            date: req.body.date
        });

        await transaction.save();
        res.redirect('/transaction');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Render the edit transaction form
router.get('/transactions/edit/:id', isLoggedIn, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        res.render('editTransaction', { transaction });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a transaction
router.post('/transactions/edit/:id', isLoggedIn, async (req, res) => {
    try {
        await Transaction.findByIdAndUpdate(req.params.id, {
            description: req.body.description,
            amount: req.body.amount,
            category: req.body.category,
            date: req.body.date
        });

        res.redirect('/transaction');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a transaction
router.get('/transactions/delete/:id', isLoggedIn, async (req, res) => {
    try {
        await Transaction.findByIdAndDelete(req.params.id);
        res.redirect('/transaction');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Group transactions by category
router.get('/transactions/groupByCategory', isLoggedIn, async (req, res, next) => {
    try {
        const results = await Transaction.aggregate([
            {
                $group: {
                    _id: '$category',
                    totalAmount: { $sum: '$amount' },
                    transactions: { $push: '$$ROOT' }
                }
            }
        ]);
        res.render('groupByCategory', { results });
    } catch (err) {
        next(err);
    }
});

// Render transactions page and sort transactions if sortBy parameter is present
router.get('/transactions', isLoggedIn, async (req, res, next) => {
    try {
      let transactions;
      const sortBy = req.query.sortBy;
      if (sortBy === 'category') {
        transactions = await Transaction.find().sort({ category: 1 });
      } else if (sortBy === 'amount') {
        transactions = await Transaction.find().sort({ amount: -1 });
      } else if (sortBy === 'description') {
        transactions = await Transaction.find().sort({ description: 1 });
      } else if (sortBy === 'date') {
        transactions = await Transaction.find().sort({ date: 1 });
      } else {
        transactions = await Transaction.find();
      }
      res.render('transaction', { transactions });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

module.exports = router;