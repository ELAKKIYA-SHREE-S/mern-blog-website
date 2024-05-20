import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format} from "date-fns";
import { UserContext } from "../UserContext";
import { Link } from "react-router-dom";
import axios from 'axios';

// Custom hook for handling post deletion
const useDeletePost = (postId, navigate) => {
  const [deleteMessage, setDeleteMessage] = useState("");
  const [postDeleted, setPostDeleted] = useState(false);

  const deletePost = async () => {
    try {
      setDeleteMessage("Deleting blog..."); // Show loading message
      const response = await axios.delete(`http://localhost:4000/delete/${postId}`, {
        withCredentials: true, // Include credentials for cross-origin requests
      });

      if (response.status === 200) {
        setDeleteMessage(""); // Clear any existing error messages
        setPostDeleted(true); // Update postDeleted state
      } else {
        console.error("Error deleting post:", response.statusText);
        setDeleteMessage("Error deleting blog. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting post:", error.message);
      setDeleteMessage("Error deleting blog. Please try again.");
    }
  };

  return { deletePost, deleteMessage, postDeleted };
};

// Main PostPage component
export default function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const { userInfo } = useContext(UserContext);
  const { id } = useParams();
  const navigate = useNavigate(); // Move useNavigate here
  const { deletePost, deleteMessage, postDeleted } = useDeletePost(id, navigate);

  const handleDeleteClick = () => {
    // Use window.confirm to show a browser-native confirmation dialog
    const isConfirmed = window.confirm("If you DELETE this post you cannot access it back. Want to proceed ?");
    
    if (isConfirmed) {
      // User confirmed, proceed with post deletion
      deletePost();
    } else {
      // User canceled the deletion
      // You can add additional logic or UI updates if needed
      console.log("Deletion canceled by user");
    }
  };
  // Fetch post information and handle post deletion on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/post/${id}`);
        if (response.status === 200) { // Check if the response status is 200 (OK)
          const postInfo = response.data; // Use response.data to get the data from the response
          setPostInfo(postInfo);
        } else {
          console.error("Error fetching post:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching post:", error.message);
      }
    };    

    fetchData();

    // Handle post deletion
    if (postDeleted) {
      navigate("/");
    }
  }, [id, navigate, postDeleted]);

  // Return loading indicator if postInfo is not available yet
  if (!postInfo) {
    return <p>Loading...</p>; // Add loading indicator or handle differently
  }

  // Destructure properties from postInfo safely
  const { title, createdAt, author, _id, cover, content } = postInfo;
  
  const formattedDate = format(new Date(createdAt), 'MMMM d, yyyy');
  const formattedTime = format(new Date(createdAt), 'h:mm a');

  return (
    <div className="post-page">
      <h1>{title || "Untitled"}</h1>
      <time>On {formattedDate} at {formattedTime}</time>
      <div className="author">By @{author?.username || "Unknown"}</div>
      {userInfo && userInfo.id === (author?._id || "") && (
        <div className="edit-row">
          <Link className="edit-btn" to={`/edit/${_id}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Edit this post
          </Link>
        </div>
      )}
      <div className="image">
        <img src={`http://localhost:4000/${cover}`} alt="" />
      </div>
      <div className="content" dangerouslySetInnerHTML={{ __html: content }} />
      <div className="delete-row">
        {userInfo && userInfo.id === (author?._id || "") && (
          <button className="delete-btn" onClick={handleDeleteClick}>
            Delete this post
          </button>
        )}
        {deleteMessage && <p>{deleteMessage}</p>}
      </div>
    </div>
  );
}