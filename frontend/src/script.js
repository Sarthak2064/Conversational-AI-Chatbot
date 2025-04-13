window.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const chatRoom = document.querySelector(".chat-room");
  const typeArea = document.querySelector(".type-area");
  const btnAdd = document.querySelector(".button-add");
  const others = document.querySelector(".others");
  const inputText = document.querySelector("#inputText");
  const btnSend = document.querySelector(".button-send");

  // Toggle Header
  header.addEventListener("click", () => {
    if (typeArea.classList.contains("d-none")) {
      header.style.borderRadius = "20px 20px 0 0";
    } else {
      header.style.borderRadius = "20px";
    }
    typeArea.classList.toggle("d-none");
    chatRoom.classList.toggle("d-none");
  });

  // Show Add Options
  btnAdd.addEventListener("click", () => {
    others.classList.add("others-show");
  });

  // Append message to chat
  function appendMessage(message, side) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", side);

    // Split the message by newlines and check for image URLs
    const lines = message.split("\n").map(line => {
      line = line.trim();
      if (line.startsWith("http") && line.includes("dummyimage")) {
        return `<img src="${line}" alt="product image" style="max-width: 200px; margin-bottom: 5px;" />`;
      } else if (line.startsWith("http")) {
        return `<a href="${line}" target="_blank">${line}</a>`;
      } else {
        return `<p>${line}</p>`;
      }
    }).join("");

    messageDiv.innerHTML = `
      <div class="avatar-wrapper avatar-small">
        <img src="${side === 'message-right' ? '../assets/user_pfp.png' : '../assets/chatbot_pfp.jpg'}" alt="avatar" />
      </div>
      <div class="bubble ${side === 'message-right' ? 'bubble-dark' : 'bubble-light'}">
        ${lines}
      </div>
    `;

    chatRoom.appendChild(messageDiv);
    chatRoom.scrollTop = chatRoom.scrollHeight;
  }


  // Send Message
  btnSend.addEventListener("click", async () => {
    const userMessage = inputText.value.trim();
    if (!userMessage) return;

    // Append user message
    appendMessage(userMessage, "message-right");
    inputText.value = "";

    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const jsonData = await response.json(); // Parse the JSON response
      appendMessage(jsonData.reply, "message-left");
      if (!jsonData.reply.includes("Hello! How can I assist you today?") &&
        !jsonData.reply.includes("I understand. Before you go, would you like to leave your contact information")) {
        setTimeout(() => {
          appendMessage("Is there anything else I can help you with?", "message-left");
        }, 1500); // Delay the follow-up by 1.5 seconds
      }
    } catch (err) {
      console.log(err);
      appendMessage("Sorry, something went wrong.", "message-left");
    }
  });

});
