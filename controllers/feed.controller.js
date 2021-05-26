const { validationResult } = require('express-validator');
const Post = require('../models/post');
const errorHelper = require('../utils/error.helper');
const fileHelper = require('../utils/file.helper');

const getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;

    Post.find()
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(posts => {
            res.status(200).json({ message: 'Fetched posts successfully', posts, totalItems });
        })
        .catch(err => {
            errorHelper.handleError(err, next);
        });
};

const getPost = (req, res, next) => {
    const { id } = req.params;
    Post.findById(id)
        .then(post => {
            if (!post) {
                errorHelper.throwError('Cannot find a post', 404);
            }

            res.status(200).json({ message: 'Post fetched', post });
        })
        .catch(err => {
            errorHelper.handleError(err, next);
        });
};

const createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errorHelper.throwError('Validation failed, entered data is incorrect', 422);
    }

    if (!req.file) {
        errorHelper.throwError('No image provided', 422);
    }

    const imageUrl = req.file.path.replace('\\', '/');
    const { title, content } = req.body;

    const post = new Post({
        title,
        content,
        imageUrl,
        creator: { name: 'Vinicius' },
    });

    post.save()
        .then(savedPost => {
            console.log(savedPost);
            res.status(201).json({
                message: 'Post created successfuly!',
                post: savedPost,
            });
        })
        .catch(err => {
            errorHelper.handleError(err, next);
        });
};

const updatePost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errorHelper.throwError('Validation failed, entered data is incorrect', 422);
    }

    const { id } = req.params;
    const { title, content } = req.body;
    let imageUrl = req.body.image;

    if (req.file) {
        imageUrl = req.file.path.replace('\\', '/');
    }
    if (!imageUrl) {
        errorHelper.throwError('No image provided', 422);
    }

    Post.findById(id)
        .then(post => {
            if (!post) {
                errorHelper.throwError('Cannot find a post', 404);
            }

            if (imageUrl !== post.imageUrl) {
                fileHelper.deleteFile(post.imageUrl);
            }

            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;

            return post.save();
        })
        .then(updatedPost => {
            console.log(updatedPost);
            res.status(200).json({ message: 'Post updated', post: updatedPost });
        })
        .catch(err => {
            errorHelper.handleError(err, next);
        });
};

const deletePost = (req, res, next) => {
    const { id } = req.params;
    Post.findById(id)
        .then(post => {
            if (!post) {
                errorHelper.throwError('Cannot find a post', 404);
            }

            // check logged user

            fileHelper.deleteFile(post.imageUrl);
            return Post.findByIdAndDelete(id);
        })
        .then(deletePost => {
            res.status(200).json({ message: 'Post deleted', post: deletePost });
        })
        .catch(err => {
            errorHelper.handleError(err, next);
        });
};

module.exports = {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
};
