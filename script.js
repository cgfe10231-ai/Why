const button = document.getElementById("whyButton");
const question = document.getElementById("question");

const API_BASE =
    "https://why-api.cgfe10231.workers.dev";


button.addEventListener("click", generateWhy);


async function generateWhy() {

    button.disabled = true;
    button.textContent = "生成中……";

    question.textContent = "";
    question.classList.remove("visible");


    try {

        const response = await fetch(
            API_BASE + "/api/why",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                }
            }
        );


        if (!response.ok) {
            throw new Error(
                "问题生成失败"
            );
        }


        const data =
            await response.json();


        if (!data.question) {
            throw new Error(
                "服务器没有返回问题"
            );
        }


        const selectedQuestion =
            data.question;


        question.textContent =
            selectedQuestion;

        question.classList.add(
            "visible"
        );


        question.onclick = () => {

            window.location.href =
                "explain.html?question=" +
                encodeURIComponent(
                    selectedQuestion
                );

        };


    } catch (error) {

        console.error(error);

        question.textContent =
            "生成失败，请再试一次。";

        question.classList.add(
            "visible"
        );


    } finally {

        button.disabled = false;

        button.textContent =
            "摇一个为什么";
    }
}