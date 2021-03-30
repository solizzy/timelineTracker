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
        <svg><use href="icons.svg#${statusFormat}"></use></svg>
        <span>${statusFormat}</span>
      </div>
      <div class="izzy-thread-info">
        <a class="izzy-thread-name" ${urlFormat}>${name}</a>
        <div class="izzy-thread-details">${summary}</div>
      </div>
    </li>
  `;
  };

  const trackerFormat = `
  <div class="izzy-timeline">
    ${data.map(sectionFormat).join("")}
  </div>
`;

  return trackerFormat;
}
