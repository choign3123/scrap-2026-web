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
}

/**
 * Tiptap 문서와 서버 Markdown 사이의 변환만 담당하는 블록 기반 에디터입니다.
 * 입력 DOM과 커서는 ProseMirror가 관리하며 React가 직접 수정하지 않습니다.
 */
function MarkdownEditor({ initialMarkdown, onChange }: MarkdownEditorProps) {
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
            openOnClick: false,
            enableClickSelection: true,
            defaultProtocol: 'https',
            // [표시문구](https://주소) 입력을 실제 link mark로 변환합니다.
            markdownLinks: true,
          },
        }),
        // 서버 Markdown을 Tiptap document로 parse하고 저장 시 다시 serialize합니다.
        Markdown,
        Placeholder.configure({
          placeholder: '메모를 작성해 주세요.',
        }),
      ],
      // DB의 표준 Markdown 구조를 유지한 채 Tiptap document로 불러옵니다.
      content: prepareMarkdownForEditor(initialMarkdownRef.current),
      contentType: 'markdown',
      editorProps: {
        attributes: {
          'aria-label': '메모 작성',
          'aria-multiline': 'true',
          role: 'textbox',
          spellcheck: 'true',
        },
      },
      onUpdate: ({ editor: updatedEditor }) => {
        // HTML이나 JSON이 아닌 표준 Markdown을 부모에 전달합니다.
        onChangeRef.current(serializeEditorToMarkdown(updatedEditor));
      },
    },
    [],
  );

  return (
    <div className={styles.editorShell}>
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
}

export default MarkdownEditor;
