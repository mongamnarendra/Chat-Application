import { useEffect, useRef, useState } from "react";
import socket from "../socket";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import UserSearch from "./UserSearch";

const ChatSpace = ({ user, groupId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [addedMember, setAddedMember] = useState("");

  // panels & menus
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [activeMemberMenu, setActiveMemberMenu] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // emoji
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);

  // refs
  const messagesRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ================= FETCH MESSAGES + SOCKET =================
  useEffect(() => {
    if (!user || !groupId) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `http://localhost:3000/api/v1/chat/messages/${groupId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error("Fetch messages failed:", err);
        if (err.response?.status === 401) {
          alert("Session expired. Please login again.");
        }
      }
    };


    setMessages([]);
    fetchMessages();

    if (!socket.connected) socket.connect();
    socket.emit("join-group", { groupId });

    const handleReceiveMessage = (data) => {
      if (data.groupId === groupId) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.emit("leave-group", { groupId });
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [groupId, user]);

  // ================= AUTO SCROLL =================
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop =
        messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // ================= TYPING =================
  useEffect(() => {
    const handleTyping = ({ userName }) => {
      setTypingUser(userName);
      setTimeout(() => setTypingUser(""), 1500);
    };

    socket.on("typing-feedback", handleTyping);
    return () => socket.off("typing-feedback", handleTyping);
  }, []);

  // ================= FETCH MEMBERS =================
  useEffect(() => {
    if (!groupId) return;
    fetchGroupMembers();
  }, [groupId]);

  const fetchGroupMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3000/api/v1/group/group-members",
        { groupId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGroupMembers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= MARK SEEN =================
  useEffect(() => {
    if (!groupId || !user || messages.length === 0) return;

    const hasUnseen = messages.some(
      (msg) =>
        msg.senderId !== user.userId &&
        msg.status !== "seen"
    );

    if (hasUnseen) {
      socket.emit("mark-seen", {
        groupId,
        userId: user.userId,
      });
    }
  }, [groupId, messages, user.userId]);

  // ================= STATUS UPDATES =================
  useEffect(() => {
    socket.on("message-delivered", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, status: "delivered" }
            : m
        )
      );
    });

    socket.on("messages-seen", () => {
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === user.userId &&
            m.status !== "seen"
            ? { ...m, status: "seen" }
            : m
        )
      );
    });

    return () => {
      socket.off("message-delivered");
      socket.off("messages-seen");
    };
  }, [user.userId]);

  // ================= ADD MEMBER =================
  const handleAddMember = async (selectedUser) => {
    try {
      setAddedMember("");
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:3000/api/v1/group/add-member",
        {
          groupId,
          userId: selectedUser._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAddedMember(res.data.data.userId.name);

      fetchGroupMembers();
      setShowAddMemberModal(false);
    } catch (err) {
      if (err.response?.status === 409) {
        alert("User already in group");
      } else {
        alert("Failed to add member");
      }
    }
  };

  // ================= EMOJI =================
  const addEmoji = (emojiData) => {
    const cursor = inputRef.current.selectionStart;
    const text =
      message.slice(0, cursor) +
      emojiData.emoji +
      message.slice(cursor);

    setMessage(text);

    setTimeout(() => {
      inputRef.current.focus();
      inputRef.current.selectionStart =
        inputRef.current.selectionEnd =
        cursor + emojiData.emoji.length;
    }, 0);
  };

  // ================= INPUT =================
  const handleChange = (e) => {
    setMessage(e.target.value);

    if (typingTimeoutRef.current)
      clearTimeout(typingTimeoutRef.current);

    socket.emit("typing", {
      groupId,
      userName: user.name,
    });

    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 1000);
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send-message", {
      groupId,
      message,
      senderId: user.userId,
      senderName: user.name,
    });

    setMessage("");
    setShowEmojiPicker(false);
    setAddedMember("")
  };

  const isAdmin = groupMembers.some(
    (m) =>
      m.userId._id === user.userId &&
      m.role === "admin"
  );

  const makeAdmin = async (memberId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:3000/api/v1/group/make-admin",
        {
          groupId,
          userId: memberId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setActiveMemberMenu(null);
      fetchGroupMembers();
    } catch (err) {
      console.error("Make admin failed:", err);
      alert("Failed to make admin");
    }
  };

  const removeMember = async (memberId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:3000/api/v1/group/remove-member",
        {
          groupId,
          userId: memberId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setActiveMemberMenu(null);
      fetchGroupMembers();
    } catch (err) {
      console.error("Remove member failed:", err);
      alert("Failed to remove member");
    }
  };


  return (
    <>
      <div className="chat-wrapper">
        {/* HEADER */}
        <div className="chat-header">
          <h3>Group Chat</h3>
          {typingUser && (
            <span className="typing-indicator">
              {typingUser} is typing...
            </span>
          )}
          <button
            className="icon-btn"
            onClick={() => setShowMembersPanel(true)}
          >
            ⋮
          </button>
        </div>

        {/* MESSAGES */}
        <div className="messages" ref={messagesRef}>
          {messages.length === 0 ? (
            <p className="placeholder">No messages yet</p>
          ) : (
            messages.map((msg) => {
              if (msg.type === "system") {
                return (
                  <div key={msg._id} className="system-message">
                    🔔 {msg.message}
                  </div>
                );
              }
              const isSelf = msg.senderId === user.userId;
              const time = new Date(
                msg.createdAt
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={msg._id}
                  className={`message-row ${isSelf ? "right" : "left"
                    }`}
                >
                  <div
                    className={`message-bubble ${isSelf ? "self" : "other"
                      }`}
                  >
                    <span className="sender-name">
                      {msg.senderName}
                    </span>

                    <span className="message-text">
                      {msg.message}
                    </span>

                    <div className="message-meta">
                      <span className="message-time">
                        {time}
                      </span>
                      {isSelf && (
                        <span
                          className={`message-status ${msg.status}`}
                        >
                          {msg.status === "sent" && "✓"}
                          {msg.status === "delivered" && "✓✓"}
                          {msg.status === "seen" && "✓✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              );
            })
          )}
        </div>

        {/* INPUT */}
        <div className="message-input-container">
          <div className="input-box">
            <button
              className="emoji-btn"
              onClick={() =>
                setShowEmojiPicker((p) => !p)
              }
            >
              😊
            </button>

            <input
              ref={inputRef}
              value={message}
              onChange={handleChange}
              placeholder="Type a message..."
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessage()
              }
            />

            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!message.trim()}
            >
              ➤
            </button>
          </div>

          {showEmojiPicker && (
            <div className="emoji-picker-container">
              <EmojiPicker
                onEmojiClick={addEmoji}
                theme="dark"
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>
      </div>

      {/* MEMBERS PANEL */}
      <div
        className={`members-panel ${showMembersPanel ? "open" : ""
          }`}
      >
        <div className="members-header">
          <h3>Group Members</h3>
          {isAdmin && (
            <button
              className="add-member-btn"
              onClick={() => {
                setShowMembersPanel(false);
                setShowAddMemberModal(true);
              }}
            >
              + Add Member
            </button>
          )}
          <button
            className="close-btn"
            onClick={() => setShowMembersPanel(false)}
          >
            ✕
          </button>
        </div>

        <div className="members-list">
          {groupMembers.map((member) => {
            const isSelf = member.userId._id === user.userId;

            return (
              <div key={member._id} className="member-row">
                <div>
                  <p className="member-name">
                    {member.userId.name}
                  </p>
                  <span className={`role ${member.role}`}>
                    {member.role}
                  </span>
                </div>

                {/* Admin controls */}
                {isAdmin && !isSelf && (
                  <button
                    className="icon-btn"
                    onClick={() =>
                      setActiveMemberMenu(
                        activeMemberMenu === member._id
                          ? null
                          : member._id
                      )
                    }
                  >
                    ⋮
                  </button>
                )}

                {/* Dropdown menu */}
                {isAdmin && activeMemberMenu === member._id && (
                  <div className="member-menu">
                    {member.role !== "admin" && (
                      <button
                        onClick={() =>
                          makeAdmin(member.userId._id)
                        }
                      >
                        Make Admin
                      </button>
                    )}

                    <button
                      className="danger"
                      onClick={() =>
                        removeMember(member.userId._id)
                      }
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* ADD MEMBER MODAL */}
      {showAddMemberModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Members</h3>
            <UserSearch onUserSelect={handleAddMember} />
            <button
              onClick={() => setShowAddMemberModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatSpace;
