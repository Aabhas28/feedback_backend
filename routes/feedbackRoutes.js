// routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const Feedback = require('../modal/Feedback');
const jwt = require('jsonwebtoken');


// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers?.authorization?.split(' ')[1];
  if (!token) return res.status(400).json({ status: false, message: "Access Denied" });

  jwt.verify(token, process.env.SECRETOKEN, (err, decoded) => {
    if (err) return res.status(403).json({ status: false, message: "Invalid Token" });
    req.userId = decoded.id;
    next();
  });
};

// POST: Submit Feedback
router.post('/submit', verifyToken, async (req, res) => {
  try {
    console.log("Received data:", req.body);

    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create new feedback
    const feedback = new Feedback({
      user: req.userId,
      product: productId,
      rating,
      comment
    });

    await feedback.save();

    res.status(201).json({ status: true, message: "Feedback submitted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: "Failed to submit feedback", error: error.message });
  }
});

router.get('/product/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
     
      // Find feedback for the product with pagination
      const feedbacks = await Feedback.find({ product: productId })
      .populate('user', 'name') // Populate the 'user' field, only selecting 'name'
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
        
       
        console.log(feedbacks);
        console.log(req.query.limit)
        console.log(limit)
  
      const totalFeedbacks = await Feedback.countDocuments({ product: productId });
  
      res.status(200).json({
        status: true,
        feedbacks,
        totalPages: Math.ceil(totalFeedbacks / limit),
        currentPage: page,
      });
    } catch (error) {
      res.status(500).json({ status: false, message: "Failed to retrieve feedback", error: error.message });
    }
  });

  // routes/feedbackRoutes.js
router.get('/product/rating/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
  
      // Fetch only the ratings for the specified product
      const ratings = await Feedback.find({ product: productId }).select('rating -_id');
      console.log(ratings)
      // Select only the 'rating' field, exclude '_id'
  
      // Calculate the average rating
      const totalRatings = ratings.reduce((acc, feedback) => acc + feedback.rating, 0);
      const averageRating = ratings.length > 0 ? (totalRatings / ratings.length).toFixed(1) : 0;
  
      res.status(200).json({
        status: true,
        averageRating, // Return the average rating
      });
    } catch (error) {
      res.status(500).json({ status: false, message: "Failed to retrieve ratings", error: error.message });
    }
  });
  


module.exports = router;
