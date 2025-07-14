import showdown from "showdown";
import "./style.css";

let defaultUrl = "https://raw.githubusercontent.com/luvit/luv/refs/heads/master/docs/docs.md";
const app = document.querySelector<HTMLDivElement>("#app")!;
const control = document.querySelector<HTMLDivElement>("#err")!;

/**
 * INPUT
 */
const input = document.createElement("input");
input.type = "text";
input.id = "url";
input.placeholder = "Enter URL";
/**
 * SUBMIT BUTTON
 */
const submit = document.createElement("button");
submit.textContent = "Find";
submit.addEventListener("click", async () => {
    const url = input.value.trim() || defaultUrl;
    const steps = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let index = 0;

    // Start spinner
    const interval = setInterval(() => {
        index = (index + 1) % steps.length;
        submit.innerHTML = steps[index];
    }, 100);

    // Allow browser to render first spinner frame
    await new Promise(requestAnimationFrame);

    try {
        if (!isLikelyMarkdown(url)) {
            throw new Error(
                "The URL does not point to a valid Markdown file. Please ensure the URL ends with '.md' or '.markdown'."
            );
        }

        const markdown = await fetchMarkdown(url);
        const html = convertMarkdownToHtml(markdown);
        app.innerHTML = html;
    } catch (err: any) {
        input.value = "";
        control.innerHTML = `⚠️ ${err.message || err}`;
        const resetButton = document.createElement("button");
        resetButton.textContent = "Reset";
        resetButton.addEventListener("click", reset);
        control.appendChild(resetButton);
    } finally {
        clearInterval(interval);
        submit.innerHTML = "Find";
    }
});

/**
 * WRAPPER
 */
const wrapper = document.createElement("div");
wrapper.classList.add("wrapper");
wrapper.appendChild(input);
wrapper.appendChild(submit);
app.appendChild(wrapper);
/**
 * functions
 */
const reset = () => {
    app.innerHTML = "";
    app.appendChild(wrapper);
    control.innerHTML = "";
    input.value = "";
};

const fetchMarkdown = async (url: string) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.text();
    } catch (err: any) {
        throw new Error(`Error fetching content: ${err.message}`);
    }
};

const convertMarkdownToHtml = (markdown: string) => {
    try {
        const converter = new showdown.Converter();
        return converter.makeHtml(markdown);
    } catch (err: any) {
        throw new Error(`Error converting markdown: ${err.message}`);
    }
};

const isLikelyMarkdown = (url: string) => {
    return url.endsWith(".md") || url.endsWith(".markdown");
};
