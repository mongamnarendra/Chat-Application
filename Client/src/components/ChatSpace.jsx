import { useEffect, useRef, useState } from "react";
import socket from "../socket";

const ChatSpace = ({ user, groupId, onAddMembers }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const messagesRef = useRef(null);

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
  };

  return (
    <div className="chat-wrapper">
      {/* HEADER */}
      <div className="chat-header">
        <h3>Group Chat</h3>
        <button className="add-member-btn" onClick={onAddMembers}>
          + Add Members
        </button>
      </div>

      {/* MESSAGES */}
      <div className="messages" ref={messagesRef}>
        {messages.length === 0 ? (
          <p className="placeholder">No messages yet</p>
        ) : (
          messages.map((msg, index) => {
            const isSelf = msg.senderId === user.userId;

            const time = new Date(msg.createdAt).toLocaleTimeString(
              [],
              { hour: "2-digit", minute: "2-digit" }
            );

            return (
              <div
                key={index}
                className={`message-row ${
                  isSelf ? "right" : "left"
                }`}
              >
                <div
                  className={`message-bubble ${
                    isSelf ? "self" : "other"
                  }`}
                >
                  <span className="sender-name">
                    {msg.senderName}
                  </span>
                  <span className="message-text">
                    {msg.message}
                  </span>
                  <span className="message-time">
                    {time}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* INPUT */}
      <div className="message-input-container">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
    </div>
  );
};

export default ChatSpace;
