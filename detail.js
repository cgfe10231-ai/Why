const API_BASE =
    "https://why-api.cgfe10231.workers.dev";


const detailQuestion =
    document.getElementById("detailQuestion");

const detailContent =
    document.getElementById("detailContent");

const detailBackButton =
    document.getElementById("detailBackButton");


/*
 * =========================
 * 当前问题
 * =========================
 *
 * 第一优先级：
 * detail.html?question=xxxx
 *
 * 第二优先级：
 * sessionStorage
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
 * 没有问题就不能继续。
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

    /*
     * =========================
     * 页面栈
     * =========================
     *
     * 第 0 层永远是根详细页。
     *
     * 例如：
     *
     * Root
     *   ↓
     * 节点 A
     *   ↓
     * 节点 A-1
     *
     * pageStack：
     *
     * [
     *   Root,
     *   Node A,
     *   Node A-1
     * ]
     */

    const pageStack = [
        {
            type: "root",
            key: "root",
            data: null
        }
    ];


    /*
     * 已经生成过的节点放这里。
     *
     * 再次点击同一个节点：
     * 直接读取缓存，
     * 不重新请求 AI。
     */

    const nodeCache =
        new Map();


    /*
     * =========================
     * HTML 安全处理
     * =========================
     */

    function escapeHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";
        }


        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    function text(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";
        }

        return escapeHtml(value);
    }


    /*
     * =========================
     * 通用区块
     * =========================
     */

    function renderTitle(title) {

        return `
            <h2>
                ${text(title)}
            </h2>
        `;
    }


    function renderParagraph(value) {

        if (!value) {

            return "";
        }


        return `
            <p>
                ${text(value)}
            </p>
        `;
    }


    /*
     * =========================
     * 比较
     * =========================
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

            if (
                !item ||
                typeof item !== "object"
            ) {

                continue;
            }


            html += `
                <div class="detail-card">

                    <h3>
                        ${text(item.title)}
                    </h3>

                    ${
                        renderParagraph(
                            item.description ||
                            item.explanation
                        )
                    }

                    ${
                        renderParagraph(
                            item.difference
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
     * =========================
     * 验证
     * =========================
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

            if (
                typeof item === "string"
            ) {

                html += `
                    <div class="detail-card">
                        ${text(item)}
                    </div>
                `;

                continue;
            }


            if (
                !item ||
                typeof item !== "object"
            ) {

                continue;
            }


            html += `
                <div class="detail-card">

                    <h3>
                        ${text(item.claim)}
                    </h3>

                    ${
                        renderParagraph(
                            item.method
                        )
                    }

                    ${
                        renderParagraph(
                            item.evidence
                        )
                    }

                    ${
                        renderParagraph(
                            item.note
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
     * =========================
     * 图表
     * =========================
     *
     * 目前这里只负责显示 AI 返回的
     * 图表说明。
     *
     * 后面接真实数据时再做真正图表。
     */

    function renderCharts(charts) {

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
            const chart of charts
        ) {

            if (
                !chart ||
                typeof chart !== "object"
            ) {

                continue;
            }


            html += `
                <div class="detail-card">

                    <h3>
                        ${text(chart.title)}
                    </h3>

                    ${
                        renderParagraph(
                            chart.description
                        )
                    }

                    ${
                        renderParagraph(
                            chart.dataMeaning
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
     * =========================
     * 来源
     * =========================
     */

    function renderSources(sources) {

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
            const source of sources
        ) {

            if (
                typeof source === "string"
            ) {

                html += `
                    <div class="detail-card">
                        ${text(source)}
                    </div>
                `;

                continue;
            }


            if (
                !source ||
                typeof source !== "object"
            ) {

                continue;
            }


            html += `
                <div class="detail-card">

                    <h3>
                        ${text(source.title)}
                    </h3>

                    ${
                        renderParagraph(
                            source.description
                        )
                    }

                    ${
                        renderParagraph(
                            source.url
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
     * =========================
     * 根详细页
     * =========================
     */

    function renderRoot(data) {

        if (!data) {

            detailContent.textContent =
                "详细解释为空。";

            return;
        }


        let html = "";


        /*
         * 总结
         */

        if (data.summary) {

            html += `
                <section>

                    <h2>核心机制</h2>

                    <p>
                        ${text(data.summary)}
                    </p>

                </section>
            `;
        }


        /*
         * 关键讨论节点
         *
         * 每一个卡片都可以继续展开。
         */

        if (
            Array.isArray(data.sections) &&
            data.sections.length > 0
        ) {

            html += `
                <section>

                    <h2>展开讨论</h2>

                    <div
                        id="rootNodeList"
                    >
            `;


            for (
                const section of data.sections
            ) {

                if (
                    !section ||
                    !section.id
                ) {

                    continue;
                }


                html += `
                    <button
                        type="button"
                        class="detail-card detail-node-card"
                        data-node-id="${text(section.id)}"
                    >

                        <strong>
                            ${text(section.title)}
                        </strong>

                        ${
                            section.summary
                                ? `<span>
                                      ${text(
                                          section.summary
                                      )}
                                   </span>`
                                : ""
                        }

                    </button>
                `;
            }


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


        if (data.limitations) {

            html += `
                <section>

                    <h2>边界与限制</h2>

                    <p>
                        ${text(
                            data.limitations
                        )}
                    </p>

                </section>
            `;
        }


        html +=
            renderSources(
                data.sources
            );


        if (data.conclusion) {

            html += `
                <section>

                    <h2>结论</h2>

                    <p>
                        ${text(
                            data.conclusion
                        )}
                    </p>

                </section>
            `;
        }


        detailContent.innerHTML =
            html;


        /*
         * 根节点按钮统一走事件代理。
         */

        const rootNodeList =
            document.getElementById(
                "rootNodeList"
            );


        if (rootNodeList) {

            rootNodeList.addEventListener(
                "click",
                event => {

                    const card =
                        event.target.closest(
                            "[data-node-id]"
                        );

                    if (!card) {
                        return;
                    }


                    const id =
                        card.dataset.nodeId;


                    const section =
                        data.sections.find(
                            item =>
                                item.id === id
                        );


                    if (!section) {
                        return;
                    }


                    openNode({
                        id:
                            section.id,

                        title:
                            section.title,

                        summary:
                            section.summary
                    });
                }
            );
        }
    }


    /*
     * =========================
     * 深入节点页
     * =========================
     */

    function renderNode(data) {

        if (!data) {

            detailContent.textContent =
                "详细解释为空。";

            return;
        }


        let html = "";


        /*
         * 当前节点摘要
         */

        if (data.summary) {

            html += `
                <section>

                    <h2>当前问题</h2>

                    <p>
                        ${text(data.summary)}
                    </p>

                </section>
            `;
        }


        /*
         * 因果 / 推导步骤
         */

        if (
            Array.isArray(data.steps) &&
            data.steps.length > 0
        ) {

            html += `
                <section>

                    <h2>推导过程</h2>
            `;


            for (
                let i = 0;
                i < data.steps.length;
                i++
            ) {

                const step =
                    data.steps[i];


                if (
                    typeof step === "string"
                ) {

                    html += `
                        <div class="detail-card">

                            <strong>
                                第 ${i + 1} 步
                            </strong>

                            <p>
                                ${text(step)}
                            </p>

                        </div>
                    `;

                    continue;
                }


                if (
                    !step ||
                    typeof step !== "object"
                ) {

                    continue;
                }


                html += `
                    <div class="detail-card">

                        <strong>
                            ${text(
                                step.title ||
                                `第 ${i + 1} 步`
                            )}
                        </strong>

                        ${
                            renderParagraph(
                                step.description
                            )
                        }

                        ${
                            renderParagraph(
                                step.reason
                            )
                        }

                        ${
                            renderParagraph(
                                step.condition
                            )
                        }

                    </div>
                `;
            }


            html += `
                </section>
            `;
        }


        /*
         * 更深一层的问题
         */

        if (
            Array.isArray(data.children) &&
            data.children.length > 0
        ) {

            html += `
                <section>

                    <h2>继续展开</h2>

                    <div
                        id="childNodeList"
                    >
            `;


            for (
                const child of data.children
            ) {

                if (
                    !child ||
                    !child.id
                ) {

                    continue;
                }


                html += `
                    <button
                        type="button"
                        class="detail-card detail-node-card"
                        data-node-id="${text(child.id)}"
                    >

                        <strong>
                            ${text(
                                child.title
                            )}
                        </strong>

                        ${
                            child.summary
                                ? `<span>
                                      ${text(
                                          child.summary
                                      )}
                                   </span>`
                                : ""
                        }

                    </button>
                `;
            }


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


        if (data.limitations) {

            html += `
                <section>

                    <h2>边界与限制</h2>

                    <p>
                        ${text(
                            data.limitations
                        )}
                    </p>

                </section>
            `;
        }


        html +=
            renderSources(
                data.sources
            );


        detailContent.innerHTML =
            html;


        /*
         * 子节点事件代理
         */

        const childNodeList =
            document.getElementById(
                "childNodeList"
            );


        if (childNodeList) {

            childNodeList.addEventListener(
                "click",
                event => {

                    const card =
                        event.target.closest(
                            "[data-node-id]"
                        );


                    if (!card) {
                        return;
                    }


                    const id =
                        card.dataset.nodeId;


                    const child =
                        data.children.find(
                            item =>
                                item.id === id
                        );


                    if (!child) {
                        return;
                    }


                    openNode({
                        id:
                            child.id,

                        title:
                            child.title,

                        summary:
                            child.summary
                    });
                }
            );
        }
    }


    /*
     * =========================
     * 获取根详细解释
     * =========================
     */

    async function loadRoot() {

        detailQuestion.textContent =
            rootQuestion;

        detailContent.textContent =
            "正在生成详细解释……";


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
                            question:
                                rootQuestion
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


            /*
             * 缓存根页
             */

            pageStack[0].data =
                data.detail;


            renderRoot(
                data.detail
            );

        } catch (error) {

            console.error(error);

            detailContent.textContent =
                "生成详细解释失败，请再试一次。";
        }
    }


    /*
     * =========================
     * 获取一个更深节点
     * =========================
     */

    async function openNode(node) {

        /*
         * 唯一缓存键：
         *
         * 父级路径 + 当前节点 id
         *
         * 这样不同父节点下即使出现
         * 同名节点，也不会混在一起。
         */

        const path =
            pageStack.map(
                page =>
                    page.title || "根详细解释"
            );


        const cacheKey =
            path.join(" > ") +
            "::" +
            node.id;


        /*
         * 已经打开过：
         * 直接恢复。
         */

        if (
            nodeCache.has(cacheKey)
        ) {

            const cached =
                nodeCache.get(
                    cacheKey
                );


            pageStack.push({
                type: "node",

                key: cacheKey,

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


        /*
         * 先进入“加载中”的节点页
         */

        detailQuestion.textContent =
            node.title;


        detailContent.textContent =
            "正在展开这个问题……";


        try {

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


            if (!response.ok) {

                throw new Error(
                    "节点解释生成失败"
                );
            }


            const result =
                await response.json();


            if (!result.node) {

                throw new Error(
                    "服务器没有返回节点解释"
                );
            }


            /*
             * 缓存
             */

            nodeCache.set(
                cacheKey,
                result.node
            );


            /*
             * 压入自己的页面栈
             */

            pageStack.push({

                type: "node",

                key: cacheKey,

                title:
                    node.title,

                data:
                    result.node
            });


            renderNode(
                result.node
            );


        } catch (error) {

            console.error(error);

            detailContent.textContent =
                "这个深入问题生成失败，请再试一次。";
        }
    }


    /*
     * =========================
     * 返回
     * =========================
     *
     * 这里彻底不用 history.back()
     */

    detailBackButton.onclick =
        () => {

            /*
             * 当前是深入节点：
             *
             * Node A-1
             *    ↓ 返回
             * Node A
             */

            if (
                pageStack.length > 1
            ) {

                pageStack.pop();


                const previous =
                    pageStack[
                        pageStack.length - 1
                    ];


                if (
                    previous.type === "root"
                ) {

                    detailQuestion.textContent =
                        rootQuestion;


                    renderRoot(
                        previous.data
                    );

                } else {

                    detailQuestion.textContent =
                        previous.title;


                    renderNode(
                        previous.data
                    );
                }


                return;
            }


            /*
             * 当前已经是根详细页：
             *
             * Detail Root
             *      ↓ 返回
             * Explain
             *
             * 明确指定地址，
             * 不让浏览器自己猜历史。
             */

            window.location.href =
                "explain.html?question=" +
                encodeURIComponent(
                    rootQuestion
                );
        };


    /*
     * 启动根详细页
     */

    loadRoot();
}