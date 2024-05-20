import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function Post({ _id, title, summary, cover, content, createdAt, author }) {
  const formattedDate = format(new Date(createdAt), 'MMMM d, yyyy');
  const formattedTime = format(new Date(createdAt), 'h:mm a');

  return (
    <div className="post">
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img src={'http://localhost:4000/' + cover} alt="" />
        </Link>
      </div>
      <div className="texts">
        <Link to={`/post/${_id}`} className="post-link">
          <h2>{title}</h2>
        </Link>
        <p className="info">
          <span className="author">{author?.username}</span>
          <time>On {formattedDate} at {formattedTime}</time>
        </p>
        <p className="summary">{summary}</p>
      </div>
    </div>
  );
}