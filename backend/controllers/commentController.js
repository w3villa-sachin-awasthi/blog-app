const Comment = require('../models/Comment');
const Post = require('../models/Post');

exports.createComment = async (req, res) => {
    try {
        const { content, postId, parentCommentId } = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = new Comment({
            content,
            author: req.user._id,
            post: postId,
            parentComment: parentCommentId || null
        });

        await comment.save();

        // If this is a reply to another comment, update the parent comment
        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (parentComment) {
                parentComment.replies.push(comment._id);
                await parentComment.save();
            }
        } else {
            // If it's a top-level comment, add it to the post
            post.comments.push(comment._id);
            await post.save();
        }

        res.status(201).json(comment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateComment = async (req, res) => {
    try {
        const { content } = req.body;
        const comment = await Comment.findOneAndUpdate(
            { _id: req.params.id, author: req.user._id },
            { content, updatedAt: Date.now() },
            { new: true }
        );
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json(comment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findOne({
            _id: req.params.id,
            author: req.user._id
        });
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // If this is a top-level comment, remove it from the post
        if (!comment.parentComment) {
            await Post.findByIdAndUpdate(comment.post, {
                $pull: { comments: comment._id }
            });
        } else {
            // If this is a reply, remove it from the parent comment's replies
            await Comment.findByIdAndUpdate(comment.parentComment, {
                $pull: { replies: comment._id }
            });
        }

        // Delete all replies recursively
        const deleteReplies = async (commentId) => {
            const replies = await Comment.find({ parentComment: commentId });
            for (const reply of replies) {
                await deleteReplies(reply._id);
                await Comment.findByIdAndDelete(reply._id);
            }
        };
        await deleteReplies(comment._id);

        // Delete the comment itself
        await Comment.findByIdAndDelete(comment._id);

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCommentReplies = async (req, res) => {
    try {
        const replies = await Comment.find({ parentComment: req.params.id })
            .populate('author', 'username')
            .sort({ createdAt: 1 });
        res.json(replies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 