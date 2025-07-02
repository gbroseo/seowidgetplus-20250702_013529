# seowidgetplus-20250702_013529

A lightweight, embeddable in-page SEO research and writing assistant for WordPress.  
Runs entirely client-side using HTML, Tailwind CSS (via CDN) and vanilla JavaScript. Integrates SerpApi for SERP insights and TextRazor for entity extraction to provide competitor benchmarks, term and entity analysis, and live content optimization feedback.

Project Doc: https://docs.google.com/document/d/1FViEIbwX80O2EpD9mNLpUlqtIuzFTn23Q6dhdKtJyBo/

---

## Overview

SEOWidgetPlus lets WordPress users:

- Paste a loader snippet into a Custom HTML block  
- Enter SerpApi & TextRazor keys in a dynamic Settings panel  
- Research keywords/topics (SERP data, related searches, People-Also-Ask)  
- Generate heading outlines with competitor term frequencies  
- Explore entity lists with usage tips  
- Draft content in a rich-text editor with live SEO metrics (readability, keyword density, entity usage)  
- Export final content as HTML or plain text  

Everything is loaded via simple `<script>` tags?no build step required.

---

## Features

- Embeddable loader snippet for WordPress Custom HTML  
- Settings panel for API key management (persisted in `localStorage`)  
- Asynchronous SERP data via SerpApi (competitor benchmarks)  
- Entity extraction & recommendations via TextRazor  
- Related searches & People-Also-Ask suggestions  
- Heading outline generator with term-frequency tables  
- Entity browser with usage examples  
- Rich-text editor (bold, italic, headings, lists, links, undo/redo)  
- Live SEO feedback (readability, keyword density, entity count)  
- Export to HTML or plain text  
- Responsive design (three-column on desktop, stacked on mobile)  
- Accessibility: ARIA roles, keyboard navigation, screen-reader labels  
- Performance optimizations: debounced API calls, in-memory caching, lazy rendering  
- Error handling: spinners & toast notifications  
- Security guidance for client-side API key handling  

---

## Installation

1. **Clone or download** this repository:  
   ```bash
   git clone https://github.com/your-user/seowidgetplus-20250702_013529.git
   ```
2. **Host** the following files on your web server or CDN:  
   ```
   index.html
   styles.css
   config.json
   utils.js
   api.js
   ui.js
   editor.js
   widgetloader.js
   settingspanel.js
   main.js
   ```
3. **Embed** the loader snippet in a WordPress post/page (Custom HTML block):
   ```html
   <!-- Container for the widget -->
   <div id="seowidgetplus-root"></div>

   <!-- Loader snippet -->
   <script src="https://cdn.yoursite.com/widgetloader.js"></script>
   ```
4. **Publish** the page. The widget will appear in place of the `<div id="seowidgetplus-root">`.

---

## Usage

1. **Open Settings**  
   Click the ?? icon in the widget header and enter your SerpApi & TextRazor API keys.  
2. **Research**  
   - Navigate to the **Research** tab  
   - Enter a keyword or topic and click **Research**  
3. **Explore Results**  
   - **Research**: SERP data, related searches, People-Also-Ask  
   - **Outline**: Heading suggestions and term frequencies  
   - **Entities**: Entity list with usage tips  
4. **Edit**  
   Switch to the **Editor** tab to draft content. Live metrics (readability, keyword density, entity count) update as you type.  
5. **Export**  
   Use the export controls to download your draft as HTML or plain text.  

---

## Components

- **index.html** (.html)  
  Main demo page demonstrating widget embedding; provides the container element.

- **styles.css** (.css)  
  Custom utility classes and overrides for Tailwind CDN; handles layout, theming, responsiveness.

- **config.json** (.json)  
  Default configuration schema (focus keyword, domain, country, language, filters).

- **utils.js** (.js)  
  Helper functions:  
  - getLocal(key), setLocal(key,value), removeLocal(key)  
  - showToast(message,options)  
  - debounce(func,wait), throttle(func,limit)  
  Manages storage, accessibility enhancements, performance optimizations and security hints.

- **api.js** (.js)  
  SerpApi & TextRazor client:  
  - initApi({serpApiKey,textRazorKey})  
  - fetchSERPData(query), fetchRelatedSearches(query), fetchPeopleAlsoAsk(query)  
  - fetchEntityAnalysis(text)  
  Aggregates competitor benchmarks and entity lists.

- **ui.js** (.js)  
  UI controller:  
  - initUI(container)  
  - renderTabs(tabIds), switchTab(tabId)  
  - renderResearchTab(data), renderOutlineTab(data), renderEntitiesTab(data)  
  - showToast(message,type), showSpinner(target), hideSpinner(target)

- **editor.js** (.js)  
  Rich-text editor & live metrics:  
  - initEditor(container)  
  - registerToolbarButtons(configs), applyFormat(command)  
  - onContentChange(callback), updateMetrics(content)  
  - exportContent(format)

- **widgetloader.js** (.js)  
  Loader snippet (needs revision):  
  - loadCSS(href), loadScript(src,callback)  
  - bootstrapWidget()

- **settingspanel.js** (.js)  
  Settings modal:  
  - initSettingsPanel(container), openSettings(), closeSettings()  
  - saveApiKeys(serpKey,textRazorKey), loadApiKeys(), validateKey(key)

- **main.js** (.js)  
  Entry point:  
  - initMain(), loadConfig(), runInitSequence()  
  - handleKeywordSubmit(query), handleTabSwitch(tabId), handleExport(format)

---

## Dependencies

- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript (ES5 IIFE / UMD modules)
- SerpApi REST API
- TextRazor REST API
- Browser `localStorage`

---

## Architecture & Flow

1. **Loader Snippet** (`widgetloader.js`) injects:
   - Tailwind CSS CDN link  
   - `styles.css`  
   - Main bundle (`utils.js`, `settingspanel.js`, `api.js`, `ui.js`, `editor.js`, `main.js`)
2. **Settings Panel**  
   User enters API keys; values persisted to `localStorage`.
3. **Research Workflow**  
   - User submits a query  
   - `api.js` calls SerpApi & TextRazor  
   - `ui.js` renders results in **Research**, **Outline**, **Entities** tabs
4. **Editing Workflow**  
   - `editor.js` initializes a contentEditable area & formatting toolbar  
   - Live metrics update on content changes  
   - Export functionality

---

## Security & Performance

- API keys stored in `localStorage` (client-side). For production, consider proxying requests through a secure backend to hide keys.
- Debounced & cached API calls reduce redundant network requests.
- Lazy rendering and loading spinners improve perceived performance.

---

## Contributing

1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/my-widget`)  
3. Commit your changes (`git commit -m "Add new feature"`)  
4. Push to your branch (`git push origin feature/my-widget`)  
5. Open a Pull Request  

Please follow existing code style and include documentation for new features.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.