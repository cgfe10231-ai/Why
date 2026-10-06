const questionElement =
    document.getElementById(
        "detailQuestion"
    );


const contentElement =
    document.getElementById(
        "detailContent"
    );


const backButton =
    document.getElementById(
        "detailBackButton"
    );


const params =
    new URLSearchParams(
        window.location.search
    );


const question =
    params.get("question");


if (!question) {

    questionElement.textContent =
        "没有找到问题";

    contentElement.innerHTML = `
        <div class="error">
            请返回上一页重新进入。
        </div>
    `;

} else {

    questionElement.textContent =
        question;

    generateDetail(question);

}


async function generateDetail(
    question
) {

    try {

        const response =
            await fetch(
                "https://why-api.cgfe10231.workers.dev/api/detail",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        question:
                            question
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "详细解释生成失败"
            );

        }


        const data =
            await response.json();


        if (!data.detail) {

            throw new Error(
                "没有收到详细解释"
            );

        }


        renderDetail(
            data.detail
        );


    } catch (error) {

        console.error(error);

        contentElement.innerHTML = `
            <div class="error">
                详细解释生成失败，请返回后重试。
            </div>
        `;

    }

}


function renderDetail(
    detail
) {

    contentElement.innerHTML =
        "";


    /* =====================
       核心回答
       ===================== */

    if (detail.summary) {

        const summary =
            document.createElement(
                "div"
            );

        summary.className =
            "detail-summary";

        summary.textContent =
            detail.summary;

        contentElement.appendChild(
            summary
        );

    }


    /* =====================
       深度章节
       ===================== */

    if (
        Array.isArray(
            detail.sections
        )
    ) {

        detail.sections.forEach(
            (section) => {

                const block =
                    document.createElement(
                        "section"
                    );

                block.className =
                    "detail-section";


                const title =
                    document.createElement(
                        "h2"
                    );

                title.textContent =
                    section.title;


                const content =
                    document.createElement(
                        "p"
                    );

                content.textContent =
                    section.content;


                block.appendChild(
                    title
                );

                block.appendChild(
                    content
                );


                contentElement.appendChild(
                    block
                );

            }
        );

    }


    /* =====================
       数据对比
       ===================== */

    if (
        Array.isArray(
            detail.comparisons
        ) &&
        detail.comparisons.length > 0
    ) {

        const title =
            document.createElement(
                "h2"
            );

        title.className =
            "detail-subtitle";

        title.textContent =
            "数据对比";

        contentElement.appendChild(
            title
        );


        detail.comparisons.forEach(
            (comparison) => {

                const block =
                    document.createElement(
                        "section"
                    );

                block.className =
                    "comparison-block";


                const heading =
                    document.createElement(
                        "h3"
                    );

                heading.textContent =
                    comparison.title;


                block.appendChild(
                    heading
                );


                if (
                    Array.isArray(
                        comparison.items
                    )
                ) {

                    comparison.items.forEach(
                        (item) => {

                            const row =
                                document.createElement(
                                    "div"
                                );

                            row.className =
                                "comparison-row";


                            const name =
                                document.createElement(
                                    "span"
                                );

                            name.textContent =
                                item.name;


                            const value =
                                document.createElement(
                                    "strong"
                                );

                            value.textContent =
                                item.value +
                                (
                                    item.unit
                                        ? " " +
                                          item.unit
                                        : ""
                                );


                            row.appendChild(
                                name
                            );

                            row.appendChild(
                                value
                            );


                            block.appendChild(
                                row
                            );

                        }
                    );

                }


                contentElement.appendChild(
                    block
                );

            }
        );

    }


    /* =====================
       图表
       ===================== */

    if (
        Array.isArray(
            detail.charts
        ) &&
        detail.charts.length > 0
    ) {

        const title =
            document.createElement(
                "h2"
            );

        title.className =
            "detail-subtitle";

        title.textContent =
            "图表";

        contentElement.appendChild(
            title
        );


        detail.charts.forEach(
            (chart) => {

                const block =
                    document.createElement(
                        "section"
                    );

                block.className =
                    "chart-block";


                const heading =
                    document.createElement(
                        "h3"
                    );

                heading.textContent =
                    chart.title;


                const canvas =
                    document.createElement(
                        "canvas"
                    );

                canvas.className =
                    "why-chart";

                canvas.width =
                    700;

                canvas.height =
                    360;


                block.appendChild(
                    heading
                );

                block.appendChild(
                    canvas
                );


                contentElement.appendChild(
                    block
                );


                drawChart(
                    canvas,
                    chart
                );

            }
        );

    }


    /* =====================
       注意事项
       ===================== */

    if (detail.limitations) {

        const block =
            document.createElement(
                "section"
            );

        block.className =
            "detail-limitations";


        const title =
            document.createElement(
                "h2"
            );

        title.textContent =
            "需要注意";

        const content =
            document.createElement(
                "p"
            );

        content.textContent =
            detail.limitations;


        block.appendChild(
            title
        );

        block.appendChild(
            content
        );


        contentElement.appendChild(
            block
        );

    }


    /* =====================
       来源
       ===================== */

    if (
        Array.isArray(
            detail.sources
        ) &&
        detail.sources.length > 0
    ) {

        const block =
            document.createElement(
                "section"
            );

        block.className =
            "detail-sources";


        const title =
            document.createElement(
                "h2"
            );

        title.textContent =
            "参考资料";


        block.appendChild(
            title
        );


        detail.sources.forEach(
            (source) => {

                const item =
                    document.createElement(
                        "p"
                    );

                item.textContent =
                    source.name;

                block.appendChild(
                    item
                );

            }
        );


        contentElement.appendChild(
            block
        );

    }


    /* =====================
       最终总结
       ===================== */

    if (detail.conclusion) {

        const conclusion =
            document.createElement(
                "div"
            );

        conclusion.className =
            "detail-conclusion";

        conclusion.textContent =
            detail.conclusion;


        contentElement.appendChild(
            conclusion
        );

    }

}


/* =====================
   简单 Canvas 图表
   ===================== */

function drawChart(
    canvas,
    chart
) {

    const ctx =
        canvas.getContext("2d");


    const labels =
        chart.labels || [];


    const values =
        chart.values || [];


    if (
        labels.length === 0 ||
        values.length === 0
    ) {

        return;

    }


    const width =
        canvas.width;

    const height =
        canvas.height;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const max =
        Math.max(...values);


    const padding =
        55;


    const chartWidth =
        width -
        padding * 2;


    const chartHeight =
        height -
        padding * 2;


    if (
        chart.type ===
        "line"
    ) {

        ctx.beginPath();


        values.forEach(
            (value, index) => {

                const x =
                    padding +
                    index *
                    (
                        chartWidth /
                        Math.max(
                            values.length - 1,
                            1
                        )
                    );


                const y =
                    height -
                    padding -
                    (
                        value /
                        max
                    ) *
                    chartHeight;


                if (index === 0) {

                    ctx.moveTo(
                        x,
                        y
                    );

                } else {

                    ctx.lineTo(
                        x,
                        y
                    );

                }

            }
        );


        ctx.stroke();


        values.forEach(
            (value, index) => {

                const x =
                    padding +
                    index *
                    (
                        chartWidth /
                        Math.max(
                            values.length - 1,
                            1
                        )
                    );


                const y =
                    height -
                    padding -
                    (
                        value /
                        max
                    ) *
                    chartHeight;


                ctx.beginPath();

                ctx.arc(
                    x,
                    y,
                    4,
                    0,
                    Math.PI * 2
                );

                ctx.fill();


                ctx.fillText(
                    labels[index],
                    x - 15,
                    height - 20
                );

            }
        );


    } else {

        const barWidth =
            chartWidth /
            values.length *
            0.6;


        values.forEach(
            (value, index) => {

                const x =
                    padding +
                    index *
                    (
                        chartWidth /
                        values.length
                    ) +
                    barWidth * 0.33;


                const barHeight =
                    (
                        value /
                        max
                    ) *
                    chartHeight;


                const y =
                    height -
                    padding -
                    barHeight;


                ctx.fillRect(
                    x,
                    y,
                    barWidth,
                    barHeight
                );


                ctx.fillText(
                    labels[index],
                    x,
                    height - 20
                );

            }
        );

    }

}


backButton.addEventListener(
    "click",
    () => {

        window.history.back();

    }
);