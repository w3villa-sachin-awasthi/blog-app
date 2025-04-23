const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// Get all posts
router.get('/', postController.getAllPosts);

// Get single post
router.get('/:id', postController.getPost);

// Create post
router.post('/', auth, postController.createPost);

// Update post
router.put('/:id', auth, postController.updatePost);

// Delete post
router.delete('/:id', auth, postController.deletePost);

// Like post
router.post('/:id/like', auth, postController.likePost);

// Unlike post
router.post('/:id/unlike', auth, postController.unlikePost);

module.exports = router; 