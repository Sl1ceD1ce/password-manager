import { useEffect, useState } from "react";
import PostsContainer from "../components/PostsContainer";
import { Link } from "react-router-dom";
import { Plus } from "iconoir-react";

export default function DashboardPage() {
  const [passwords, setPasswords] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/post", {
      credentials: "include",
      method: "GET",
    }).then((response) => {
      response.json().then((posts) => {
        setPasswords(posts);
      });
    });
  }, []);

  return (
    <>
      <div className="dashboard-container">
        <h2 className="header"> Passwords:</h2>
        <div className="create-post-button">
          <Link to="/create" className="add-link">
            <span>Add</span>
            <Plus color="white" />
          </Link>
        </div>
      </div>

      <div className="posts-container">
        {passwords.length > 0 &&
          passwords.map((post, index) => (
            <PostsContainer key={index} {...post} />
          ))}
      </div>
    </>
  );
}
