import React, { useMemo, useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import csharp from 'highlight.js/lib/languages/csharp';
import { Bold, Italic, List, ListOrdered, Code, CodeXml, Undo, Redo } from 'lucide-react';

const lowlight = createLowlight();

lowlight.register({
  javascript,
  typescript,
  python,
  java,
  sql,
  xml,
  css,
  json,
  bash,
  csharp
});

/**
 * Rich Text Editor Component
 * @param root0
 * @param root0.value
 * @param root0.onChange
 * @param root0.placeholder
 * @param root0.minHeightClass
 * @returns 
 */
const RichTextEditor = ({value, onChange, placeholder = '', minHeightClass = 'min-h-[120px]'}) => {
    const extensions = useMemo(() => [
        StarterKit.configure({
            codeBlock: false,
        }),
        CodeBlockLowlight.configure({
            lowlight,
            enableTabIndentation: true,
            tabSize: 2,
            defaultLanguage: 'plaintext',
        }),
    ], []);

    const editor = useEditor({
        extensions,
        content: value || '<p></p>',
        immediatelyRender: false,
        editorProps: {
        attributes: {
            class: `flashlearn-editor prose prose-slate max-w-none focus:outline-none ${minHeightClass}`,
        },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor) return;

        const currentHtml = editor.getHTML();
        const nextHtml = value || '<p></p>';

        if (currentHtml !== nextHtml) {
            editor.commands.setContent(nextHtml, false)
        }

    }, [editor, value])

    if (!editor) {
        return null;
    }


  return (
    <div className="rounded-xl border border-gray-300 bg-white">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 p-3">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'font-bold text-indigo-600' : 'text-gray-700'}
            >
                <Bold/>
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'font-bold text-indigo-600' : 'text-gray-700'}
            >
                <Italic/>
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'font-bold text-indigo-600' : 'text-gray-700'}
            >
                <List/>
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'font-bold text-indigo-600' : 'text-gray-700'}
            >
                <ListOrdered/>
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={editor.isActive('code') ? 'font-bold text-indigo-600' : 'text-gray-700'}
            >
                <CodeXml/>
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={editor.isActive('codeBlock') ? 'font-bold text-indigo-600' : 'text-gray-700'}
            >
                <Code/>
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="text-gray-700 disabled:opacity-40"
            >
                <Undo/>
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="text-gray-700 disabled:opacity-40"
            >
                <Redo/>
            </button>
        </div>

        <div className="p-3">
            <EditorContent editor={editor} />
            {!editor.getText().trim() && placeholder ? (
                <p className="pointer-events-none mt-[-1.75rem] text-sm text-gray-400">
                    {placeholder}
                </p>
            ) : null}
        </div>
    </div>
  )
}

export default RichTextEditor