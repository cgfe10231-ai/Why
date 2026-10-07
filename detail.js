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


/*
 * ==================================================
 * 当前问题
 * ==================================================
 */

function getRootQuestion() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const urlQuestion =
        params.get("question");


    if (urlQuestion) {

        sessionStorage.setItem(
            "whyQuestion",
            urlQuestion
        );

        return urlQuestion;
    }


    const savedQuestion =
        sessionStorage.getItem(
            "whyQuestion"
        );


    return savedQuestion || "";
}


const rootQuestion =
    getRootQuestion();


/*
 * ==================================================
 * 页面栈
 * ==================================================
 *
 * root
 *   ↓
 * A
 *   ↓
 * A-1
 *   ↓
 * A-1-1
 *
 * 返回：
 *
 * A-1-1
 *   ↓
 * A-1
 *   ↓
 * A
 *   ↓
 * root
 *   ↓
 * explain
 */

const pageStack = [

    {
        type: "root",
        title: "详细解释",
        data: null
    }

];


const nodeCache =
    new Map();


/*
 * ==================================================
 * HTML 安全处理
 * ==================================================
 */

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


/*
 * ==================================================
 * 最关键：
 * 从 AI 对象中取真正的标题
 * ==================================================
 */

function getTitle(item) {

    if (
        item === null ||
        item === undefined
    ) {

        return "";
    }


    if (
        typeof item === "string"
    ) {

        return item;
    }


    if (
        typeof item !== "object"
    ) {

        return String(item);
    }


    const candidates = [

        item.title,

        item.question,

        item.nodeTitle,

        item.name,

        item.heading,

        item.topic,

        item.label

    ];


    for (
        const value of candidates
    ) {

        if (
            typeof value === "string" &&
            value.trim()
        ) {

            return value.trim();
        }
    }


    return "";
}


/*
 * ==================================================
 * 取摘要
 * ==================================================
 */

function getSummary(item) {

    if (
        item === null ||
        item === undefined
    ) {

        return "";
    }


    if (
        typeof item === "string"
    ) {

        return item;
    }


    if (
        typeof item !== "object"
    ) {

        return String(item);
    }


    const candidates = [

        item.summary,

        item.description,

        item.explanation,

        item.reason,

        item.content,

        item.text

    ];


    for (
        const value of candidates
    ) {

        if (
            typeof value === "string" &&
            value.trim()
        ) {

            return value.trim();
        }
    }


    return "";
}


/*
 * ==================================================
 * 如果 AI 返回结构稍微不同，
 * 仍然尽量找到 sections
 * ==================================================
 */

function getSections(data) {

    if (!data) {
        return [];
    }


    if (
        Array.isArray(
            data.sections
        )
    ) {

        return data.sections;
    }


    if (
        Array.isArray(
            data.deepDive
        )
    ) {

        return data.deepDive;
    }


    if (
        Array.isArray(
            data.children
        )
    ) {

        return data.children;
    }


    return [];
}


/*
 * ==================================================
 * 通用文字
 * ==================================================
 */

function renderText(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    if (
        typeof value === "string" ||
        typeof value === "number"
    ) {

        return `
            <p>
                ${escapeHtml(value)}
            </p>
        `;
    }


    return renderObject(
        value
    );
}


function renderObject(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    if (
        typeof value === "string"
    ) {

        return `
            <p>
                ${escapeHtml(value)}
            </p>
        `;
    }


    if (
        Array.isArray(value)
    ) {

        let html = "";


        for (
            const item of value
        ) {

            html +=
                renderObject(
                    item
                );
        }


        return html;
    }


    if (
        typeof value === "object"
    ) {

        let html = "";


        for (
            const [
                key,
                item
            ] of Object.entries(value)
        ) {

            if (
                key === "id" ||
                key === "type"
            ) {

                continue;
            }


            html += `
                <div class="detail-card">

                    <strong>
                        ${escapeHtml(
                            key
                        )}
                    </strong>

                    ${
                        renderObject(
                            item
                        )
                    }

                </div>
            `;
        }


        return html;
    }


    return "";
}


/*
 * ==================================================
 * 比较
 * ==================================================
 */

function renderComparisons(
    comparisons
) {

    if (
        !Array.isArray(comparisons) ||
        comparisons.length === 0
    ) {

        return "";
    }


    let html = `
        <section>

            <h2>比较</h2>
    `;


    for (
        const item of comparisons
    ) {

        const title =
            getTitle(item);


        const summary =
            getSummary(item);


        html += `
            <div class="detail-card">

                ${
                    title
                        ? `<h3>
                               ${escapeHtml(
                                   title
                               )}
                           </h3>`
                        : ""
                }

                ${
                    summary
                        ? `<p>
                               ${escapeHtml(
                                   summary
                               )}
                           </p>`
                        : renderObject(item)
                }

            </div>
        `;
    }


    html += `
        </section>
    `;


    return html;
}


/*
 * ==================================================
 * 验证
 * ==================================================
 */

function renderVerification(
    verification
) {

    if (
        !Array.isArray(verification) ||
        verification.length === 0
    ) {

        return "";
    }


    let html = `
        <section>

            <h2>验证</h2>
    `;


    for (
        const item of verification
    ) {

        html += `
            <div class="detail-card">

                ${
                    renderObject(
                        item
                    )
                }

            </div>
        `;
    }


    html += `
        </section>
    `;


    return html;
}


/*
 * ==================================================
 * 图表说明
 * ==================================================
 */

function renderCharts(
    charts
) {

    if (
        !Array.isArray(charts) ||
        charts.length === 0
    ) {

        return "";
    }


    let html = `
        <section>

            <h2>数据与图表</h2>
    `;


    for (
        const item of charts
    ) {

        html += `
            <div class="detail-card">

                ${
                    renderObject(
                        item
                    )
                }

            </div>
        `;
    }


    html += `
        </section>
    `;


    return html;
}


/*
 * ==================================================
 * 来源
 * ==================================================
 */

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
        <section>

            <h2>资料来源</h2>
    `;


    for (
        const item of sources
    ) {

        html += `
            <div class="detail-card">

                ${
                    renderObject(
                        item
                    )
                }

            </div>
        `;
    }


    html += `
        </section>
    `;


    return html;
}


/*
 * ==================================================
 * 根详细页
 * ==================================================
 */

function renderRoot(
    data
) {

    if (!data) {

        detailContent.textContent =
            "详细解释为空。";

        return;
    }


    let html = "";


    /*
     * 核心解释
     */

    const summary =
        getSummary(data);


    if (summary) {

        html += `
            <section>

                <h2>核心机制</h2>

                <p>
                    ${escapeHtml(
                        summary
                    )}
                </p>

            </section>
        `;
    }


    /*
     * 展开讨论卡片
     */

    const sections =
        getSections(data);


    if (
        sections.length > 0
    ) {

        html += `
            <section>

                <h2>展开讨论</h2>

                <div id="rootNodeList">
        `;


        sections.forEach(
            (section, index) => {

                const title =
                    getTitle(section);


                const sectionSummary =
                    getSummary(section);


                /*
                 * 即使 AI 没给 id，
                 * 也由前端生成稳定 id。
                 */

                const id =
                    String(
                        section.id ||
                        "section-" +
                        index
                    );


                /*
                 * 没有标题就不要产生
                 * 一个完全空的卡片。
                 */

                const finalTitle =
                    title ||
                    (
                        sectionSummary
                            ? sectionSummary
                            : "继续展开"
                    );


                html += `
                    <button
                        type="button"
                        class="detail-card detail-node-card"
                        data-node-id="${escapeHtml(id)}"
                        data-node-title="${escapeHtml(finalTitle)}"
                        data-node-summary="${escapeHtml(sectionSummary)}"
                    >

                        <strong>
                            ${escapeHtml(
                                finalTitle
                            )}
                        </strong>

                        ${
                            sectionSummary &&
                            sectionSummary !== finalTitle
                                ? `<span>
                                       ${escapeHtml(
                                           sectionSummary
                                       )}
                                   </span>`
                                : ""
                        }

                    </button>
                `;
            }
        );


        html += `
                </div>

            </section>
        `;
    }


    html +=
        renderComparisons(
            data.comparisons
        );


    html +=
        renderCharts(
            data.charts
        );


    html +=
        renderVerification(
            data.verificationPoints
        );


    if (
        data.limitations
    ) {

        html += `
            <section>

                <h2>边界与限制</h2>

                ${
                    renderText(
                        data.limitations
                    )
                }

            </section>
        `;
    }


    html +=
        renderSources(
            data.sources
        );


    if (
        data.conclusion
    ) {

        html += `
            <section>

                <h2>结论</h2>

                ${
                    renderText(
                        data.conclusion
                    )
                }

            </section>
        `;
    }


    detailContent.innerHTML =
        html;


    /*
     * ==========================================
     * 卡片统一事件入口
     * ==========================================
     */

    const rootNodeList =
        document.getElementById(
            "rootNodeList"
        );


    if (rootNodeList) {

        rootNodeList.onclick =
            event => {

                const card =
                    event.target.closest(
                        "[data-node-id]"
                    );


                if (!card) {
                    return;
                }


                const node = {

                    id:
                        card.dataset.nodeId,

                    title:
                        card.dataset.nodeTitle,

                    summary:
                        card.dataset.nodeSummary
                };


                console.log(
                    "OPEN ROOT NODE:",
                    node
                );


                openNode(
                    node
                );
            };
    }
}


/*
 * ==================================================
 * 深入节点页面
 * ==================================================
 */

function renderNode(
    data
) {

    if (!data) {

        detailContent.textContent =
            "这个深入问题没有内容。";

        return;
    }


    let html = "";


    /*
     * 当前节点摘要
     */

    const summary =
        getSummary(data);


    if (summary) {

        html += `
            <section>

                <h2>当前问题</h2>

                <p>
                    ${escapeHtml(
                        summary
                    )}
                </p>

            </section>
        `;
    }


    /*
     * 推导步骤
     */

    if (
        Array.isArray(
            data.steps
        ) &&
        data.steps.length > 0
    ) {

        html += `
            <section>

                <h2>推导过程</h2>
        `;


        data.steps.forEach(
            (step, index) => {

                html += `
                    <div class="detail-card">

                        <strong>
                            ${
                                escapeHtml(
                                    getTitle(step) ||
                                    `第 ${index + 1} 步`
                                )
                            }
                        </strong>

                        ${
                            renderObject(
                                step
                            )
                        }

                    </div>
                `;
            }
        );


        html += `
            </section>
        `;
    }


    /*
     * 下一层节点
     */

    const children =
        Array.isArray(
            data.children
        )
            ? data.children
            : [];


    if (
        children.length > 0
    ) {

        html += `
            <section>

                <h2>继续展开</h2>

                <div id="childNodeList">
        `;


        children.forEach(
            (child, index) => {

                const title =
                    getTitle(child);


                const childSummary =
                    getSummary(child);


                const id =
                    String(
                        child.id ||
                        "child-" +
                        index
                    );


                const finalTitle =
                    title ||
                    (
                        childSummary
                            ? childSummary
                            : "继续展开"
                    );


                html += `
                    <button
                        type="button"
                        class="detail-card detail-node-card"
                        data-node-id="${escapeHtml(id)}"
                        data-node-title="${escapeHtml(finalTitle)}"
                        data-node-summary="${escapeHtml(childSummary)}"
                    >

                        <strong>
                            ${escapeHtml(
                                finalTitle
                            )}
                        </strong>

                        ${
                            childSummary &&
                            childSummary !== finalTitle
                                ? `<span>
                                       ${escapeHtml(
                                           childSummary
                                       )}
                                   </span>`
                                : ""
                        }

                    </button>
                `;
            }
        );


        html += `
                </div>

            </section>
        `;
    }


    html +=
        renderVerification(
            data.verification
        );


    html +=
        renderComparisons(
            data.comparisons
        );


    html +=
        renderCharts(
            data.charts
        );


    if (
        data.limitations
    ) {

        html += `
            <section>

                <h2>边界与限制</h2>

                ${
                    renderText(
                        data.limitations
                    )
                }

            </section>
        `;
    }


    html +=
        renderSources(
            data.sources
        );


    detailContent.innerHTML =
        html;


    const childNodeList =
        document.getElementById(
            "childNodeList"
        );


    if (childNodeList) {

        childNodeList.onclick =
            event => {

                const card =
                    event.target.closest(
                        "[data-node-id]"
                    );


                if (!card) {
                    return;
                }


                const node = {

                    id:
                        card.dataset.nodeId,

                    title:
                        card.dataset.nodeTitle,

                    summary:
                        card.dataset.nodeSummary
                };


                console.log(
                    "OPEN CHILD NODE:",
                    node
                );


                openNode(
                    node
                );
            };
    }
}


/*
 * ==================================================
 * 根详细解释
 * ==================================================
 */

async function loadRoot() {

    detailQuestion.textContent =
        rootQuestion;


    detailContent.textContent =
        "正在生成详细解释……";


    try {

        const response =
            await fetch(
                API_BASE +
                "/api/detail",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        question:
                            rootQuestion
                    })
                }
            );


        const rawText =
            await response.text();


        console.log(
            "DETAIL RAW:",
            rawText
        );


        if (!response.ok) {

            throw new Error(
                rawText ||
                "详细解释生成失败"
            );
        }


        const data =
            JSON.parse(
                rawText
            );


        if (!data.detail) {

            throw new Error(
                "服务器没有返回 detail"
            );
        }


        pageStack[0].data =
            data.detail;


        renderRoot(
            data.detail
        );


    } catch (error) {

        console.error(
            error
        );


        detailContent.textContent =
            "生成详细解释失败：" +
            error.message;
    }
}


/*
 * ==================================================
 * 打开深入节点
 * ==================================================
 */

async function openNode(
    node
) {

    /*
     * 先检查有没有真正的标题。
     */

    if (
        !node ||
        !node.title ||
        !node.title.trim()
    ) {

        detailContent.textContent =
            "这个卡片没有得到有效的问题标题。";

        console.error(
            "INVALID NODE:",
            node
        );

        return;
    }


    /*
     * 当前路径
     */

    const path =
        pageStack.map(
            page =>
                page.title
        );


    /*
     * 缓存键
     */

    const cacheKey =
        path.join(" > ") +
        "::" +
        node.id;


    /*
     * 已经生成过。
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


        pageStack.push({

            type:
                "node",

            title:
                node.title,

            data:
                cached

        });


        detailQuestion.textContent =
            node.title;


        renderNode(
            cached
        );


        return;
    }


    detailQuestion.textContent =
        node.title;


    detailContent.textContent =
        "正在展开这个问题……";


    try {

        console.log(
            "REQUEST NODE:",
            {
                question:
                    rootQuestion,

                nodeTitle:
                    node.title,

                nodeSummary:
                    node.summary,

                path:
                    path
            }
        );


        const response =
            await fetch(
                API_BASE +
                "/api/detail-node",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        question:
                            rootQuestion,

                        nodeTitle:
                            node.title,

                        nodeSummary:
                            node.summary || "",

                        path:
                            path

                    })
                }
            );


        const rawText =
            await response.text();


        console.log(
            "NODE RAW:",
            rawText
        );


        if (!response.ok) {

            throw new Error(
                rawText ||
                "节点接口请求失败"
            );
        }


        let result;


        try {

            result =
                JSON.parse(
                    rawText
                );

        } catch {

            throw new Error(
                "节点接口没有返回合法 JSON：" +
                rawText
            );
        }


        if (!result.node) {

            throw new Error(
                "服务器没有返回 node：" +
                rawText
            );
        }


        nodeCache.set(
            cacheKey,
            result.node
        );


        pageStack.push({

            type:
                "node",

            title:
                node.title,

            data:
                result.node

        });


        renderNode(
            result.node
        );


    } catch (error) {

        console.error(
            error
        );


        detailContent.innerHTML = `
            <section>

                <h2>
                    深入解释失败
                </h2>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

            </section>
        `;
    }
}


/*
 * ==================================================
 * 返回
 * ==================================================
 */

detailBackButton.onclick =
    () => {

        /*
         * 当前有深入节点：
         *
         * A-1
         *  ↓ 返回
         * A
         */

        if (
            pageStack.length > 1
        ) {

            pageStack.pop();


            const previous =
                pageStack[
                    pageStack.length - 1
                ];


            detailQuestion.textContent =
                previous.type === "root"
                    ? rootQuestion
                    : previous.title;


            if (
                previous.type === "root"
            ) {

                renderRoot(
                    previous.data
                );

            } else {

                renderNode(
                    previous.data
                );
            }


            return;
        }


        /*
         * 当前已经是根详细页：
         *
         * Detail
         *   ↓
         * Explain
         */

        window.location.href =
            "explain.html?question=" +
            encodeURIComponent(
                rootQuestion
            );
    };


/*
 * ==================================================
 * 启动
 * ==================================================
 */

if (!rootQuestion) {

    detailQuestion.textContent =
        "没有找到问题";

    detailContent.textContent =
        "无法打开详细解释：没有找到当前问题。";


    detailBackButton.onclick =
        () => {

            window.location.href =
                "index.html";
        };

} else {

    loadRoot();
}