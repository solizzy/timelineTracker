(async () => {
  try {
    const MINUTE_IN_MS = 60000;
    const expireTime = Date.now() + 10 * MINUTE_IN_MS;

    const trackerDatabase =
      "https://notelizzy.api.stdlib.com/gsheets-database@dev/select/sortedBy/?key=actTitle";
    const data = await fetchCache(trackerDatabase, expireTime);
    const htmlOutput = createTrackerHTML(data);
    document.querySelector(".izzy-timeline-wrapper").innerHTML = htmlOutput;
  } catch (error) {
    console.error(error);
  }
})();

function writeCache(key, data, expires) {
  return window.localStorage.setItem(key, JSON.stringify({ data, expires }));
}

function readCache(key) {
  return JSON.parse(window.localStorage.getItem(key));
}

async function fetchCache(url, expireTime = 0) {
  const cached = readCache(url);
  const willExpire = expireTime > 0;
  const isExpired = cached?.expires < Date.now();

  if (cached !== null && (!isExpired || !willExpire)) {
    return cached.data;
  }

  const response = await fetch(url);
  const data = await response.json();
  writeCache(url, data, expireTime);
  return data;
}


function createTrackerHTML(data) {
  const sectionFormat = ([sectionName, threads]) => {
    return `
    <div class="izzy-divider">${sectionName}</div>
      <ul class="izzy-threads-group">
        ${threads.map(threadFormat).join("")}
      </ul>
    `;
  };

  const threadFormat = ({ status, url, name, summary }) => {
    const urlFormat = url ? `href="${url}"` : "";
    const statusFormat = status || "active";

    return `
    <li class="izzy-thread izzy-${statusFormat}">
      <div class="izzy-thread-status">
        <svg><use href="#izzy-icon-${statusFormat}"></use></svg>
        <span>${statusFormat}</span>
      </div>
      <div class="izzy-thread-info">
        <a class="izzy-thread-name" ${urlFormat}>${name}</a>
        <div class="izzy-thread-details">${summary}</div>
      </div>
    </li>
  `;
  };

  const SVG_DATA = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
  <symbol id="izzy-icon-active" viewBox="0 0 384 512">
    <title>Status: Active</title>
    <path
      fill="currentColor"
      d="M384 121.9v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9zM248 160h136v328c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V24C0 10.7 10.7 0 24 0h200v136c0 13.2 10.8 24 24 24zm-59.6 109.6l-95 95-5.4 48.2c-.7 6.4 4.7 11.9 11.2 11.2l48.2-5.4 95-95c2-2 2-5.2 0-7.2l-46.8-46.8c-2-2-5.2-2-7.2 0zm109.7-30.3l-25.4-25.4c-7.9-7.9-20.7-7.9-28.6 0l-26 26c-2 2-2 5.2 0 7.2l46.8 46.8c2 2 5.2 2 7.2 0l26-26c7.9-7.9 7.9-20.7 0-28.6z"
    ></path>
  </symbol>

  <symbol id="izzy-icon-hiatus" viewBox="0 0 384 512">
    <title>Status: On Hiatus</title>
    <path
      fill="currentColor"
      d="M384 121.9v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9zM248 160h136v328c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V24C0 10.7 10.7 0 24 0h200v136c0 13.2 10.8 24 24 24zm-59.6 109.6l-95 95-5.4 48.2c-.7 6.4 4.7 11.9 11.2 11.2l48.2-5.4 95-95c2-2 2-5.2 0-7.2l-46.8-46.8c-2-2-5.2-2-7.2 0zm109.7-30.3l-25.4-25.4c-7.9-7.9-20.7-7.9-28.6 0l-26 26c-2 2-2 5.2 0 7.2l46.8 46.8c2 2 5.2 2 7.2 0l26-26c7.9-7.9 7.9-20.7 0-28.6z"
    ></path>
  </symbol>

  <symbol id="izzy-icon-idea" viewBox="0 0 384 512">
    <title>Status: Idea</title>
    <path
      fill="currentColor"
      d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm160-14.1v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z"
    ></path>
  </symbol>

  <symbol id="izzy-icon-done" viewBox="0 0 384 512">
    <title>Status: Done</title>
    <path
      fill="currentColor"
      d="M384 121.941V128H256V0h6.059c6.365 0 12.47 2.529 16.971 7.029l97.941 97.941A24.005 24.005 0 0 1 384 121.941zM248 160h136v328c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V24C0 10.745 10.745 0 24 0h200v136c0 13.2 10.8 24 24 24zm65.296 109.732l-28.169-28.398c-4.667-4.705-12.265-4.736-16.97-.068L162.12 346.45l-45.98-46.352c-4.667-4.705-12.266-4.736-16.971-.068L70.772 328.2c-4.705 4.667-4.736 12.265-.068 16.97l82.601 83.269c4.667 4.705 12.265 4.736 16.97.068l142.953-141.805c4.705-4.667 4.736-12.265.068-16.97z"
    ></path>
  </symbol>

  <symbol id="izzy-icon-dropped" viewBox="0 0 384 512">
    <title>Status: Dropped</title>
    <path
      fill="currentColor"
      d="M377,105,279.1,7a24,24,0,0,0-17-7H256V128H384v-6.1A23.92,23.92,0,0,0,377,105ZM224,136V0H24A23.94,23.94,0,0,0,0,24V488a23.94,23.94,0,0,0,24,24H360a23.94,23.94,0,0,0,24-24V160H248A24.07,24.07,0,0,1,224,136Zm72,176v16a16,16,0,0,1-16,16H104a16,16,0,0,1-16-16V312a16,16,0,0,1,16-16H280A16,16,0,0,1,296,312Z"
    ></path>
  </symbol>
</svg>`

  const trackerFormat = `
  <div class="izzy-timeline">
    ${data.map(sectionFormat).join("")}
  </div>
  ${SVG_DATA}
`;

  return trackerFormat;
}
