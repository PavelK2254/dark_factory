import test from "node:test";
import assert from "node:assert/strict";
import {
  buildEpicChildrenQuery,
  findNextActionableChild,
  byCreatedAsc,
} from "../.github/scripts/epic-runner.mjs";

function child(key, statusCategoryKey, created) {
  return {
    key,
    fields: {
      status: { statusCategory: { key: statusCategoryKey } },
      created,
    },
  };
}

test("buildEpicChildrenQuery returns expected JQL body shape", () => {
  const body = buildEpicChildrenQuery("KAN-42");
  assert.equal(body.jql, 'parent = "KAN-42"');
  assert.deepEqual(body.fields, ["summary", "status", "issuetype", "parent", "created"]);
  assert.equal(body.maxResults, 200);
});

test("buildEpicChildrenQuery strips embedded quotes from key", () => {
  const body = buildEpicChildrenQuery('KAN-1"; DROP--');
  assert.equal(body.jql, 'parent = "KAN-1; DROP--"');
});

test("findNextActionableChild returns undefined for empty array", () => {
  assert.equal(findNextActionableChild([]), undefined);
});

test("findNextActionableChild returns undefined when all children are done", () => {
  const items = [
    child("KAN-2", "done", "2026-05-01T10:00:00.000Z"),
    child("KAN-3", "done", "2026-05-01T11:00:00.000Z"),
  ];
  assert.equal(findNextActionableChild(items), undefined);
});

test("findNextActionableChild returns the first non-done child", () => {
  const items = [
    child("KAN-2", "done", "2026-05-01T10:00:00.000Z"),
    child("KAN-3", "new", "2026-05-01T11:00:00.000Z"),
    child("KAN-4", "indeterminate", "2026-05-01T12:00:00.000Z"),
  ];
  const next = findNextActionableChild(items);
  assert.equal(next.key, "KAN-3");
});

test("findNextActionableChild returns first In-Progress when prior children are Done", () => {
  const items = [
    child("KAN-2", "done", "2026-05-01T10:00:00.000Z"),
    child("KAN-3", "indeterminate", "2026-05-01T11:00:00.000Z"),
  ];
  const next = findNextActionableChild(items);
  assert.equal(next.key, "KAN-3");
});

test("findNextActionableChild with afterCreated skips entries at or before that timestamp", () => {
  const items = [
    child("KAN-2", "new", "2026-05-01T10:00:00.000Z"),
    child("KAN-3", "new", "2026-05-01T11:00:00.000Z"),
    child("KAN-4", "new", "2026-05-01T12:00:00.000Z"),
  ];
  const next = findNextActionableChild(items, "2026-05-01T11:00:00.000Z");
  assert.equal(next.key, "KAN-4");
});

test("findNextActionableChild with afterCreated falls back to first not-Done if none after", () => {
  const items = [
    child("KAN-2", "new", "2026-05-01T10:00:00.000Z"),
    child("KAN-3", "done", "2026-05-01T11:00:00.000Z"),
  ];
  const next = findNextActionableChild(items, "2026-05-01T12:00:00.000Z");
  assert.equal(next.key, "KAN-2");
});

test("byCreatedAsc sorts ascending by created", () => {
  const items = [
    child("KAN-3", "new", "2026-05-01T12:00:00.000Z"),
    child("KAN-1", "new", "2026-05-01T10:00:00.000Z"),
    child("KAN-2", "new", "2026-05-01T11:00:00.000Z"),
  ];
  items.sort(byCreatedAsc);
  assert.deepEqual(items.map((i) => i.key), ["KAN-1", "KAN-2", "KAN-3"]);
});
