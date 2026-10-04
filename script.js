const API_BASE =
    "https://why-api.cgfe10231.workers.dev";


const whyButton =
    document.getElementById("whyButton");

const questionElement =
    document.getElementById("question");


async function generateWhy() {

    whyButton.disabled = true;
    whyButton.textContent = "生成中……";

    questionElement.textContent = "";


    try {

        const response =
            await fetch(
                `${API_BASE}/api/why`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({})
                }
            );


        const responseText =
            await response.text();


        if (!response.ok) {

            throw new Error(
                `请求失败：${response.status}\n${responseText}`
            );
        }


        let data;

        try {

            data =
                JSON.parse(responseText);

        } catch (error) {

            throw new Error(
                `服务器返回的不是 JSON：\n${responseText}`
            );
        }


        if (!data.question) {

            throw new Error(
                `服务器没有返回 question：\n${responseText}`
            );
        }


        const question =
            data.question.trim();


        questionElement.textContent =
            question;


        questionElement.classList.add(
            "question-clickable"
        );


        questionElement.onclick =
            () => {

                sessionStorage.setItem(
                    "whyQuestion",
                    question
                );


                window.location.href =
                    "explain.html";
            };


    } catch (error) {

        console.error(error);


        questionElement.textContent =
            `生成失败：${error.message}`;


        questionElement.classList.remove(
            "question-clickable"
        );


        questionElement.onclick =
            null;


    } finally {

        whyButton.disabled = false;

        whyButton.textContent =
            "摇一个为什么";
    }
}


whyButton.addEventListener(
    "click",
    generateWhy
);