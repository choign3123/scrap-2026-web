import type { Editor, JSONContent } from '@tiptap/core';

/** 내용이 없는 paragraph는 사용자가 Enter로 만든 빈 줄을 의미합니다. */
function isEmptyParagraph(node: JSONContent) {
  return node.type === 'paragraph' && (!node.content || node.content.length === 0);
}

/** Tiptap이 과거에 문서 끝에 저장한 빈 paragraph 표식을 제거합니다. */
function removeTrailingEmptyParagraphMarkers(markdown: string) {
  return markdown
    .replace(
      /(?:\r?\n)*(?:(?:&nbsp;|\u00a0)[\t ]*(?:\r?\n)*)+$/,
      '',
    )
    .trimEnd();
}

/**
 * Tiptap 문서를 표준 Markdown으로 변환합니다.
 * 최상위 블록 사이의 표준 빈 줄은 그대로 보존하고, 문서 끝의 빈 paragraph만 제외합니다.
 */
export function serializeEditorToMarkdown(editor: Editor) {
  const document = editor.getJSON();
  const blocks = [...(document.content ?? [])];

  // 에디터가 문서 끝에 유지하는 빈 paragraph는 실제 메모 내용이 아니므로 저장하지 않습니다.
  while (blocks.length > 0 && isEmptyParagraph(blocks.at(-1)!)) {
    blocks.pop();
  }

  // Markdown extension을 항상 등록하는 에디터에서만 호출하므로 manager가 존재합니다.
  const markdown = editor.markdown!.serialize({
    ...document,
    content: blocks,
  });

  return removeTrailingEmptyParagraphMarkers(markdown);
}

/**
 * DB의 표준 Markdown을 내용 변경 없이 에디터에 전달합니다.
 * 과거 데이터 끝에 남아 있을 수 있는 `&nbsp;` 빈 paragraph 표식만 정리합니다.
 */
export function prepareMarkdownForEditor(markdown: string) {
  return removeTrailingEmptyParagraphMarkers(markdown);
}
