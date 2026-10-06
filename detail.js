const API_BASE =
    "https://why-api.cgfe10231.workers.dev";

const params = new URLSearchParams(
    window.location.search
);

const question =
    params.get("question");

const detailQuestion =
    document.getElementById("detailQuestion");

const detailContent =
    document.getElementById("detailContent");

const detailBackButton =
    document.getElementById("detailBackButton");


detailBackButton.addEventListener(
    "click",
    () => {
        window.history.back();
    }
);


if (!question) {

    detailQuestion.textContent =
        "没有找到问题";

    detailContent.innerHTML = `
        <div class="detail-card error-card">
            <div class="error-title">
                无法加载详细解释
            </div>

            <div class="error-text">
                当前页面没有收到有效的问题。
            </div>
        </div>
    `;

} else {

    detailQuestion.textContent =
        question;

    loadDetail();
}


/* =========================
   主流程
========================= */

async function loadDetail() {

    try {

        const response =
            await fetch(
                API_BASE + "/api/detail",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        question: question
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
                "服务器没有返回详细解释"
            );

        }


        renderDetail(
            data.detail
        );


    } catch (error) {

        console.error(error);

        detailContent.innerHTML = `
            <div class="detail-card error-card">

                <div class="error-title">
                    详细解释生成失败
                </div>

                <div class="error-text">
                    当前无法取得详细解释。
                    请返回后重新尝试。
                </div>

            </div>
        `;
    }
}


/* =========================
   总渲染
========================= */

function renderDetail(detail) {

    detailContent.innerHTML = "";

    window.__detailCharts =
        detail.charts || [];

    /* 核心总结 */

    if (detail.summary) {

        const summaryCard =
            document.createElement("section");

        summaryCard.className =
            "detail-card summary-card";

        summaryCard.innerHTML = `

            <div class="card-label">
                先说结论
            </div>

            <div class="summary-text">
                ${escapeHtml(
                    detail.summary
                )}
            </div>

        `;

        detailContent.appendChild(
            summaryCard
        );
    }


    /* 详细机制 */

    if (
        Array.isArray(detail.sections) &&
        detail.sections.length > 0
    ) {

        const sectionBlock =
            document.createElement("section");

        sectionBlock.className =
            "detail-block";

        sectionBlock.innerHTML = `

            <div class="block-title">
                <span>01</span>
                为什么会这样
            </div>

            <div class="section-list"></div>

        `;

        const list =
            sectionBlock.querySelector(
                ".section-list"
            );


        detail.sections.forEach(
            (section, index) => {

                if (!section) {
                    return;
                }


                const item =
                    document.createElement("article");

                item.className =
                    "detail-card explanation-card";


                item.innerHTML = `

                    <div class="section-index">
                        ${String(index + 1)
                            .padStart(2, "0")}
                    </div>

                    <div class="section-body">

                        <h2>
                            ${escapeHtml(
                                section.title ||
                                "原因"
                            )}
                        </h2>

                        <p>
                            ${escapeHtml(
                                section.content ||
                                ""
                            )}
                        </p>

                    </div>

                `;


                list.appendChild(item);

            }
        );


        detailContent.appendChild(
            sectionBlock
        );
    }


    /* 数据比较 */

    if (
        Array.isArray(detail.comparisons) &&
        detail.comparisons.length > 0
    ) {

        const comparisonBlock =
            document.createElement("section");

        comparisonBlock.className =
            "detail-block";

        comparisonBlock.innerHTML = `

            <div class="block-title">
                <span>02</span>
                数据比较
            </div>

            <div class="comparison-list"></div>

        `;

        const list =
            comparisonBlock.querySelector(
                ".comparison-list"
            );


        detail.comparisons.forEach(
            (comparison) => {

                if (
                    !comparison ||
                    !Array.isArray(
                        comparison.items
                    ) ||
                    comparison.items.length === 0
                ) {
                    return;
                }


                const card =
                    document.createElement("div");

                card.className =
                    "detail-card comparison-card";


                const title =
                    escapeHtml(
                        comparison.title ||
                        "数据比较"
                    );


                let rows = "";


                comparison.items.forEach(
                    (item) => {

                        rows += `

                            <div class="comparison-row">

                                <div class="comparison-name">
                                    ${escapeHtml(
                                        item.name ||
                                        "-"
                                    )}
                                </div>

                                <div class="comparison-value">
                                    ${escapeHtml(
                                        formatValue(
                                            item.value
                                        )
                                    )}

                                    ${
                                        item.unit
                                            ? `<span class="comparison-unit">
                                                ${escapeHtml(
                                                    item.unit
                                                )}
                                               </span>`
                                            : ""
                                    }
                                </div>

                            </div>

                        `;
                    }
                );


                card.innerHTML = `

                    <div class="comparison-title">
                        ${title}
                    </div>

                    <div class="comparison-table">
                        ${rows}
                    </div>

                `;


                list.appendChild(card);

            }
        );


        if (list.children.length > 0) {

            detailContent.appendChild(
                comparisonBlock
            );
        }
    }


    /* 图表 */

    if (
        Array.isArray(detail.charts) &&
        detail.charts.length > 0
    ) {

        const chartBlock =
            document.createElement("section");

        chartBlock.className =
            "detail-block";

        chartBlock.innerHTML = `

            <div class="block-title">
                <span>03</span>
                数据图表
            </div>

            <div class="chart-list"></div>

        `;

        const list =
            chartBlock.querySelector(
                ".chart-list"
            );


        detail.charts.forEach(
            (chart, index) => {

                if (
                    !chart ||
                    !Array.isArray(chart.labels) ||
                    !Array.isArray(chart.values) ||
                    chart.labels.length === 0 ||
                    chart.labels.length !==
                        chart.values.length
                ) {
                    return;
                }


                const card =
                    document.createElement("div");

                card.className =
                    "detail-card chart-card";


                const canvasId =
                    "detailChart_" + index;


                card.innerHTML = `

                    <div class="chart-header">

                        <div>
                            <div class="chart-title">
                                ${escapeHtml(
                                    chart.title ||
                                    "数据图表"
                                )}
                            </div>

                            ${
                                chart.unit
                                    ? `<div class="chart-unit">
                                        单位：${escapeHtml(
                                            chart.unit
                                        )}
                                       </div>`
                                    : ""
                            }
                        </div>

                        <div class="chart-type">
                            ${
                                chart.type === "line"
                                    ? "趋势"
                                    : "比较"
                            }
                        </div>

                    </div>

                    <div class="chart-canvas-wrap">
                        <canvas
                            id="${canvasId}"
                        ></canvas>
                    </div>

                `;


                list.appendChild(card);


                requestAnimationFrame(
                    () => {

                        drawChart(
                            canvasId,
                            chart
                        );

                    }
                );

            }
        );


        if (list.children.length > 0) {

            detailContent.appendChild(
                chartBlock
            );
        }
    }


    /* 限制 */

    if (detail.limitations) {

        const limitationBlock =
            document.createElement("section");

        limitationBlock.className =
            "detail-block";

        limitationBlock.innerHTML = `

            <div class="block-title">
                <span>04</span>
                解释边界
            </div>

            <div class="detail-card limitation-card">

                <div class="limitation-mark">
                    !
                </div>

                <div class="limitation-text">
                    ${escapeHtml(
                        detail.limitations
                    )}
                </div>

            </div>

        `;


        detailContent.appendChild(
            limitationBlock
        );
    }


    /* 来源 */

    if (
        Array.isArray(detail.sources) &&
        detail.sources.length > 0
    ) {

        const sourceBlock =
            document.createElement("section");

        sourceBlock.className =
            "detail-block";

        sourceBlock.innerHTML = `

            <div class="block-title">
                <span>05</span>
                来源
            </div>

            <div class="detail-card source-card">

                <div class="source-list"></div>

            </div>

        `;

        const list =
            sourceBlock.querySelector(
                ".source-list"
            );


        detail.sources.forEach(
            (source) => {

                if (!source) {
                    return;
                }


                const row =
                    document.createElement("div");

                row.className =
                    "source-row";


                row.innerHTML = `

                    <span class="source-dot"></span>

                    <span class="source-name">
                        ${escapeHtml(
                            source.name ||
                            "未命名来源"
                        )}
                    </span>

                `;


                list.appendChild(row);

            }
        );


        if (list.children.length > 0) {

            detailContent.appendChild(
                sourceBlock
            );
        }
    }


    /* 最终结论 */

    if (detail.conclusion) {

        const conclusionBlock =
            document.createElement("section");

        conclusionBlock.className =
            "detail-block";

        conclusionBlock.innerHTML = `

            <div class="block-title">
                <span>06</span>
                最终结论
            </div>

            <div class="detail-card conclusion-card">

                <div class="conclusion-text">
                    ${escapeHtml(
                        detail.conclusion
                    )}
                </div>

            </div>

        `;


        detailContent.appendChild(
            conclusionBlock
        );
    }


    /* 如果 AI 什么都没返回 */

    if (
        detailContent.children.length === 0
    ) {

        detailContent.innerHTML = `

            <div class="detail-card error-card">

                <div class="error-title">
                    暂时没有可展示的内容
                </div>

                <div class="error-text">
                    返回的数据为空。
                </div>

            </div>

        `;
    }
}


/* =========================
   图表
========================= */

function drawChart(canvasId, chart) {

    const canvas =
        document.getElementById(canvasId);


    if (!canvas) {
        return;
    }


    const wrapper =
        canvas.parentElement;


    const width =
        wrapper.clientWidth;


    const height =
        Math.max(
            260,
            Math.min(
                360,
                width * 0.65
            )
        );


    const dpr =
        window.devicePixelRatio || 1;


    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;


    canvas.style.width =
        width + "px";

    canvas.style.height =
        height + "px";


    const ctx =
        canvas.getContext("2d");


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const labels =
        chart.labels || [];


    const values =
        chart.values || [];


    const numericValues =
        values.map(
            value => Number(value)
        );


    if (
        numericValues.some(
            value => Number.isNaN(value)
        )
    ) {

        return;
    }


    const padding = {

        top: 20,
        right: 20,
        bottom: 48,
        left: 48

    };


    const graphWidth =
        width -
        padding.left -
        padding.right;


    const graphHeight =
        height -
        padding.top -
        padding.bottom;


    const maxValue =
        Math.max(
            ...numericValues,
            0
        );


    const minValue =
        Math.min(
            ...numericValues,
            0
        );


    let range =
        maxValue - minValue;


    if (range === 0) {
        range = 1;
    }


    const gridColor =
        "#e6e6e6";

    const textColor =
        "#777";

    const darkColor =
        "#222";


    /* 网格线 */

    ctx.strokeStyle =
        gridColor;

    ctx.lineWidth = 1;


    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const y =
            padding.top +
            graphHeight *
                (i / 4);


        ctx.beginPath();

        ctx.moveTo(
            padding.left,
            y
        );

        ctx.lineTo(
            width - padding.right,
            y
        );

        ctx.stroke();

    }


    /* Y 轴 */

    ctx.fillStyle =
        textColor;

    ctx.font =
        "12px -apple-system, BlinkMacSystemFont, sans-serif";


    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const ratio =
            1 - i / 4;


        const value =
            minValue +
            range * ratio;


        const y =
            padding.top +
            graphHeight *
                (i / 4);


        ctx.textAlign =
            "right";

        ctx.textBaseline =
            "middle";


        ctx.fillText(
            formatChartNumber(
                value
            ),
            padding.left - 8,
            y
        );

    }


    const isLine =
        chart.type === "line";


    if (isLine) {

        drawLineChart(
            ctx,
            labels,
            numericValues,
            padding,
            graphWidth,
            graphHeight,
            minValue,
            range,
            darkColor
        );

    } else {

        drawBarChart(
            ctx,
            labels,
            numericValues,
            padding,
            graphWidth,
            graphHeight,
            minValue,
            range,
            darkColor
        );

    }


    /* X 轴标签 */

    ctx.fillStyle =
        textColor;

    ctx.font =
        "12px -apple-system, BlinkMacSystemFont, sans-serif";


    labels.forEach(
        (label, index) => {

            const x =
                padding.left +
                graphWidth *
                    (
                        labels.length === 1
                            ? 0.5
                            : index /
                              (labels.length - 1)
                    );


            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "top";


            ctx.fillText(
                shortenLabel(
                    String(label)
                ),
                x,
                height - 30
            );

        }
    );
}


function drawBarChart(
    ctx,
    labels,
    values,
    padding,
    graphWidth,
    graphHeight,
    minValue,
    range,
    darkColor
) {

    const count =
        values.length;


    const slotWidth =
        graphWidth / count;


    const barWidth =
        Math.min(
            54,
            slotWidth * 0.52
        );


    const zeroY =
        padding.top +
        graphHeight *
            (
                1 -
                (
                    0 - minValue
                ) /
                range
            );


    values.forEach(
        (value, index) => {

            const x =
                padding.left +
                slotWidth * index +
                (slotWidth - barWidth) / 2;


            const valueY =
                padding.top +
                graphHeight *
                    (
                        1 -
                        (
                            value -
                            minValue
                        ) /
                        range
                    );


            const top =
                Math.min(
                    zeroY,
                    valueY
                );


            const bottom =
                Math.max(
                    zeroY,
                    valueY
                );


            const height =
                Math.max(
                    2,
                    bottom - top
                );


            ctx.fillStyle =
                darkColor;


            ctx.fillRect(
                x,
                top,
                barWidth,
                height
            );


            ctx.fillStyle =
                "#555";

            ctx.font =
                "12px -apple-system, BlinkMacSystemFont, sans-serif";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "bottom";


            ctx.fillText(
                formatChartNumber(
                    value
                ),
                x +
                    barWidth / 2,
                top - 6
            );

        }
    );
}


function drawLineChart(
    ctx,
    labels,
    values,
    padding,
    graphWidth,
    graphHeight,
    minValue,
    range,
    darkColor
) {

    const points =
        values.map(
            (value, index) => {

                const x =
                    padding.left +
                    graphWidth *
                        (
                            values.length === 1
                                ? 0.5
                                : index /
                                  (values.length - 1)
                        );


                const y =
                    padding.top +
                    graphHeight *
                        (
                            1 -
                            (
                                value -
                                minValue
                            ) /
                            range
                        );


                return {
                    x,
                    y,
                    value
                };

            }
        );


    if (points.length === 0) {
        return;
    }


    ctx.strokeStyle =
        darkColor;

    ctx.lineWidth = 3;

    ctx.lineJoin =
        "round";

    ctx.lineCap =
        "round";


    ctx.beginPath();

    points.forEach(
        (point, index) => {

            if (index === 0) {

                ctx.moveTo(
                    point.x,
                    point.y
                );

            } else {

                ctx.lineTo(
                    point.x,
                    point.y
                );

            }

        }
    );

    ctx.stroke();


    points.forEach(
        (point) => {

            ctx.fillStyle =
                "#ffffff";

            ctx.strokeStyle =
                darkColor;

            ctx.lineWidth =
                2;


            ctx.beginPath();

            ctx.arc(
                point.x,
                point.y,
                5,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.stroke();


            ctx.fillStyle =
                "#555";

            ctx.font =
                "12px -apple-system, BlinkMacSystemFont, sans-serif";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "bottom";


            ctx.fillText(
                formatChartNumber(
                    point.value
                ),
                point.x,
                point.y - 10
            );

        }
    );
}


/* =========================
   工具函数
========================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatValue(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "-";
    }


    if (
        typeof value === "number"
    ) {

        return value.toLocaleString(
            "zh-CN",
            {
                maximumFractionDigits: 2
            }
        );

    }


    return String(value);
}


function formatChartNumber(value) {

    if (
        Math.abs(value) >= 1000000
    ) {

        return (
            value / 1000000
        ).toFixed(1) + "M";

    }


    if (
        Math.abs(value) >= 1000
    ) {

        return (
            value / 1000
        ).toFixed(1) + "k";

    }


    if (
        Math.abs(value) >= 10
    ) {

        return value.toFixed(0);

    }


    return value.toFixed(1);
}


function shortenLabel(text) {

    if (text.length <= 8) {
        return text;
    }


    return (
        text.slice(0, 7) + "…"
    );
}


/* =========================
   响应式重绘
========================= */

let resizeTimer = null;


window.addEventListener(
    "resize",
    () => {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =
            setTimeout(
                () => {

                    redrawCharts();

                },
                150
            );

    }
);


function redrawCharts() {

    const canvases =
        document.querySelectorAll(
            ".chart-card canvas"
        );


    canvases.forEach(
        (canvas) => {

            const id =
                canvas.id;

            const index =
                Number(
                    id.replace(
                        "detailChart_",
                        ""
                    )
                );


            const chart =
                window.__detailCharts
                    ? window.__detailCharts[
                        index
                    ]
                    : null;


            if (chart) {

                drawChart(
                    id,
                    chart
                );

            }

        }
    );
}