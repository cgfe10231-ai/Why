const button = document.getElementById("whyButton");
const question = document.getElementById("question");

button.addEventListener("click", async () => {

    // 生成中
    button.disabled = true;
    button.textContent = "生成中……";
    question.textContent = "";

    try {

        const response = await fetch("/api/why", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("服务器返回错误");
        }

        const data = await response.json();

        if (!data.question) {
            throw new Error("没有收到问题");
        }

        const selectedQuestion = data.question;

        // 成功
        question.textContent = selectedQuestion;

        question.onclick = () => {
            window.location.href =
                "explain.html?question=" +
                encodeURIComponent(selectedQuestion);
        };

    } catch (error) {

        console.error(error);

        // 失败
        question.textContent =
            "生成失败，请再试一次。";

    } finally {

        // 回到待机状态
        button.disabled = false;
        button.textContent = "摇一个为什么";
    }
});