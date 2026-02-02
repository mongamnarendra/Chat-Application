import { useEffect, useRef, useState } from "react";
import socket from "../socket";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";






const ChatSpace = ({ user, groupId, onAddMembers }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  // ===== MEMBERS PANEL STATES =====
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [activeMemberMenu, setActiveMemberMenu] = useState(null);

  const messagesRef = useRef(null);
  const typingTimeoutRef = useRef(null);


  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);


  // ================= FETCH + SOCKET =================
  useEffect(() => {
    if (!user || !groupId) return;

    const fetchMessages = async () => {
      const res = await fetch(
        `http://localhost:3000/api/v1/chat/messages/${groupId}`
      );
      const data = await res.json();

      if (data.success) {
        setMessages(data.messages);
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

  // ================= TYPING FEEDBACK =================
  useEffect(() => {
    const handleTyping = ({ userName }) => {
      setTypingUser(userName);
      setTimeout(() => setTypingUser(""), 1500);
    };

    socket.on("typing-feedback", handleTyping);
    return () => socket.off("typing-feedback", handleTyping);
  }, []);

  useEffect(() => {
    if (!groupId) return;

    setGroupMembers([]);
    fetchGroupMembers();
  }, [groupId]);

  useEffect(() => {
    window.refreshGroupMembers = fetchGroupMembers;

    return () => {
      delete window.refreshGroupMembers;
    };
  }, [groupId]);

  useEffect(() => {
    if (!groupId || !user || messages.length === 0) return;

    // check if there are unseen messages from OTHER users
    const hasUnseenMessages = messages.some(
      (msg) =>
        msg.senderId !== user.userId &&
        msg.status !== "seen"
    );

    if (hasUnseenMessages) {
      socket.emit("mark-seen", {
        groupId,
        userId: user.userId,
      });
    }
  }, [groupId, messages, user.userId]);


  useEffect(() => {
    socket.on("message-delivered", ({ messageId }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId
            ? { ...msg, status: "delivered" }
            : msg
        )
      );
    });

    socket.on("messages-seen", ({ seenBy }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === user.userId && msg.status !== "seen"
            ? { ...msg, status: "seen" }
            : msg
        )
      );
    });


    return () => {
      socket.off("message-delivered");
      socket.off("messages-seen");
    };
  }, []);







  const fetchGroupMembers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:3000/api/v1/group/group-members",
        { groupId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setGroupMembers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addEmoji = (emojiData) => {
    const cursorPos = inputRef.current.selectionStart;

    const newMessage =
      message.slice(0, cursorPos) +
      emojiData.emoji +
      message.slice(cursorPos);

    setMessage(newMessage);

    setTimeout(() => {
      inputRef.current.focus();
      inputRef.current.selectionStart =
        inputRef.current.selectionEnd =
        cursorPos + emojiData.emoji.length;
    }, 0);
  };


  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setMessage(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit("typing", {
      groupId,
      userName: user.name,
    });

    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 1000);
  };

  // ================= SEND MESSAGE =================
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
  };

  const isAdmin = groupMembers.some(
    (m) => m.userId._id === user.userId && m.role === "admin"
  );

  const makeAdmin = async (memberId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:3000/api/v1/group/make-admin",
        {
          groupId,
          userId: memberId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res)

      setActiveMemberMenu(null);
      fetchGroupMembers(); // refresh UI
    } catch (err) {
      console.error(err);
    }
  }

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActiveMemberMenu(null);
      fetchGroupMembers();
    } catch (err) {
      console.error(err);
    }
  }


  return (
    <>
      <div className="chat-wrapper">
        {/* ================= HEADER ================= */}
        <div className="chat-header">
          <h3>Group Chat</h3>

          {typingUser && (
            <span className="typing-indicator">
              {typingUser} is typing...
            </span>
          )}

          <div className="header-actions">
            <button
              className="icon-btn"
              onClick={() => setShowMembersPanel(true)}
            >
              ⋮
            </button>
          </div>
        </div>

        {/* ================= MESSAGES ================= */}
        <div className="messages" ref={messagesRef}>
          {messages.length === 0 ? (
            <p className="placeholder">No messages yet</p>
          ) : (
            messages.map((msg, index) => {
              const isSelf = msg.senderId === user.userId;
              const time = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={index}
                  className={`message-row ${isSelf ? "right" : "left"}`}
                >
                  <div className={`message-bubble ${isSelf ? "self" : "other"}`}>
                    <span className="sender-name">{msg.senderName}</span>

                    <span className="message-text">{msg.message}</span>

                    <div className="message-meta">
                      <span className="message-time">{time}</span>

                      {isSelf && (
                        <span className={`message-status ${msg.status}`}>
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

        {/* ================= INPUT ================= */}
        <div className="message-input-container">
          <div className="input-box">
            <button
              className="emoji-btn"
              onClick={() => setShowEmojiPicker((p) => !p)}
            >
              😊
            </button>

            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
                searchDisabled={false}
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>


      </div>

      {/* ================= MEMBERS SIDE PANEL ================= */}
      <div className={`members-panel ${showMembersPanel ? "open" : ""}`}>
        <div className="members-header">
          <h3>Group Members</h3>

          <div className="members-header-actions">
            {/* Only admin can add members */}
            {isAdmin && (
              <button
                className="add-member-btn"
                onClick={() => {
                  setShowMembersPanel(false);
                  onAddMembers();
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
        </div>

        <div className="members-list">
          {groupMembers.map((member) => (
            <div key={member._id} className="member-row">
              <div>
                <p className="member-name">{member.userId.name}</p>
                <span className={`role ${member.role}`}>
                  {member.role}
                </span>
              </div>

              {/* Only admin sees options button */}
              {isAdmin && (
                <button
                  className="icon-btn"
                  onClick={() =>
                    setActiveMemberMenu(
                      activeMemberMenu === member._id ? null : member._id
                    )
                  }
                >
                  ⋮
                </button>
              )}

              {/* Only admin sees menu */}
              {isAdmin && activeMemberMenu === member._id && (
                <div className="member-menu">
                  {/* Admin cannot promote another admin */}
                  {member.role !== "admin" && (
                    <button onClick={() => makeAdmin(member.userId._id)
                    }>Make Admin</button>
                  )}
                  <button className="danger" onClick={() => removeMember(member.userId._id)}>Remove</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </>
  );
};

export default ChatSpace;
