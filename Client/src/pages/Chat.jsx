import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import UserSearch from "../components/UserSearch";
import "../style/Chat.css";

const Chat = () => {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);

  // modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // form states
  const [groupName, setGroupName] = useState("");
  const [message, setMessage] = useState("");

  // fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded = jwtDecode(token);
      setUser(decoded);

      const res = await axios.post(
        "http://localhost:3000/api/v1/chat",
        { userId: decoded.userId }
      );

      setGroups(res.data.list);
    };

    fetchGroups();
  }, []);

  // create group
  const createGroup = async () => {
    if (!groupName.trim()) return;

    await axios.post("http://localhost:3000/api/v1/group/create", {
      groupName,
      userId: user.userId,
    });

    setShowCreateModal(false);
    setGroupName("");

    const res = await axios.post(
      "http://localhost:3000/api/v1/chat",
      { userId: user.userId }
    );
    setGroups(res.data.list);
  };

  // add member (currently only logging)
  const handleUserSelect = (selectedUser) => {
    console.log("Selected user:", selectedUser);
    setShowAddMemberModal(false);
  };

  // send message (UI only for now)
  const sendMessage = () => {
    if (!message.trim()) return;

    console.log("Message sent:", message);
    // later -> socket.emit / api call

    setMessage("");
  };

  if (!user) return <div className="loader">Loading...</div>;

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="user-card">
          <div className="avatar">{user.name[0]}</div>
          <div>
            <h4>{user.name}</h4>
            <span>Online</span>
          </div>
        </div>

        <button
          className="create-group-btn"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Group
        </button>

        <div className="groups">
          {groups.map((g) => (
            <div
              key={g.groupId._id}
              className={`group ${
                activeGroup === g.groupId._id ? "active" : ""
              }`}
              onClick={() => setActiveGroup(g.groupId._id)}
            >
              <div className="group-avatar">
                {g.groupId.groupName[0]}
              </div>
              <span>{g.groupId.groupName}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* CHAT AREA */}
      <main className="chat">
        {!activeGroup ? (
          <div className="empty-state">
            <h2>Select a group</h2>
            <p>Start chatting 🚀</p>
          </div>
        ) : (
          <div className="chat-wrapper">
            {/* HEADER */}
            <div className="chat-header">
              <h3>Group Chat</h3>
              <button
                className="add-member-btn"
                onClick={() => setShowAddMemberModal(true)}
              >
                + Add Members
              </button>
            </div>

            {/* MESSAGES */}
            <div className="messages">
              <p className="placeholder">No messages yet</p>
            </div>

            {/* INPUT */}
            <div className="message-input-container">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />
              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={!message.trim()}
              >
                ➤
              </button>
            </div>
          </div>
        )}
      </main>

      {/* CREATE GROUP MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create New Group</h3>
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="save" onClick={createGroup}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {showAddMemberModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Members</h3>
            <UserSearch onUserSelect={handleUserSelect} />
            <div className="modal-actions">
              <button onClick={() => setShowAddMemberModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
