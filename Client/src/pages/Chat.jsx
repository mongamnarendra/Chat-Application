import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "../style/Chat.css";
import ChatSpace from "../components/ChatSpace";
import socket from "../socket";

const Chat = () => {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);

  // modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");

  // ================= FETCH GROUPS =================
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

  // ================= REAL-TIME SIDEBAR UPDATE =================
  useEffect(() => {
    socket.on("receive-message", (msg) => {
      setGroups((prev) =>
        prev.map((g) =>
          g.groupId._id === msg.groupId
            ? { ...g, lastMessage: msg }
            : g
        )
      );
    });

    return () => socket.off("receive-message");
  }, []);

  // ================= CREATE GROUP =================
  const createGroup = async () => {
    if (!groupName.trim()) return;

    await axios.post("http://localhost:3000/api/v1/chat/createGroup", {
      name: groupName,
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

  if (!user) return <div className="loader">Loading...</div>;

  return (
    <div className="app">
      {/* ================= SIDEBAR ================= */}
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
          {groups.map((g) => {
            const gid = g.groupId._id.toString();
            const lastMsg = g.lastMessage;

            return (
              <div
                key={gid}
                className={`group ${
                  activeGroup === gid ? "active" : ""
                }`}
                onClick={() => setActiveGroup(gid)}
              >
                <div className="group-avatar">
                  {g.groupId.groupName[0]}
                </div>

                <div className="group-info">
                  <div className="group-top">
                    <span className="group-name">
                      {g.groupId.groupName}
                    </span>

                    {lastMsg && (
                      <span className="group-time">
                        {new Date(lastMsg.createdAt).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    )}
                  </div>

                  <div className="group-last-message">
                    {lastMsg
                      ? lastMsg.message
                      : "No messages yet"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ================= CHAT AREA ================= */}
      <main className="chat">
        {!activeGroup ? (
          <div className="empty-state">
            <h2>Select a group</h2>
            <p>Start chatting 🚀</p>
          </div>
        ) : (
          <ChatSpace
            user={user}
            groupId={activeGroup}
          />
        )}
      </main>

      {/* ================= CREATE GROUP MODAL ================= */}
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
    </div>
  );
};

export default Chat;
