// import { Color } from '@tiptap/extension-color'
// import ListItem from "@tiptap/extension-list-item";
// import TextStyle from '@tiptap/extension-text-style'
import {
    CodeIcon,
    DividerHorizontalIcon,
    FontBoldIcon,
    FontItalicIcon,
    ImageIcon,
    LinkBreak1Icon,
    ListBulletIcon,
    QuoteIcon,
    StrikethroughIcon,
    UnderlineIcon,
} from "@radix-ui/react-icons";
import {
    Editor,
    EditorContent,
    EditorProvider,
    useCurrentEditor,
    useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";

import { BsTextParagraph } from "react-icons/bs";
import { FaListOl } from "react-icons/fa6";
import { BiCodeBlock } from "react-icons/bi";
import { IoIosUndo } from "react-icons/io";
import { IoIosRedo } from "react-icons/io";
import CustomPrompt from "./CustomPrompt";
import { useCallback } from "react";

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) {
        return null;
    }
    const promptCb = useCallback(
        (url: string) => {
            editor
                .chain()
                .focus()
                .setImage({ src: url, alt: "Image not found" })
                .run();
        },
        [editor]
    );

    return (
        <div className="rounded-md p-2">
            <div
                className="button-group"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={editor.isActive("bold") ? "is-active" : ""}
                    aria-label="Toggle bold"
                    title="Toggle bold"
                >
                    <FontBoldIcon />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={
                        !editor.can().chain().focus().toggleItalic().run()
                    }
                    className={editor.isActive("italic") ? "is-active" : ""}
                    aria-label="Toggle italic"
                    title="Toggle italic"
                >
                    <FontItalicIcon />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={
                        !editor.can().chain().focus().toggleStrike().run()
                    }
                    className={editor.isActive("strike") ? "is-active" : ""}
                    aria-label="Toggle strikethrough"
                    title="Toggle strikethrough"
                >
                    <StrikethroughIcon />
                </button>
                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                    disabled={
                        !editor.can().chain().focus().toggleUnderline().run()
                    }
                    className={editor.isActive("underline") ? "is-active" : ""}
                    aria-label="Toggle underline"
                    title="Toggle underline"
                >
                    <UnderlineIcon />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    disabled={!editor.can().chain().focus().toggleCode().run()}
                    className={editor.isActive("code") ? "is-active" : ""}
                    aria-label="Toggle code"
                    title="Toggle code"
                >
                    <CodeIcon />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().unsetAllMarks().run()}
                    aria-label="Clear marks"
                    title="Clear marks"
                >
                    Clear marks
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().clearNodes().run()}
                    aria-label="Clear nodes"
                    title="Clear nodes"
                >
                    Clear nodes
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    className={editor.isActive("paragraph") ? "is-active" : ""}
                    aria-label="Set paragraph"
                    title="Set paragraph"
                >
                    <BsTextParagraph />
                </button>
                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                    className={
                        editor.isActive("heading", { level: 1 })
                            ? "is-active"
                            : ""
                    }
                    aria-label="Toggle heading level 1"
                    title="Toggle heading level 1"
                >
                    H1
                </button>
                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    className={
                        editor.isActive("heading", { level: 2 })
                            ? "is-active"
                            : ""
                    }
                    aria-label="Toggle heading level 2"
                    title="Toggle heading level 2"
                >
                    H2
                </button>
                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                    className={
                        editor.isActive("heading", { level: 3 })
                            ? "is-active"
                            : ""
                    }
                    aria-label="Toggle heading level 3"
                    title="Toggle heading level 3"
                >
                    H3
                </button>
                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 4 }).run()
                    }
                    className={
                        editor.isActive("heading", { level: 4 })
                            ? "is-active"
                            : ""
                    }
                    aria-label="Toggle heading level 4"
                    title="Toggle heading level 4"
                >
                    H4
                </button>
                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 5 }).run()
                    }
                    className={
                        editor.isActive("heading", { level: 5 })
                            ? "is-active"
                            : ""
                    }
                    aria-label="Toggle heading level 5"
                    title="Toggle heading level 5"
                >
                    H5
                </button>
                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 6 }).run()
                    }
                    className={
                        editor.isActive("heading", { level: 6 })
                            ? "is-active"
                            : ""
                    }
                    aria-label="Toggle heading level 6"
                    title="Toggle heading level 6"
                >
                    H6
                </button>
                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    className={editor.isActive("bulletList") ? "is-active" : ""}
                    aria-label="Toggle bullet list"
                    title="Toggle bullet list"
                >
                    <ListBulletIcon />
                </button>
                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    className={
                        editor.isActive("orderedList") ? "is-active" : ""
                    }
                    aria-label="Toggle ordered list"
                    title="Toggle ordered list"
                >
                    <FaListOl className="text-base" />
                </button>
                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                    }
                    className={editor.isActive("codeBlock") ? "is-active" : ""}
                    aria-label="Toggle code block"
                    title="Toggle code block"
                >
                    <BiCodeBlock className="text-base" />
                </button>
                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                    className={editor.isActive("blockquote") ? "is-active" : ""}
                    aria-label="Toggle blockquote"
                    title="Toggle blockquote"
                >
                    <QuoteIcon />
                </button>
                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().setHorizontalRule().run()
                    }
                    aria-label="Insert horizontal rule"
                    title="Insert horizontal rule"
                >
                    <DividerHorizontalIcon />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setHardBreak().run()}
                    aria-label="Insert hard break"
                    title="Insert hard break"
                >
                    <LinkBreak1Icon />
                </button>

                <CustomPrompt callback={promptCb} />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    aria-label="Undo"
                    title="Undo"
                >
                    <IoIosUndo className="text-base" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    aria-label="Redo"
                    title="Redo"
                >
                    <IoIosRedo className="text-base" />
                </button>
            </div>
        </div>
    );
};

export const editorExtensions = [
    StarterKit.configure({
        bulletList: {
            keepMarks: true,
            keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
        orderedList: {
            keepMarks: true,
            keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
    }),
    Image,
    Underline,
];
export default ({ editor }: { editor: Editor | null }) => {
    // const addImage = useCallback(() => {}, []);

    return (
        <div id="tiptap">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};
