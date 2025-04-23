const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

// Create comment
router.post('/', auth, commentController.createComment);

// Update comment
router.put('/:id', auth, commentController.updateComment);

// Delete comment
router.delete('/:id', auth, commentController.deleteComment);

// Get comment replies
router.get('/:id/replies', commentController.getCommentReplies);

module.exports = router; 