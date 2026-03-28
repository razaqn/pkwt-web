import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';

interface TextBlockEditorProps {
  content: string;
  onChange: (content: string) => void;
  style: {
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
    align?: 'left' | 'center' | 'right' | 'justify';
  };
  selected: boolean;
}

export default function TextBlockEditor({ content, onChange, style, selected }: TextBlockEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, bulletList: false, orderedList: false, blockquote: false, codeBlock: false, horizontalRule: false }),
      TextAlign.configure({ types: ['paragraph'] }),
      Underline,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getText());
    },
    editorProps: {
      attributes: {
        style: `font-size: ${style.fontSize || 12}px; color: ${style.color || '#000'}; text-align: ${style.align || 'left'}; line-height: 1.5; outline: none; min-height: 1.5em; text-align-last: ${style.align || 'left'};`,
        class: 'tiptap-editor',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getText()) {
      editor.commands.setContent(content || '');
    }
  }, [content]);

  useEffect(() => {
    if (!editor) return;
    if (style.bold) editor.chain().focus().setBold().run();
    else editor.chain().focus().unsetBold().run();
    if (style.italic) editor.chain().focus().setItalic().run();
    else editor.chain().focus().unsetItalic().run();
    if (style.underline) editor.chain().focus().setUnderline().run();
    else editor.chain().focus().unsetUnderline().run();
  }, [editor, style.bold, style.italic, style.underline]);

  if (!editor) return null;

  return (
    <div className={`rounded border ${selected ? 'border-primary' : 'border-transparent'} px-2 py-1`}>
      <EditorContent editor={editor} />
    </div>
  );
}
