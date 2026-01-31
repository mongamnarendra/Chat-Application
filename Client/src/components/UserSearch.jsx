import { useEffect, useState } from "react";
import axios from "axios";
import "../style/UserSearch.css";

const UserSearch = ({ onUserSelect }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:3000/api/v1/auth/getUser/${query}`
        );
        setUsers(res.data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400); // debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="user-search">
      <input
        type="text"
        placeholder="Search users by name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p className="loading">Searching...</p>}

      {users.length > 0 && (
        <div className="results">
          {users.map((user) => (
            <div
              key={user._id}
              className="result-item"
              onClick={() => {
                onUserSelect(user);
                setQuery("");
                setUsers([]);
              }}
            >
              <div className="avatar">
                {user.name[0]}
              </div>
              <div className="info">
                <span className="name">{user.name}</span>
                <span className="email">{user.email}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
