import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  IconButton,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
} from '@mui/material';
import { Favorite, FavoriteBorder, Delete, Reply, ExpandMore, ExpandLess } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Comment = ({ comment, onReply, onDelete, level = 0 }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const { user } = useAuth();

  const fetchReplies = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/comments/${comment._id}/replies`);
      setReplies(response.data);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/comments', {
        content: replyContent,
        postId: comment.post,
        parentCommentId: comment._id,
      });
      setReplyContent('');
      setReplying(false);
      fetchReplies();
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  return (
    <Box sx={{ ml: level * 2 }}>
      <ListItem alignItems="flex-start">
        <ListItemText
          primary={comment.author.username}
          secondary={
            <>
              <Typography
                component="span"
                variant="body2"
                color="textSecondary"
              >
                {new Date(comment.createdAt).toLocaleDateString()} •{' '}
              </Typography>
              {comment.content}
            </>
          }
        />
        {user && (
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              onClick={() => setReplying(!replying)}
              size="small"
            >
              <Reply />
            </IconButton>
            {comment.replies.length > 0 && (
              <IconButton
                edge="end"
                onClick={() => {
                  setShowReplies(!showReplies);
                  if (!showReplies) {
                    fetchReplies();
                  }
                }}
                size="small"
              >
                {showReplies ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
            {user._id === comment.author._id && (
              <IconButton
                edge="end"
                onClick={() => onDelete(comment._id)}
                size="small"
              >
                <Delete />
              </IconButton>
            )}
          </ListItemSecondaryAction>
        )}
      </ListItem>

      {replying && (
        <Box sx={{ ml: 2, mb: 2 }}>
          <form onSubmit={handleReply}>
            <TextField
              fullWidth
              label="Reply"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              margin="normal"
              required
              multiline
              rows={2}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              sx={{ mt: 1 }}
            >
              Post Reply
            </Button>
          </form>
        </Box>
      )}

      <Collapse in={showReplies}>
        <List>
          {replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </List>
      </Collapse>
    </Box>
  );
};

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/');
    }
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      const endpoint = post.likes.includes(user._id) ? 'unlike' : 'like';
      await axios.post(`http://localhost:5000/api/posts/${id}/${endpoint}`);
      fetchPost();
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await axios.post('http://localhost:5000/api/comments', {
        content: comment,
        postId: id,
      });
      setComment('');
      fetchPost();
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`);
      fetchPost();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (!post) return null;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {post.title}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            By {post.author.username} • {new Date(post.createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            {post.content}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <IconButton
              onClick={handleLike}
              color={user && post.likes.includes(user._id) ? 'secondary' : 'default'}
              disabled={!user}
            >
              {user && post.likes.includes(user._id) ? (
                <Favorite />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>
            <Typography variant="body2">
              {post.likes.length} likes
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Comments
          </Typography>
          {user ? (
            <form onSubmit={handleComment}>
              <TextField
                fullWidth
                label="Add a comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                margin="normal"
                required
                multiline
                rows={3}
              />
              {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 1 }}
              >
                Post Comment
              </Button>
            </form>
          ) : (
            <Typography color="textSecondary">
              Please log in to comment
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          <List>
            {post.comments.map((comment) => (
              <Comment
                key={comment._id}
                comment={comment}
                onReply={handleComment}
                onDelete={handleDeleteComment}
              />
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default PostDetail; 