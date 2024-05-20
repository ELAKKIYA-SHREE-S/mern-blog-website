import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Editor from "../Editor";
import axios from 'axios';

export default function EditPost() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState('');
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:4000/post/${id}`)
    .then(response => {
      const postInfo = response.data; // Parse the response data directly
      setTitle(postInfo.title);
      setSummary(postInfo.summary);
      setContent(postInfo.content);
    }).catch(error => {
        console.error('Error fetching post:', error);
      });
  }, [id]);

  // In the updatePost function, add a check for token existence
  async function updatePost(ev) {
    ev.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('JWT token not found');
      // Handle the case where the token is not found, such as redirecting to login
      return;
    }
  
    const data = new FormData();
    data.set('title', title);
    data.set('summary', summary);
    data.set('content', content);
    data.set('id', id);
    if (files?.[0]) {
      data.set('file', files[0]);
    }
  
    try {
      const response = await fetch(`http://localhost:4000/post`, {
        method: 'PUT',
      body: data,
      credentials: 'include',
      });
      if (response.status === 200) {
        setRedirect(true);
      } else {
        console.error('Failed to update post:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating post:', error.message);
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized: JWT token invalid or expired');
        // Handle token expiration or invalidity, such as redirecting to login
      }
    }
  }  

  if (redirect) {
    return <Navigate to={`/post/${id}`} />;
  }

  return (
    <form className="editpost" onSubmit={updatePost}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={ev => setTitle(ev.target.value)}
      />
      <input
        type="text"
        placeholder="Summary"
        value={summary}
        onChange={ev => setSummary(ev.target.value)}
      />
      <input type="file" onChange={ev => setFiles(ev.target.files)} />
      <Editor value={content} onChange={setContent} />
      <button type="submit">Update Post</button>
    </form>
  );
}