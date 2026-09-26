import { useEffect, useRef } from 'react';
import { Markdown } from '@tiptap/markdown';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  prepareMarkdownForEditor,
  serializeEditorToMarkdown,
} from '../../../utils/markdown';
import styles from './MarkdownEditor.module.css';

interface MarkdownEditorProps {
  initialMarkdown: string;
  onChange: (markdown: string) => void;
  /** 화면 목적에 맞는 안내 문구를 지정하며, 읽기 전용 화면에서는 표시하지 않습니다. */
  placeholder?: string;
  /** 보조 기술이 편집기와 읽기 전용 본문을 구분할 수 있도록 이름을 지정합니다. */
  ariaLabel?: string;
  /** 공지 상세처럼 서버 Markdown을 수정 없이 렌더링할 때 사용합니다. */
  readOnly?: boolean;
}

/**
 * Tiptap 문서와 서버 Markdown 사이의 변환만 담당하는 블록 기반 에디터입니다.
 * 입력 DOM과 커서는 ProseMirror가 관리하며 React가 직접 수정하지 않습니다.
 */
function MarkdownEditor({
  initialMarkdown,
  onChange,
  placeholder = '메모를 작성해 주세요.',
  ariaLabel = '메모 작성',
  readOnly = false,
}: MarkdownEditorProps) {
  const initialMarkdownRef = useRef(initialMarkdown);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    // 부모가 다시 렌더링되어도 Editor 인스턴스를 만들지 않고 최신 callback만 참조합니다.
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          // 현재 서비스 범위에서는 h1~h3까지만 허용합니다.
          heading: { levels: [1, 2, 3] },
          link: {
            // 상세 화면에서는 링크를 열고, 편집 화면에서는 커서 위치 변경을 우선합니다.
            openOnClick: readOnly,
            enableClickSelection: true,
            defaultProtocol: 'https',
            // [표시문구](https://주소) 입력을 실제 link mark로 변환합니다.
            markdownLinks: true,
          },
        }),
        // 서버 Markdown을 Tiptap document로 parse하고 저장 시 다시 serialize합니다.
        Markdown,
        Placeholder.configure({
          placeholder: readOnly ? '' : placeholder,
        }),
      ],
      // DB의 표준 Markdown 구조를 유지한 채 Tiptap document로 불러옵니다.
      content: prepareMarkdownForEditor(initialMarkdownRef.current),
      contentType: 'markdown',
      editorProps: {
        attributes: {
          'aria-label': ariaLabel,
          'aria-multiline': readOnly ? 'false' : 'true',
          role: readOnly ? 'article' : 'textbox',
          spellcheck: 'true',
        },
      },
      editable: !readOnly,
      onUpdate: ({ editor: updatedEditor }) => {
        if (!readOnly) {
          // HTML이나 JSON이 아닌 표준 Markdown을 부모에 전달합니다.
          onChangeRef.current(serializeEditorToMarkdown(updatedEditor));
        }
      },
    },
    [],
  );

  return (
    <div className={`${styles.editorShell} ${readOnly ? styles.readOnly : ''}`}>
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
}

export default MarkdownEditor;
