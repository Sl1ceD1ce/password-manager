import { Link, Copy, Eye, EyeClosed, Edit, Trash } from "iconoir-react";
import { useState } from "react";

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};

export default function PostsContainer({ website, username, password }) {
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());

  const togglePasswordVisibility = (id) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisiblePasswords(newVisible);
  };

  // update formatting
  return (
    <div className="posts">
      <div className="password-field">
        <label>Website:</label>
        <div className="field-container">
          <a
            href={website}
            className="field-value"
            target="_blank"
            rel="noopener noreferrer"
          >
            {website}
          </a>
          <button
            className="action-btn"
            onClick={() => window.open(website, "_blank")}
          >
            <Link size={14} />
          </button>
        </div>
      </div>
      <div className="password-field">
        <label>Username:</label>
        <div className="field-container">
          <span className="field-value">{username}</span>
          <button
            className="action-btn"
            onClick={() => copyToClipboard(username)}
          >
            <Copy size={14} />
          </button>
        </div>
      </div>
      <div className="password-field">
        <label>Password:</label>
        <div className="field-container">
          <span className="field-value">
            {visiblePasswords.has(password) ? password : "••••••••••••••"}
          </span>
          <div className="password-actions">
            <button
              className="action-btn"
              onClick={() => togglePasswordVisibility(password)}
            >
              {visiblePasswords.has(password) ? (
                <Eye size={14} />
              ) : (
                <EyeClosed size={14} />
              )}
            </button>
            <button
              className="action-btn"
              onClick={() => copyToClipboard(password)}
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      </div>
      <div className="card-actions">
        <button
          className="edit-btn"
          // onClick={() => handleEditPassword(password)}
          title="Edit password"
        >
          <Edit size={14} />
          Edit
        </button>
        <button
          className="delete-btn"
          // onClick={() => handleDeletePassword(password)}
          title="Delete password"
        >
          <Trash size={14} />
          Delete
        </button>
      </div>
    </div>
  );
}
