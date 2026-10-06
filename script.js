const whyList = [
    {
        question: "为什么天空是蓝色的？",
        answer: "因为太阳光进入大气层后，会被空气分子散射。其中短波长的蓝光比红光更容易被散射，所以从地面看，天空大部分时候呈现蓝色。"
    },
    {
        question: "为什么人会打哈欠？",
        answer: "打哈欠与大脑觉醒状态、睡眠和疲劳等因素有关。人在困倦或状态切换时，更容易出现打哈欠。它并不是单纯因为缺氧。"
    },
    {
        question: "为什么冰会浮在水面上？",
        answer: "因为水结冰时，分子排列形成较为疏松的晶体结构，体积增大，因此冰的密度小于液态水，所以会浮在水面上。"
    },
    {
        question: "为什么人睡觉时会做梦？",
        answer: "做梦主要发生在睡眠过程中，尤其常见于快速眼动睡眠。大脑在睡眠时并没有完全停止活动，记忆、情绪和感觉信息仍会被重新处理，因此会形成梦境体验。"
    }
];

const button = document.getElementById("whyButton");
const question = document.getElementById("question");

button.addEventListener("click", () => {

    const randomIndex =
        Math.floor(Math.random() * whyList.length);

    const selected = whyList[randomIndex];

    question.textContent = selected.question;

    question.onclick = () => {
        window.location.href =
            "explain.html?question=" +
            encodeURIComponent(selected.question);
    };
});