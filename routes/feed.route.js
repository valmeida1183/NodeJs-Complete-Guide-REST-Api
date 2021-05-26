const express = require('express');
const { body } = require('express-validator');

const feedController = require('../controllers/feed.controller');

const router = express.Router();

// /feed/post
router.get('/posts', feedController.getPosts);
router.get('/posts/:id', feedController.getPost);

router.post(
    '/posts',
    [body('title').trim().isLength({ min: 5 }), body('content').trim().isLength({ min: 5 })],
    feedController.createPost
);

router.put(
    '/posts/:id',
    [body('title').trim().isLength({ min: 5 }), body('content').trim().isLength({ min: 5 })],
    feedController.updatePost
);

router.delete('/posts/:id', feedController.deletePost);

module.exports = router;
