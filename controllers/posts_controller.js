const {
    getAllPosts,
    getPostById,
    addPost,
    deletePost,
    updatePost,
    getAllComments,
    addComment,
    updateComment,
    deleteComment
} = require('../utils/utilities');

const getPosts = function (req, res) {
    // execute the query from getAllPosts
    getAllPosts(req).
    sort({
        modified_date: -1
    }).
    exec((err, posts) => {
        if (err) {
            res.status(500);
            res.json({
                error: err.message
            });
        }
        res.send(posts);
    });
};

const getPost = function (req, res) {
    // execute the query from getPostById
    getPostById(req).exec((err, post) => {
        if (err) {
            res.status(404);
            res.send("Post not found");
        }
        res.send(post);
    });
};

const makePost = function (req, res) {
    // add the username from req.user
    req.body.username = req.user.username;
    // save the Post instance from addPost
    addPost(req).save((err, post) => {
        if (err) {
            res.status(500);
            res.json({
                error: err.message
            });
        }
        res.status(201);
        res.send(post);
    });
};

const removePost = function (req, res) {
    // execute the query from deletePost
    deletePost(req.params.id).exec((err) => {
        if (err) {
            res.status(500);
            res.json({
                error: err.message
            });
        }
        res.sendStatus(204);

    });
};

const changePost = function (req, res) {
    // execute the query from updatePost
    updatePost(req).exec((err, post) => {
        if (err) {
            res.status(500);
            res.json({
                error: err.message
            });
        }
        res.status(200);
        res.send(post);
    });
};

// get all comments on a post
const getComments = function (req, res) {
    // Check for error from middleware
    if (req.error) {
        res.status(req.error.status);
        res.send(req.error.message);
    } else {
        // resolve the promise from getAllComments
        getAllComments(req).then((comments) => {
            res.status(200);
            res.send(comments);
        }).catch((err) => {
            res.status(500);
            res.json({
                error: err.message
            });
        });
    }
};


// make a comment on a post
const makeComment = function (req, res) {
    // Check for error from middleware
    if (req.error) {
        res.status(req.error.status);
        res.send(req.error.message);
    } else {
        // resolve the promise from addComment
        // Add username to the request from the session
        req.body.username = req.user.username;
        addComment(req).then((post) => {
            res.status(200);
            res.send(post);
        }).catch((err) => {
            res.status(500);
            res.json({
                error: err.message
            });
        });
    }
}

// change a comment on a post
const changeComment = function (req, res) {
    // Check for error from middleware
    if (req.error) {
        res.status(req.error.status);
        res.send(req.error.message);
    } else {
        updateComment(req).then((comment) => {
            res.status(200);
            res.send(comment)
        }).catch((err) => {
            res.status(500);
            res.json({
                error: err.message
            })
        })
    }
}


// delete a comment on a post
const removeComment = function (req, res) {
    // Check for error from middleware
    if (req.error) {
        res.status(req.error.status);
        res.send(req.error.message);
    } else {
        deleteComment(req).then(() => {
            res.sendStatus(204);
        }).catch((err) => {

            res.status(500);
            res.json({
                error: err.message
            });


        })
    }
}

const userAuthenticated = function (req, res, next) {
    console.log(`user authenticated req body: ${req.user}`);
    if (req.isAuthenticated()) {
        next();
    } else {
        res.sendStatus(403);
    }
}

const verifyAdmin = function (req, res, next) {
    // If post owner isn't currently logged in user, send forbidden

    if (req.user.role === 'admin') {
        next();
    } else {
        res.sendStatus(403);
    }
}

const verifyOwner = function (req, res, next) {
    if (req.user.role === 'admin') {
        console.log('have admin user in middleware')
        next();
    } else {
        let post = Post.findOne({
            "comments._id": req.params.id
        }).exec((err, post) => {
            if (err) {
                req.error = {
                    message: 'Post not found',
                    status: 404
                }
                next();
            }
            console.log("post:", post)
            let comment = post.comments.id(req.params.id);
            if (req.user.username !== comment.username) {
                req.error = {
                    message: 'You do not have permission to modify this comment',
                    status: 403
                };
            }
            next();
        });
    }
}

module.exports = {
    getPosts,
    getPost,
    makePost,
    removePost,
    changePost,
    getComments,
    makeComment,
    changeComment,
    removeComment,
    userAuthenticated,
    verifyAdmin,
    verifyOwner
};