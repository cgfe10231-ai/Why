const API_BASE =
    "https://why-api.cgfe10231.workers.dev";


const detailQuestion =
    document.getElementById(
        "detailQuestion"
    );

const detailContent =
    document.getElementById(
        "detailContent"
    );

const detailBackButton =
    document.getElementById(
        "detailBackButton"
    );


const question =
    sessionStorage.getItem(
        "whyQuestion"
    );


/*
   当前已经走过的内容。

   stack[0] = 根详细页
   stack[1] = 点击的第一张卡
   stack[2] = 第二张卡
   ...
*/

const pageStack = [];


/*
   已经请求过的节点缓存。

   同一个节点再次进入时，
   不重新请求 AI。
*/

const nodeCache =
    new Map();


/* ==================================================
   HTML 安全
================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


function formatText(value) {

    return escapeHTML(
        value
    ).replace(
        /\n/g,
        "<br>"
    );
}


/* ==================================================
   API
================================================== */

async function postJSON(
    path,
    body
) {

    const response =
        await fetch(
            `${API_BASE}${path}`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        body
                    )
            }
        );


    const text =
        await response.text();


    let data;


    try {

        data =
            JSON.parse(
                text
            );

    } catch (error) {

        throw new Error(
            `服务器返回的不是 JSON：${text}`
        );
    }


    if (
        !response.ok
    ) {

        throw new Error(
            data.error ||
            `请求失败：${response.status}`
        );
    }


    return data;
}


/* ==================================================
   Loading
================================================== */

function showLoading(
    text = "正在展开……"
) {

    detailContent.innerHTML = `
        <section class="detail-card">
            <h2>${escapeHTML(text)}</h2>
        </section>
    `;
}


/* ==================================================
   根详细页
================================================== */

function normalizeRootDetail(
    detail
) {

    const result =
        detail || {};


    if (
        !Array.isArray(
            result.sections
        )
    ) {

        result.sections = [];
    }


    /*
       兼容旧版 Worker 返回的 deepDive
    */

    if (
        result.sections.length === 0 &&
        Array.isArray(
            result.deepDive
        )
    ) {

        result.sections =
            result.deepDive.map(
                (item, index) => ({
                    id:
                        `s${index + 1}`,

                    title:
                        item.title ||
                        `继续追问 ${index + 1}`,

                    summary:
                        item.content ||
                        ""
                })
            );
    }


    if (
        !Array.isArray(
            result.comparisons
        )
    ) {

        result.comparisons = [];
    }


    if (
        !Array.isArray(
            result.charts
        )
    ) {

        result.charts = [];
    }


    if (
        !Array.isArray(
            result.verificationPoints
        )
    ) {

        result.verificationPoints = [];
    }


    if (
        !Array.isArray(
            result.sources
        )
    ) {

        result.sources = [];
    }


    return result;
}


/* ==================================================
   根详细页渲染
================================================== */

function renderRoot(
    detail
) {

    detailQuestion.textContent =
        question;


    let html = "";


    /* ------------------------------
       Summary
    ------------------------------ */

    if (
        detail.summary
    ) {

        html += `
            <section class="summary-card">
                <h2>先建立整体模型</h2>
                <div>
                    ${formatText(
                        detail.summary
                    )}
                </div>
            </section>
        `;
    }


    /* ------------------------------
       可继续深入的卡片
    ------------------------------ */

    if (
        detail.sections.length > 0
    ) {

        html += `
            <section class="detail-card">
                <h2>继续展开</h2>

                <div class="detail-sections">
        `;


        detail.sections.forEach(
            (section, index) => {

                const id =
                    section.id ||
                    `s${index + 1}`;


                html += `
                    <article
                        class="detail-card expandable-card"
                        data-node-id="${escapeHTML(id)}"
                        data-node-title="${escapeHTML(
                            section.title ||
                            ""
                        )}"
                        data-node-summary="${escapeHTML(
                            section.summary ||
                            ""
                        )}"
                        tabindex="0"
                        role="button"
                    >

                        <h3>
                            ${escapeHTML(
                                section.title ||
                                "继续追问"
                            )}
                        </h3>

                        <p>
                            ${formatText(
                                section.summary ||
                                ""
                            )}
                        </p>

                        <div>
                            继续展开 →
                        </div>

                    </article>
                `;
            }
        );


        html += `
                </div>
            </section>
        `;
    }


    /* ------------------------------
       Comparisons
    ------------------------------ */

    html +=
        renderComparisons(
            detail.comparisons
        );


    /* ------------------------------
       Charts
    ------------------------------ */

    html +=
        renderCharts(
            detail.charts
        );


    /* ------------------------------
       Verification
    ------------------------------ */

    html +=
        renderVerification(
            detail.verificationPoints
        );


    /* ------------------------------
       Limitations
    ------------------------------ */

    if (
        detail.limitations
    ) {

        html += `
            <section class="limitation-card">

                <h2>解释的边界</h2>

                <div>
                    ${formatText(
                        detail.limitations
                    )}
                </div>

            </section>
        `;
    }


    /* ------------------------------
       Sources
    ------------------------------ */

    html +=
        renderSources(
            detail.sources
        );


    /* ------------------------------
       Conclusion
    ------------------------------ */

    if (
        detail.conclusion
    ) {

        html += `
            <section class="conclusion-card">

                <h2>收束</h2>

                <div>
                    ${formatText(
                        detail.conclusion
                    )}
                </div>

            </section>
        `;
    }


    detailContent.innerHTML =
        html;


    drawAllCharts();
}


/* ==================================================
   深入节点渲染
================================================== */

function renderNode(
    node
) {

    detailQuestion.textContent =
        node.title ||
        "继续展开";


    let html = "";


    /* ------------------------------
       Summary
    ------------------------------ */

    if (
        node.summary
    ) {

        html += `
            <section class="summary-card">

                <h2>这一层要解决什么</h2>

                <div>
                    ${formatText(
                        node.summary
                    )}
                </div>

            </section>
        `;
    }


    /* ------------------------------
       严密推导
    ------------------------------ */

    if (
        node.steps.length > 0
    ) {

        node.steps.forEach(
            (step, index) => {

                html += `
                    <section class="detail-card">

                        <h2>
                            ${escapeHTML(
                                step.title ||
                                `推导步骤 ${index + 1}`
                            )}
                        </h2>

                        <div>
                            ${formatText(
                                step.content ||
                                ""
                            )}
                        </div>

                    </section>
                `;
            }
        );
    }


    /* ------------------------------
       更深的问题
    ------------------------------ */

    if (
        node.children.length > 0
    ) {

        html += `
            <section class="detail-card">

                <h2>继续往下追问</h2>

                <div class="detail-sections">
        `;


        node.children.forEach(
            (child, index) => {

                const id =
                    child.id ||
                    `c${index + 1}`;


                html += `
                    <article
                        class="detail-card expandable-card"
                        data-node-id="${escapeHTML(id)}"
                        data-node-title="${escapeHTML(
                            child.title ||
                            ""
                        )}"
                        data-node-summary="${escapeHTML(
                            child.summary ||
                            ""
                        )}"
                        tabindex="0"
                        role="button"
                    >

                        <h3>
                            ${escapeHTML(
                                child.title ||
                                "继续追问"
                            )}
                        </h3>

                        <p>
                            ${formatText(
                                child.summary ||
                                ""
                            )}
                        </p>

                        <div>
                            继续展开 →
                        </div>

                    </article>
                `;
            }
        );


        html += `
                </div>

            </section>
        `;
    }


    /* ------------------------------
       Verification
    ------------------------------ */

    html +=
        renderVerification(
            node.verification
        );


    /* ------------------------------
       Comparisons
    ------------------------------ */

    html +=
        renderComparisons(
            node.comparisons
        );


    /* ------------------------------
       Charts
    ------------------------------ */

    html +=
        renderCharts(
            node.charts
        );


    /* ------------------------------
       Limitations
    ------------------------------ */

    if (
        node.limitations
    ) {

        html += `
            <section class="limitation-card">

                <h2>边界</h2>

                <div>
                    ${formatText(
                        node.limitations
                    )}
                </div>

            </section>
        `;
    }


    /* ------------------------------
       Sources
    ------------------------------ */

    html +=
        renderSources(
            node.sources
        );


    detailContent.innerHTML =
        html;


    drawAllCharts();
}


/* ==================================================
   Comparisons
================================================== */

function renderComparisons(
    comparisons
) {

    if (
        !Array.isArray(
            comparisons
        ) ||
        comparisons.length === 0
    ) {

        return "";
    }


    let html = "";


    comparisons.forEach(
        comparison => {

            html += `
                <section class="comparison-card">

                    <h2>
                        ${escapeHTML(
                            comparison.title ||
                            "比较"
                        )}
                    </h2>
            `;


            if (
                Array.isArray(
                    comparison.items
                )
            ) {

                comparison.items.forEach(
                    item => {

                        html += `
                            <div>
                                <strong>
                                    ${escapeHTML(
                                        item.name ||
                                        ""
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        item.value ??
                                        ""
                                    )}

                                    ${escapeHTML(
                                        item.unit ||
                                        ""
                                    )}
                                </span>
                            </div>
                        `;
                    }
                );
            }


            html += `
                </section>
            `;
        }
    );


    return html;
}


/* ==================================================
   Verification
================================================== */

function renderVerification(
    points
) {

    if (
        !Array.isArray(points) ||
        points.length === 0
    ) {

        return "";
    }


    let html = `
        <section class="detail-card">

            <h2>需要验证的地方</h2>
    `;


    points.forEach(
        point => {

            html += `
                <article>

                    <h3>
                        ${escapeHTML(
                            point.claim ||
                            ""
                        )}
                    </h3>

                    <p>
                        <strong>
                            为什么：
                        </strong>

                        ${formatText(
                            point.why ||
                            ""
                        )}
                    </p>

                    <p>
                        <strong>
                            证据类型：
                        </strong>

                        ${formatText(
                            point.evidenceType ||
                            ""
                        )}
                    </p>

                </article>
            `;
        }
    );


    html += `
        </section>
    `;


    return html;
}


/* ==================================================
   Sources
================================================== */

function renderSources(
    sources
) {

    if (
        !Array.isArray(sources) ||
        sources.length === 0
    ) {

        return "";
    }


    let html = `
        <section class="source-card">

            <h2>来源</h2>

            <div>
    `;


    sources.forEach(
        source => {

            if (
                source &&
                source.name
            ) {

                html += `
                    <p>
                        ${escapeHTML(
                            source.name
                        )}
                    </p>
                `;
            }
        }
    );


    html += `
            </div>

        </section>
    `;


    return html;
}


/* ==================================================
   Charts
================================================== */

function renderCharts(
    charts
) {

    if (
        !Array.isArray(charts) ||
        charts.length === 0
    ) {

        return "";
    }


    let html = "";


    charts.forEach(
        (chart, index) => {

            if (
                !Array.isArray(
                    chart.labels
                ) ||
                !Array.isArray(
                    chart.values
                )
            ) {

                return;
            }


            const canvasId =
                `chart-${Date.now()}-${index}`;


            html += `
                <section
                    class="chart-card"
                >

                    <h2>
                        ${escapeHTML(
                            chart.title ||
                            "图表"
                        )}
                    </h2>

                    <canvas
                        id="${canvasId}"
                        class="detail-chart"
                        data-labels='${JSON.stringify(
                            chart.labels
                        )}'
                        data-values='${JSON.stringify(
                            chart.values
                        )}'
                        data-unit="${escapeHTML(
                            chart.unit ||
                            ""
                        )}"
                    ></canvas>

                </section>
            `;
        }
    );


    return html;
}


/* ==================================================
   Canvas
================================================== */

function drawAllCharts() {

    const canvases =
        detailContent.querySelectorAll(
            "canvas.detail-chart"
        );


    canvases.forEach(
        canvas => {

            let labels = [];
            let values = [];


            try {

                labels =
                    JSON.parse(
                        canvas.dataset.labels
                    );

                values =
                    JSON.parse(
                        canvas.dataset.values
                    );

            } catch (error) {

                return;
            }


            const unit =
                canvas.dataset.unit ||
                "";


            const ctx =
                canvas.getContext(
                    "2d"
                );


            const width =
                canvas.clientWidth ||
                700;

            const height =
                280;


            canvas.width =
                width *
                window.devicePixelRatio;

            canvas.height =
                height *
                window.devicePixelRatio;


            ctx.scale(
                window.devicePixelRatio,
                window.devicePixelRatio
            );


            ctx.clearRect(
                0,
                0,
                width,
                height
            );


            if (
                values.length === 0
            ) {

                return;
            }


            const maxValue =
                Math.max(
                    ...values.map(
                        value =>
                            Number(
                                value
                            ) || 0
                    )
                );


            if (
                maxValue <= 0
            ) {

                return;
            }


            const left =
                50;

            const right =
                20;

            const top =
                20;

            const bottom =
                50;


            const chartWidth =
                width -
                left -
                right;

            const chartHeight =
                height -
                top -
                bottom;


            ctx.beginPath();

            ctx.moveTo(
                left,
                top
            );

            ctx.lineTo(
                left,
                height - bottom
            );

            ctx.lineTo(
                width - right,
                height - bottom
            );

            ctx.stroke();


            const barWidth =
                chartWidth /
                values.length *
                0.6;


            values.forEach(
                (value, index) => {

                    const number =
                        Number(
                            value
                        ) || 0;


                    const barHeight =
                        number /
                        maxValue *
                        chartHeight;


                    const x =
                        left +
                        (
                            index + 0.5
                        ) *
                        (
                            chartWidth /
                            values.length
                        ) -
                        barWidth / 2;


                    const y =
                        height -
                        bottom -
                        barHeight;


                    ctx.fillRect(
                        x,
                        y,
                        barWidth,
                        barHeight
                    );


                    ctx.fillText(
                        String(
                            labels[index] ??
                            ""
                        ),
                        x,
                        height -
                        bottom +
                        20
                    );


                    ctx.fillText(
                        `${number}${unit}`,
                        x,
                        y - 8
                    );
                }
            );
        }
    );
}


/* ==================================================
   点击卡片
================================================== */

async function openNode(
    nodeId,
    nodeTitle,
    nodeSummary
) {

    const currentPath =
        pageStack.map(
            item =>
                item.title
        );


    const cacheKey =
        [
            ...currentPath,
            nodeId
        ].join(
            " > "
        );


    /*
       已经打开过：
       直接恢复，不重新调用 AI。
    */

    if (
        nodeCache.has(
            cacheKey
        )
    ) {

        const cached =
            nodeCache.get(
                cacheKey
            );


        pageStack.push(
            {
                type:
                    "node",

                title:
                    cached.title,

                data:
                    cached
            }
        );


        renderNode(
            cached
        );

        return;
    }


    showLoading(
        "正在把这个问题继续展开……"
    );


    try {

        const response =
            await postJSON(
                "/api/detail-node",
                {
                    question:
                        question,

                    nodeTitle:
                        nodeTitle,

                    nodeSummary:
                        nodeSummary,

                    path:
                        currentPath
                }
            );


        const node =
            response.node;


        node.title =
            node.title ||
            nodeTitle;


        node.summary =
            node.summary ||
            nodeSummary;


        if (
            !Array.isArray(
                node.steps
            )
        ) {

            node.steps = [];
        }


        if (
            !Array.isArray(
                node.children
            )
        ) {

            node.children = [];
        }


        if (
            !Array.isArray(
                node.verification
            )
        ) {

            node.verification = [];
        }


        if (
            !Array.isArray(
                node.comparisons
            )
        ) {

            node.comparisons = [];
        }


        if (
            !Array.isArray(
                node.charts
            )
        ) {

            node.charts = [];
        }


        if (
            !Array.isArray(
                node.sources
            )
        ) {

            node.sources = [];
        }


        nodeCache.set(
            cacheKey,
            node
        );


        pageStack.push(
            {
                type:
                    "node",

                title:
                    node.title,

                data:
                    node
            }
        );


        renderNode(
            node
        );


    } catch (error) {

        console.error(
            error
        );


        detailContent.innerHTML = `
            <section class="detail-card">

                <h2>
                    展开失败
                </h2>

                <p>
                    ${formatText(
                        error.message
                    )}
                </p>

            </section>
        `;
    }
}


/* ==================================================
   点击事件统一处理
================================================== */

detailContent.addEventListener(
    "click",
    event => {

        const card =
            event.target.closest(
                "[data-node-id]"
            );


        if (!card) {
            return;
        }


        openNode(
            card.dataset.nodeId,
            card.dataset.nodeTitle,
            card.dataset.nodeSummary
        );
    }
);


/* ==================================================
   键盘 / 辅助操作
================================================== */

detailContent.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Enter" &&
            event.key !== " "
        ) {

            return;
        }


        const card =
            event.target.closest(
                "[data-node-id]"
            );


        if (!card) {
            return;
        }


        event.preventDefault();


        openNode(
            card.dataset.nodeId,
            card.dataset.nodeTitle,
            card.dataset.nodeSummary
        );
    }
);


/* ==================================================
   返回
================================================== */

function goBack() {

    /*
       当前还在根详细页：
       返回 explain.html
    */

    if (
        pageStack.length <= 1
    ) {

        window.location.href =
            "explain.html";

        return;
    }


    /*
       当前是深层节点：
       删除当前节点，
       恢复真正的上一级。
    */

    pageStack.pop();


    const previous =
        pageStack[
            pageStack.length - 1
        ];


    if (
        previous.type === "root"
    ) {

        detailQuestion.textContent =
            question;

        renderRoot(
            previous.data
        );

    } else {

        renderNode(
            previous.data
        );
    }
}


detailBackButton.addEventListener(
    "click",
    goBack
);


/* ==================================================
   初始加载
================================================== */

async function loadRoot() {

    if (!question) {

        detailQuestion.textContent =
            "没有找到问题";

        detailContent.innerHTML = `
            <section class="detail-card">

                <h2>
                    无法打开详细解释
                </h2>

                <p>
                    没有找到当前问题。
                </p>

            </section>
        `;

        return;
    }


    showLoading(
        "正在建立详细解释……"
    );


    try {

        const response =
            await postJSON(
                "/api/detail",
                {
                    question:
                        question
                }
            );


        const detail =
            normalizeRootDetail(
                response.detail
            );


        pageStack.length =
            0;


        pageStack.push(
            {
                type:
                    "root",

                title:
                    question,

                data:
                    detail
            }
        );


        renderRoot(
            detail
        );


    } catch (error) {

        console.error(
            error
        );


        detailContent.innerHTML = `
            <section class="detail-card">

                <h2>
                    详细解释生成失败
                </h2>

                <p>
                    ${formatText(
                        error.message
                    )}
                </p>

            </section>
        `;
    }
}


loadRoot();