const questions = [
    "为什么天空是蓝色的？",
    "为什么人会打哈欠？",
    "为什么冰会浮在水面上？",
    "为什么人睡觉时会做梦？"
];

const button = document.getElementById("whyButton");
const question = document.getElementById("question");

button.addEventListener("click", () => {

    const randomIndex =
        Math.floor(Math.random() * questions.length);

    const selectedQuestion = questions[randomIndex];

    question.textContent = selectedQuestion;

    question.onclick = () => {
        window.location.href =
            "explain.html?question=" +
            encodeURIComponent(selectedQuestion);
    };
});