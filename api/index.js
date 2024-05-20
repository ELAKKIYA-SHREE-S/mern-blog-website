const express = require('express');
require('dotenv').config();
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');

const salt = bcrypt.genSaltSync(10);
const secret = 'mern-blog-website';

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

const PORT = 4000;
mongoose.connect('mongodb+srv://elakkiyashrees2021csea:sece2021@blogdb.ygegrvr.mongodb.net/?retryWrites=true&w=majority&appName=blogdb',{ useNewUrlParser: true, useUnifiedTopology: true });

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const userDoc = await User.create({
      username,
      password: hashedPassword,
    });
    res.json(userDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: 'Error creating user' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    if (userDoc.password) {
      const passOk = bcrypt.compareSync(password, userDoc.password);
      if (passOk) {
        jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
          if (err) throw err;
          res.cookie('token', token).json({
            id: userDoc._id,
            username,
          });
        });
      } else {
        res.status(400).json({ error: 'Invalid credentials' });
      }
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/profile', (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      console.error(err);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.json(info);
  });
});

app.post('/logout', (req,res) => {
  res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleware.single('file'), async (req,res) => {
  const {originalname,path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path+'.'+ext;
  fs.renameSync(path, newPath);

  const {token} = req.cookies;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) {
      console.error(err);
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const {title,summary,content} = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover:newPath,
      author:info.id,
    });
    res.json(postDoc);
  });

});

app.put('/post',uploadMiddleware.single('file'), async (req,res) => {
  let newPath = null;
  if (req.file) {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  }

  const {token} = req.cookies;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: JWT token is missing' });
  }
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {id,title,summary,content} = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json('you are not the author');
    }
    await Post.updateOne(
      { _id: id, author: info.id },
      {
        $set: {
          title,
          summary,
          content,
          cover: newPath ? newPath : postDoc.cover,
        },
      }
    );

    res.json(postDoc);
  });

});

app.get('/post', async (req,res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(20)
  );
});

app.get('/post/:id', async (req, res) => {
  const {id} = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
})

app.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Deleting post with ID:', id);

  try {
    const { token } = req.cookies;
  
    const decoded = jwt.verify(token, secret);
  
    const post = await Post.findById(id);
  
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
  
    if (decoded.id !== post.author.toString()) {
      return res.status(403).json({ message: 'You are not the author of this post' });
    }
    await post.deleteOne();  
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
})

app.post('/forgot-password', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
      return res.status(404).json({ error: 'User not found. Please check your username.' });
    }

    // User found, update the password
    userDoc.password = bcrypt.hashSync(password, salt);
    await userDoc.save();

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/delete-account', async (req, res) => {
  const { token } = req.cookies;

  try {
    const decoded = jwt.verify(token, secret);
    console.log('Decoded user:', decoded);
    const id = decoded.id;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Delete posts associated with the user
    const deletedPosts = await Post.deleteMany({ author: id });
    console.log('Deleted posts:', deletedPosts);
    // You may also want to delete other associated data or perform cleanup tasks
    res.clearCookie('token').json({ message: 'Account and associated data deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT);