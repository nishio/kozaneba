export type StaticBaDoc = Record<string, unknown>;

type StaticHtmlOptions = {
  title?: string;
  exportedAt?: Date;
};

const APP_NAME = "Kozaneba static viewer";

export const build_static_html = (
  doc: StaticBaDoc,
  options: StaticHtmlOptions = {}
): string => {
  const title = options.title?.trim() || "Kozaneba Ba";
  const exportedAt = (options.exportedAt ?? new Date()).toISOString();
  const json = escape_json_for_html({
    ...doc,
    static_export: {
      app: "Kozaneba",
      exported_at: exportedAt,
      viewer: "static-html-mvp",
    },
  });

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content="${APP_NAME}" />
    <title>${escape_html(title)} - Kozaneba static export</title>
    <style>${STATIC_VIEWER_STYLE}</style>
  </head>
  <body>
    <script type="application/json" id="kozaneba-data">${json}</script>
    <div id="toolbar">
      <div id="title">${escape_html(title)}</div>
      <div id="meta">Static Kozaneba export. External images remain linked by URL.</div>
      <button id="fit-button" type="button">Fit</button>
    </div>
    <div id="viewport">
      <div id="scene">
        <svg id="line-layer"></svg>
        <div id="item-layer"></div>
      </div>
    </div>
    <script>${STATIC_VIEWER_SCRIPT}</script>
  </body>
</html>
`;
};

export const make_static_html_filename = (
  title: string | undefined,
  now = new Date()
): string => {
  const date = now.toISOString().slice(0, 10);
  const base = (title?.trim() || "kozaneba")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return `${base || "kozaneba"}-${date}.html`;
};

const escape_html = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });

const escape_json_for_html = (value: unknown): string =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

const STATIC_VIEWER_STYLE = `
html,
body {
  margin: 0;
  min-height: 100%;
  overflow: hidden;
  background: #f2f2f2;
  color: #111;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

#toolbar {
  align-items: center;
  background: #000080;
  box-sizing: border-box;
  color: white;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto auto;
  height: 44px;
  left: 0;
  padding: 0 12px;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 10;
}

#title {
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#meta {
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#fit-button {
  background: white;
  border: 0;
  border-radius: 3px;
  color: #000080;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  height: 28px;
  padding: 0 12px;
}

#viewport {
  background: #f7f7f7;
  bottom: 0;
  cursor: grab;
  left: 0;
  overflow: hidden;
  position: fixed;
  right: 0;
  top: 44px;
}

#viewport.dragging {
  cursor: grabbing;
}

#scene {
  left: 0;
  position: absolute;
  top: 0;
  transform-origin: 0 0;
}

#line-layer {
  height: 1px;
  left: 0;
  overflow: visible;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 1px;
  z-index: 1;
}

#item-layer {
  left: 0;
  position: absolute;
  top: 0;
  z-index: 2;
}

.kozane {
  align-items: center;
  background: #ffc;
  border: 1px solid #aaa;
  box-sizing: border-box;
  color: #000;
  display: flex;
  justify-content: center;
  line-height: 0.95;
  opacity: 0.8;
  overflow: hidden;
  position: absolute;
  text-align: center;
  user-select: none;
  white-space: pre-wrap;
  word-break: break-word;
}

.kozane-content {
  box-sizing: border-box;
  padding: 4px;
  width: 100%;
}

.link-mark {
  bottom: 2px;
  color: #555;
  font-size: 12px;
  line-height: 1;
  position: absolute;
  right: 3px;
  white-space: nowrap;
}

.link-mark img {
  height: 14px;
  margin-left: 2px;
  vertical-align: text-bottom;
  width: 14px;
}

.group {
  border: 5px solid rgba(220, 220, 220, 1);
  border-radius: 5px;
  box-sizing: border-box;
  position: absolute;
  user-select: none;
}

.group-back {
  background: rgba(220, 220, 220, 0.5);
  height: calc(100% + 2px);
  left: -1px;
  position: absolute;
  top: -1px;
  width: calc(100% + 2px);
}

.group-title {
  background: rgba(220, 220, 220, 1);
  box-sizing: border-box;
  font-size: 101px;
  height: 126px;
  left: -1px;
  overflow: hidden;
  position: absolute;
  text-overflow: ellipsis;
  top: -1px;
  white-space: nowrap;
  width: calc(100% + 2px);
}

.scrapbox-card {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid #aaa;
  border-radius: 15px;
  box-sizing: border-box;
  color: #000;
  overflow: hidden;
  position: absolute;
}

.scrapbox-card img {
  display: block;
  max-width: 100%;
}

.scrapbox-title {
  font-weight: 600;
  padding: 10px 12px;
}

.scrapbox-description {
  margin: 0;
  padding: 0 12px 10px;
}

.scrapbox-description p {
  margin: 0;
}

.gyazo-card {
  border: 1px solid #aaa;
  box-sizing: border-box;
  object-fit: contain;
  position: absolute;
}

.line-label {
  fill: black;
  font-size: 12px;
  paint-order: stroke;
  pointer-events: none;
  stroke: white;
  stroke-width: 3px;
  text-anchor: middle;
  user-select: none;
}
`;

const STATIC_VIEWER_SCRIPT = `
(function () {
  "use strict";

  var KOZANE_WIDTH = 130;
  var KOZANE_HEIGHT = 100;
  var KOZANE_BORDER = 1;
  var SCRAPBOX_SIZE = 400;
  var GYAZO_SIZE = 200;
  var GROUP_PADDING = 25;
  var GROUP_BORDER = 5;
  var TITLE_HEIGHT = 125;
  var MINIMUM_GROUP_SIZE = 100;
  var GROUP_FORCED_PADDING = 25;

  var dataElement = document.getElementById("kozaneba-data");
  var doc = JSON.parse(dataElement.textContent || "{}");
  var itemStore = doc.itemStore || {};
  var drawOrder = doc.drawOrder || [];
  var annotations = doc.annotations || doc.annotation || [];
  var viewport = document.getElementById("viewport");
  var scene = document.getElementById("scene");
  var itemLayer = document.getElementById("item-layer");
  var lineLayer = document.getElementById("line-layer");
  var view = { x: 0, y: 0, scale: 1 };
  var parentByChild = buildParentMap();
  var contentBox = getItemsBox(drawOrder);

  render();
  fitToContents();
  setupInteractions();

  function buildParentMap() {
    var map = {};
    Object.keys(itemStore).forEach(function (id) {
      var item = itemStore[id];
      if (item && item.type === "group" && Array.isArray(item.items)) {
        item.items.forEach(function (childId) {
          map[childId] = id;
        });
      }
    });
    return map;
  }

  function render() {
    itemLayer.innerHTML = "";
    lineLayer.innerHTML = "";
    drawOrder.forEach(function (id) {
      renderItem(id, { x: 0, y: 0 });
    });
    renderLines();
    applyLineLayerBox();
  }

  function renderItem(id, offset) {
    var item = itemStore[id];
    if (!item) return;
    if (item.type === "kozane" || item.type === "piece") {
      renderKozane(item, offset);
    } else if (item.type === "group") {
      renderGroup(item, offset);
    } else if (item.type === "scrapbox") {
      renderScrapbox(item, offset);
    } else if (item.type === "gyazo") {
      renderGyazo(item, offset);
    }
  }

  function renderKozane(item, offset, overrides) {
    var scale = item.scale || 1;
    var width = KOZANE_WIDTH * scale;
    var height = KOZANE_HEIGHT * scale;
    var left = offset.x + item.position[0] - width / 2 - KOZANE_BORDER;
    var top = offset.y + item.position[1] - height / 2 - KOZANE_BORDER;
    var node = document.createElement("div");
    node.className = "kozane";
    setBox(node, left, top, width, height);
    node.style.fontSize = getFontSize(item.text || "", scale) + "px";
    if (overrides) setStyle(node, overrides);
    if (item.custom && item.custom.style) setStyle(node, item.custom.style);

    var content = document.createElement("div");
    content.className = "kozane-content";
    content.textContent = item.text || "";
    node.appendChild(content);

    if (item.custom && item.custom.url) {
      node.appendChild(renderLinkMark(item.custom.url, scale));
    }
    itemLayer.appendChild(node);
  }

  function renderLinkMark(url, scale) {
    var mark = document.createElement("div");
    mark.className = "link-mark";
    mark.style.fontSize = Math.max(10, 15 * scale) + "px";
    var link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "open";
    mark.appendChild(link);
    var favicon = document.createElement("img");
    favicon.alt = "";
    favicon.src = "https://s2.googleusercontent.com/s2/favicons?domain=" + encodeURIComponent(url);
    mark.appendChild(favicon);
    return mark;
  }

  function renderGroup(item, offset) {
    if (item.isOpen === false) {
      renderClosedGroup(item, offset);
      return;
    }
    var box = getItemBox(item);
    var node = document.createElement("div");
    node.className = "group";
    setBox(
      node,
      offset.x + box.left,
      offset.y + box.top,
      box.right - box.left,
      box.bottom - box.top
    );
    if (item.custom && item.custom.style) setStyle(node, item.custom.style);

    var back = document.createElement("div");
    back.className = "group-back";
    node.appendChild(back);

    if (item.text) {
      var title = document.createElement("div");
      title.className = "group-title";
      title.textContent = item.text;
      node.appendChild(title);
    }
    itemLayer.appendChild(node);

    var childOffset = {
      x: offset.x + item.position[0],
      y: offset.y + item.position[1],
    };
    (item.items || []).forEach(function (childId) {
      renderItem(childId, childOffset);
    });
  }

  function renderClosedGroup(item, offset) {
    var scale = item.scale || 1;
    var width = KOZANE_WIDTH * scale + GROUP_PADDING * 2;
    var height = KOZANE_HEIGHT * scale + GROUP_PADDING * 2;
    var left = offset.x + item.position[0] - width / 2 - GROUP_BORDER;
    var top = offset.y + item.position[1] - height / 2 - GROUP_BORDER;
    var node = document.createElement("div");
    node.className = "group";
    setBox(node, left, top, width, height);
    node.style.borderColor = "#ddd";
    if (item.custom && item.custom.style) setStyle(node, item.custom.style);
    var back = document.createElement("div");
    back.className = "group-back";
    node.appendChild(back);
    itemLayer.appendChild(node);

    renderKozane(
      {
        type: "kozane",
        id: "nameplate-" + item.id,
        text: getGroupTitle(item).replace(/\\n/g, " "),
        position: [0, 0],
        scale: item.scale || 1,
        custom: {},
      },
      { x: left + width / 2, y: top + height / 2 },
      { backgroundColor: "rgba(0, 0, 0, 0)", border: "none" }
    );
  }

  function renderScrapbox(item, offset) {
    var box = getItemBox(item);
    var node = document.createElement("div");
    node.className = "scrapbox-card";
    setBox(node, offset.x + box.left, offset.y + box.top, box.right - box.left, box.bottom - box.top);
    node.style.fontSize = 200 * (item.scale || 1) + "%";
    if (item.custom && item.custom.style) setStyle(node, item.custom.style);

    var title = document.createElement("div");
    title.className = "scrapbox-title";
    title.textContent = item.text || "";
    node.appendChild(title);

    if (item.image) {
      var image = document.createElement("img");
      image.alt = "";
      image.draggable = false;
      image.src = modifyImageUrl(item.image);
      node.appendChild(image);
    } else {
      var desc = document.createElement("div");
      desc.className = "scrapbox-description";
      (item.description || []).forEach(function (line) {
        var p = document.createElement("p");
        p.textContent = line;
        desc.appendChild(p);
      });
      node.appendChild(desc);
    }
    itemLayer.appendChild(node);
  }

  function renderGyazo(item, offset) {
    var scale = item.scale || 1;
    var size = GYAZO_SIZE * scale;
    var node = document.createElement("img");
    node.className = "gyazo-card";
    node.alt = item.text || "";
    node.draggable = false;
    node.src = modifyImageUrl(item.url || "");
    setBox(
      node,
      offset.x + item.position[0] - size / 2,
      offset.y + item.position[1] - size / 2,
      size,
      size
    );
    if (item.custom && item.custom.style) setStyle(node, item.custom.style);
    itemLayer.appendChild(node);
  }

  function renderLines() {
    annotations.forEach(function (annotation) {
      if (!annotation || annotation.type !== "line") return;
      var ids = (annotation.items || []).filter(function (id) { return itemStore[id]; });
      if (ids.length < 2) return;
      var positions = ids.map(getGlobalPosition);
      var center = average(positions);
      var strokeWidth = (annotation.custom && annotation.custom.stroke_width) || 1;
      var opacity = (annotation.custom && annotation.custom.opacity) || 0.2;

      ids.forEach(function (id, index) {
        var point = positions[index];
        var box = getGlobalBox(getEffectiveVisibleId(id));
        var start = boxLineCrosspoint(point, center, box);
        drawLine(start, center, strokeWidth, opacity);
        if ((annotation.heads || [])[index] === "arrow") {
          drawArrowHead(start, center, strokeWidth, opacity);
        }
      });

      if (annotation.label) {
        var label = svgElement("text");
        label.setAttribute("x", String(center[0]));
        label.setAttribute("y", String(center[1]));
        label.setAttribute("dominant-baseline", "middle");
        label.setAttribute("class", "line-label");
        label.textContent = annotation.label;
        lineLayer.appendChild(label);
      }
    });
  }

  function drawLine(p1, p2, strokeWidth, opacity) {
    var line = svgElement("line");
    line.setAttribute("x1", String(p1[0]));
    line.setAttribute("y1", String(p1[1]));
    line.setAttribute("x2", String(p2[0]));
    line.setAttribute("y2", String(p2[1]));
    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", String(strokeWidth));
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("opacity", String(opacity));
    lineLayer.appendChild(line);
  }

  function drawArrowHead(head, tail, strokeWidth, opacity) {
    var dx = head[0] - tail[0];
    var dy = head[1] - tail[1];
    var len = Math.sqrt(dx * dx + dy * dy);
    if (!len) return;
    var ux = dx / len;
    var uy = dy / len;
    var size = 10 + strokeWidth;
    var angle = Math.PI / 6;
    var p1 = rotateVector(ux, uy, angle, size);
    var p2 = rotateVector(ux, uy, -angle, size);
    drawLine([head[0] - p1[0], head[1] - p1[1]], head, strokeWidth, opacity);
    drawLine([head[0] - p2[0], head[1] - p2[1]], head, strokeWidth, opacity);
  }

  function getItemBox(item) {
    var x = item.position[0];
    var y = item.position[1];
    var scale = item.scale || 1;
    if (item.type === "kozane" || item.type === "piece") {
      return {
        left: x - (KOZANE_WIDTH / 2) * scale - KOZANE_BORDER,
        top: y - (KOZANE_HEIGHT / 2) * scale - KOZANE_BORDER,
        right: x + (KOZANE_WIDTH / 2) * scale + KOZANE_BORDER,
        bottom: y + (KOZANE_HEIGHT / 2) * scale + KOZANE_BORDER,
      };
    }
    if (item.type === "scrapbox") {
      return {
        left: x - (SCRAPBOX_SIZE / 2) * scale,
        top: y - (SCRAPBOX_SIZE / 2) * scale,
        right: x + (SCRAPBOX_SIZE / 2) * scale,
        bottom: y + (SCRAPBOX_SIZE / 2) * scale,
      };
    }
    if (item.type === "gyazo") {
      return {
        left: x - (GYAZO_SIZE / 2) * scale,
        top: y - (GYAZO_SIZE / 2) * scale,
        right: x + (GYAZO_SIZE / 2) * scale,
        bottom: y + (GYAZO_SIZE / 2) * scale,
      };
    }
    if (item.type === "group" && item.isOpen === false) {
      var width = KOZANE_WIDTH * scale + GROUP_PADDING * 2;
      var height = KOZANE_HEIGHT * scale + GROUP_PADDING * 2;
      return {
        left: x - width / 2,
        top: y - height / 2,
        right: x + width / 2,
        bottom: y + height / 2,
      };
    }
    if (item.type === "group") {
      var children = getItemsBox(item.items || []);
      var titleHeight = item.text ? TITLE_HEIGHT : 0;
      var box = {
        left: x + children.left - GROUP_PADDING - GROUP_BORDER,
        top: y + children.top - GROUP_PADDING - titleHeight - GROUP_BORDER,
        right: x + children.right + GROUP_PADDING + GROUP_BORDER,
        bottom: y + children.bottom + GROUP_PADDING + GROUP_BORDER,
      };
      var childWidth = children.right - children.left;
      var childHeight = children.bottom - children.top;
      var boxArea = childWidth * childHeight;
      var contentsArea = (item.items || []).length * KOZANE_WIDTH * KOZANE_HEIGHT;
      if (boxArea > 0 && contentsArea / boxArea > 0.7) {
        box.left -= GROUP_FORCED_PADDING;
        box.right += GROUP_FORCED_PADDING;
        box.top -= GROUP_FORCED_PADDING;
        box.bottom += GROUP_FORCED_PADDING;
      }
      if (!item.items || item.items.length === 0) {
        box.left -= MINIMUM_GROUP_SIZE / 2;
        box.right += MINIMUM_GROUP_SIZE / 2;
        box.top -= MINIMUM_GROUP_SIZE / 2;
        box.bottom += MINIMUM_GROUP_SIZE / 2;
      }
      return box;
    }
    return { left: 0, top: 0, right: 0, bottom: 0 };
  }

  function getItemsBox(ids) {
    if (!ids || ids.length === 0) return { left: -100, top: -100, right: 100, bottom: 100 };
    var box = null;
    ids.forEach(function (id) {
      var item = itemStore[id];
      if (!item) return;
      box = unionBox(box, getItemBox(item));
    });
    return box || { left: -100, top: -100, right: 100, bottom: 100 };
  }

  function getGlobalBox(id) {
    var item = itemStore[id];
    var box = getItemBox(item);
    var offset = getParentOffset(id);
    return {
      left: box.left + offset[0],
      top: box.top + offset[1],
      right: box.right + offset[0],
      bottom: box.bottom + offset[1],
    };
  }

  function getParentOffset(id) {
    var offset = [0, 0];
    var parent = parentByChild[id];
    while (parent) {
      var group = itemStore[parent];
      if (!group) break;
      offset[0] += group.position[0];
      offset[1] += group.position[1];
      parent = parentByChild[parent];
    }
    return offset;
  }

  function getGlobalPosition(id) {
    var effectiveId = getEffectiveVisibleId(id);
    var item = itemStore[effectiveId];
    var offset = getParentOffset(effectiveId);
    return [item.position[0] + offset[0], item.position[1] + offset[1]];
  }

  function getEffectiveVisibleId(id) {
    var current = id;
    var parent = parentByChild[current];
    while (parent) {
      var group = itemStore[parent];
      if (group && group.isOpen === false) {
        current = parent;
      }
      parent = parentByChild[parent];
    }
    return current;
  }

  function getGroupTitle(group) {
    if (group.text) return group.text;
    return (group.items || [])
      .map(function (id) {
        var item = itemStore[id];
        if (!item) return "";
        if (item.type === "group") return getGroupTitle(item);
        return item.text || "";
      })
      .join("\\n");
  }

  function fitToContents() {
    var width = Math.max(1, contentBox.right - contentBox.left);
    var height = Math.max(1, contentBox.bottom - contentBox.top);
    var scale = Math.min(
      1,
      Math.max(0.05, (viewport.clientWidth - 80) / width),
      Math.max(0.05, (viewport.clientHeight - 80) / height)
    );
    view.scale = scale;
    view.x = (viewport.clientWidth - width * scale) / 2 - contentBox.left * scale;
    view.y = (viewport.clientHeight - height * scale) / 2 - contentBox.top * scale;
    applyTransform();
  }

  function setupInteractions() {
    var dragging = false;
    var previous = null;
    viewport.addEventListener("pointerdown", function (event) {
      dragging = true;
      previous = [event.clientX, event.clientY];
      viewport.classList.add("dragging");
      viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener("pointermove", function (event) {
      if (!dragging || !previous) return;
      view.x += event.clientX - previous[0];
      view.y += event.clientY - previous[1];
      previous = [event.clientX, event.clientY];
      applyTransform();
    });
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("wheel", function (event) {
      event.preventDefault();
      var rect = viewport.getBoundingClientRect();
      var cx = event.clientX - rect.left;
      var cy = event.clientY - rect.top;
      var before = screenToWorld(cx, cy);
      var factor = Math.exp(-event.deltaY / 500);
      view.scale = Math.min(8, Math.max(0.03, view.scale * factor));
      view.x = cx - before[0] * view.scale;
      view.y = cy - before[1] * view.scale;
      applyTransform();
    }, { passive: false });
    document.getElementById("fit-button").addEventListener("click", fitToContents);
    window.addEventListener("resize", fitToContents);

    function endDrag() {
      dragging = false;
      previous = null;
      viewport.classList.remove("dragging");
    }
  }

  function applyTransform() {
    scene.style.transform = "translate(" + view.x + "px, " + view.y + "px) scale(" + view.scale + ")";
  }

  function applyLineLayerBox() {
    lineLayer.setAttribute("viewBox", contentBox.left + " " + contentBox.top + " " + Math.max(1, contentBox.right - contentBox.left) + " " + Math.max(1, contentBox.bottom - contentBox.top));
    lineLayer.style.left = contentBox.left + "px";
    lineLayer.style.top = contentBox.top + "px";
    lineLayer.style.width = Math.max(1, contentBox.right - contentBox.left) + "px";
    lineLayer.style.height = Math.max(1, contentBox.bottom - contentBox.top) + "px";
  }

  function screenToWorld(x, y) {
    return [(x - view.x) / view.scale, (y - view.y) / view.scale];
  }

  function setBox(node, left, top, width, height) {
    node.style.left = left + "px";
    node.style.top = top + "px";
    node.style.width = width + "px";
    node.style.height = height + "px";
  }

  function setStyle(node, style) {
    Object.keys(style || {}).forEach(function (key) {
      var value = style[key];
      if (value === undefined || value === null) return;
      node.style[key] = String(value);
    });
  }

  function getFontSize(text, scale) {
    var length = Math.max(1, String(text || "").length);
    var size = Math.min(67, Math.max(10, 130 / Math.sqrt(length + 1)));
    return size * scale;
  }

  function modifyImageUrl(url) {
    if (url.indexOf("https://gyazo.com/") === 0) {
      var items = url.split("/");
      if (items.length === 4) return url + "/thumb/400";
      if (items.length === 6 && items[4] === "thumb") {
        items[5] = "400";
        return items.join("/");
      }
    }
    return url;
  }

  function boxLineCrosspoint(start, end, box) {
    var x = start[0];
    var y = start[1];
    var dx = end[0] - start[0];
    var dy = end[1] - start[1];
    var left = box.left;
    var top = box.top;
    var width = box.right - box.left;
    var height = box.bottom - box.top;
    var right = box.right;
    var bottom = box.bottom;
    if (width <= 0 || height <= 0 || !(left <= x && x <= right && top <= y && y <= bottom)) return start;
    if (dx > 0) {
      var ey = (right - x) * dy;
      if ((top - y) * dx < ey && ey < (bottom - y) * dx) return [right, y + ey / dx];
    }
    if (dx < 0) {
      var eyLeft = (x - left) * dy;
      if ((y - top) * dx < eyLeft && eyLeft < (y - bottom) * dx) return [left, y - eyLeft / dx];
    }
    if (dy < 0) return [x + ((top - y) * dx) / dy, top];
    return [x + ((bottom - y) * dx) / dy, bottom];
  }

  function average(points) {
    var sum = points.reduce(function (acc, point) {
      acc[0] += point[0];
      acc[1] += point[1];
      return acc;
    }, [0, 0]);
    return [sum[0] / points.length, sum[1] / points.length];
  }

  function unionBox(a, b) {
    if (!a) return b;
    return {
      left: Math.min(a.left, b.left),
      top: Math.min(a.top, b.top),
      right: Math.max(a.right, b.right),
      bottom: Math.max(a.bottom, b.bottom),
    };
  }

  function rotateVector(x, y, angle, size) {
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    return [(x * cos - y * sin) * size, (x * sin + y * cos) * size];
  }

  function svgElement(name) {
    return document.createElementNS("http://www.w3.org/2000/svg", name);
  }
})();
`;
