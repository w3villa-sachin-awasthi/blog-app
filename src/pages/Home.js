import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import { Favorite, FavoriteBorder, Comment } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleLike = async (postId) => {
    if (!user) return;
    try {
      const post = posts.find(p => p._id === postId);
      const endpoint = post.likes.includes(user._id) ? 'unlike' : 'like';
      await axios.post(`http://localhost:5000/api/posts/${postId}/${endpoint}`);
      fetchPosts();
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} key={post._id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  By {post.author.username} • {new Date(post.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body1" paragraph>
                  {post.content.substring(0, 200)}...
                </Typography>
              </CardContent>
              <CardActions>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    onClick={() => handleLike(post._id)}
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
                    {post.likes.length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <IconButton>
                    <Comment />
                  </IconButton>
                  <Typography variant="body2">
                    {post.comments.length}
                  </Typography>
                </Box>
                <Button
                  component={RouterLink}
                  to={`/posts/${post._id}`}
                  sx={{ ml: 'auto' }}
                >
                  Read More
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home; 