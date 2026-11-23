
(() => {
    if (document.getElementById("aram-chat-launcher")) return;

    // Load chatbot stylesheet
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = "/css/chatbot.css";
    document.head.appendChild(style);

    // Chat launcher
    const launcher = document.createElement("button");
    launcher.id = "aram-chat-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Open Aram Assistant");
    launcher.innerHTML = "🤖";

    // Chat panel
    const panel = document.createElement("section");
    panel.id = "aram-chat-panel";
    panel.setAttribute("aria-label", "Aram AI Assistant");

    panel.innerHTML = `
        <div class="aram-chat-header">
            <div class="aram-chat-avatar">🤖</div>

            <div class="aram-chat-heading">
                <strong>Aram Assistant</strong>
                <small>
                    <span class="aram-online-dot"></span>
                    AI Assistant
                </small>
            </div>

            <button type="button"
                class="aram-chat-close"
                aria-label="Close chatbot">×</button>
        </div>

        <div class="aram-chat-welcome">
            <h3>Hello! 👋</h3>

            <p>
                Welcome to Aram Events. I can help you with
                website creation, design, pricing and event ideas.
            </p>

            <div class="aram-quick-questions">
                <button type="button"
                    data-question="What is Aram Events?">
                    What is Aram Events?
                </button>

                <button type="button"
                    data-question="How does the AI website generator work?">
                    AI website generator
                </button>

                <button type="button"
                    data-question="What subscription plans are available?">
                    Subscription plans
                </button>

                <button type="button"
                    data-question="How can I create an event website?">
                    Create an event website
                </button>
            </div>
        </div>

        <div class="aram-chat-messages"
            id="aram-chat-messages"
            aria-live="polite">
        </div>

        <div class="aram-chat-input-area">
            <textarea
                id="aram-chat-input"
                rows="1"
                placeholder="Ask Aram anything..."
                aria-label="Type your message"
            ></textarea>

            <button type="button"
                id="aram-chat-send"
                aria-label="Send message">
                ➤
            </button>
        </div>

        <div class="aram-chat-footer">
            Powered by Aram AI · Intelligent Assistant
        </div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    const closeButton = panel.querySelector(".aram-chat-close");
    const input = panel.querySelector("#aram-chat-input");
    const sendButton = panel.querySelector("#aram-chat-send");
    const messages = panel.querySelector("#aram-chat-messages");
    const welcome = panel.querySelector(".aram-chat-welcome");

    let history = [];
    let isSending = false;

    // Open chatbot
    function openChat() {
        panel.classList.add("aram-chat-open");
        launcher.classList.add("aram-launcher-hidden");

        setTimeout(() => input.focus(), 150);
    }

    // Close chatbot
    function closeChat() {
        panel.classList.remove("aram-chat-open");
        launcher.classList.remove("aram-launcher-hidden");
    }

    launcher.addEventListener("click", openChat);
    closeButton.addEventListener("click", closeChat);

    // Display messages safely
    function addMessage(role, content) {
        const wrapper = document.createElement("div");

        wrapper.className =
            "aram-message " +
            (role === "user"
                ? "aram-user-message"
                : "aram-bot-message");

        const bubble = document.createElement("div");
        bubble.className = "aram-message-bubble";

        bubble.textContent = content;

        wrapper.appendChild(bubble);
        messages.appendChild(wrapper);

        messages.scrollTop = messages.scrollHeight;

        return wrapper;
    }

    // Typing indicator
    function addTyping() {
        const wrapper = document.createElement("div");

        wrapper.className = "aram-message aram-bot-message";

        const bubble = document.createElement("div");

        bubble.className =
            "aram-message-bubble aram-typing";

        bubble.textContent = "Aram is thinking...";

        wrapper.appendChild(bubble);
        messages.appendChild(wrapper);

        messages.scrollTop = messages.scrollHeight;

        return wrapper;
    }

    // Send message to backend
    async function sendMessage(value) {
        const message = String(value || "").trim();

        if (!message || isSending) return;

        welcome.style.display = "none";

        isSending = true;

        sendButton.disabled = true;
        input.disabled = true;

        addMessage("user", message);

        const typing = addTyping();

        try {
            const response = await fetch("/api/chat", {
                method: "POST",

                credentials: "include",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message,
                    history: history.slice(-12)
                })
            });

            let data;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    "Invalid response from Aram server."
                );
            }

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Aram Assistant is temporarily unavailable."
                );
            }

            const reply = String(data.reply || "").trim();

            if (!reply) {
                throw new Error("Empty response from AI.");
            }

            typing.remove();

            addMessage("assistant", reply);

            history.push(
                { role: "user", content: message },
                { role: "assistant", content: reply }
            );

            history = history.slice(-12);

        } catch (error) {
            typing.remove();

            console.error("Aram Assistant error:", error);

            addMessage(
                "assistant",
                "Sorry, Aram Assistant is temporarily unavailable. " +
                "Please try again in a moment."
            );

        } finally {
            isSending = false;

            sendButton.disabled = false;
            input.disabled = false;

            input.focus();
        }
    }

    // Send button
    sendButton.addEventListener("click", () => {
        const message = input.value;

        input.value = "";

        sendMessage(message);
    });

    // Enter to send, Shift+Enter for new line
    input.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            const message = input.value;

            input.value = "";

            sendMessage(message);
        }
    });

    // Quick questions
    panel.querySelectorAll("[data-question]").forEach(button => {
        button.addEventListener("click", () => {
            sendMessage(button.dataset.question);
        });
    });

})();
