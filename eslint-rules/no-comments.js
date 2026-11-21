"use strict";

const fs = require("node:fs");
const path = require("node:path");

const DIRECTIVE =
  /^\s*(eslint-disable|eslint-enable|eslint-env|global\s|globals\s|exported\s|@ts-expect-error|@ts-ignore|@ts-nocheck|@ts-check|prettier-ignore|@type\s|@jsx|@jsxImportSource|webpackChunkName|webpackIgnore)/;

function isDirective(comment) {
  if (comment.type === "Shebang") return true;
  if (comment.type === "Line" && comment.value.startsWith("/ <reference")) return true;
  const body = comment.value.replace(/^\*+/, "").replace(/^\s*\*\s?/gm, "");
  return DIRECTIVE.test(body);
}

const baselineCache = new Map();

function readBaseline(file) {
  if (!file) return {};
  const absolute = path.resolve(file);
  if (!baselineCache.has(absolute)) {
    baselineCache.set(absolute, fs.existsSync(absolute) ? JSON.parse(fs.readFileSync(absolute, "utf8")) : {});
  }
  return baselineCache.get(absolute);
}

module.exports = {
  isDirective,
  meta: {
    type: "suggestion",
    docs: { description: "Disallow code comments beyond each file's ratcheted baseline (docs/adr/0001)" },
    schema: [
      {
        type: "object",
        properties: { baselineFile: { type: ["string", "null"] } },
        additionalProperties: false,
      },
    ],
    messages: {
      noComment:
        "No comments (docs/adr/0001). Delete it, move the decision into docs/adr, or file an issue for the workaround. {{file}} may hold {{allowed}} and has {{count}}.",
      lowerBaseline:
        "{{file}} now holds {{count}} comments but comment-baseline.json still allows {{allowed}}. Run `npm run comments:baseline` to lock in the lower count.",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const baselineFile = options.baselineFile === undefined ? "comment-baseline.json" : options.baselineFile;
    const file = path.relative(context.getCwd(), context.getFilename()).split(path.sep).join("/");
    const allowed = readBaseline(baselineFile)[file] || 0;
    return {
      Program(node) {
        const comments = context.getSourceCode().getAllComments().filter((c) => !isDirective(c));
        const data = { file, allowed: String(allowed), count: String(comments.length) };
        if (comments.length > allowed) {
          for (const comment of comments) context.report({ loc: comment.loc, messageId: "noComment", data });
        } else if (comments.length < allowed) {
          context.report({ node, loc: { line: 1, column: 0 }, messageId: "lowerBaseline", data });
        }
      },
    };
  },
};
