const button =
    document.getElementById("whyButton");

const question =
    document.getElementById("question");


const API_BASE =
    "https://why-api.cgfe10231.workers.dev";


button.addEventListener(
    "click",
    generateWhy
);


async function generateWhy() {

    button.disabled = true;
    button.textContent = "生成中……";

    question.textContent = "";
    question.classList.remove("visible");


    try {

        const response =
            await fetch(
                API_BASE + "/api/why",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const responseText =
            await response.text();


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}\n${responseText}`
            );
        }


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch (error) {

            throw new Error(
                "Worker 返回的不是 JSON：\n" +
                responseText
            );
        }


        if (!data.question) {

            throw new Error(
                "Worker 没有返回 question：\n" +
                responseText
            );
        }


        const selectedQuestion =
            data.question.trim();


        question.textContent =
            selectedQuestion;


        question.classList.add(
            "visible"
        );


        question.onclick =
            () => {

                window.location.href =
                    "explain.html?question=" +
                    encodeURIComponent(
                        selectedQuestion
                    );
            };


    } catch (error) {

        console.error(
            "WHY ERROR:",
            error
        );


        question.textContent =
            "生成失败：\n" +
            error.message;


        question.classList.add(
            "visible"
        );


    } finally {

        button.disabled = false;

        button.textContent =
            "摇一个为什么";
    }
}