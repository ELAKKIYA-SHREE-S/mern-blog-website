import Post from "../Post";
import { useEffect, useState } from "react";
import axios from 'axios';

export default function IndexPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:4000/post').then(response => {
        setPosts(response.data);
    });
  }, []);

  return (
    <div className="allposts">
      {posts.length <= 0 ? (
        <h2>No Posts yet !!</h2>
      ) : (
        posts.map(post => (
          <Post key={post._id} {...post} />
        ))
      )}
    </div>
  );
}