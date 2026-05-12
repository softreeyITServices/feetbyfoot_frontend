"use client";

import React, { useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  $getRoot,
} from "lexical";
import { mergeRegister } from "@lexical/utils";

/* ================= THEME ================= */

const theme = {
  paragraph: "editor-paragraph",
  quote: "editor-quote",
  heading: {
    h1: "editor-heading-h1",
    h2: "editor-heading-h2",
    h3: "editor-heading-h3",
  },
  list: {
    ol: "editor-list-ol",
    ul: "editor-list-ul",
    listitem: "editor-listitem",
  },
  link: "editor-link",
  text: {
    bold: "editor-text-bold",
    italic: "editor-text-italic",
    underline: "editor-text-underline",
    strikethrough: "editor-text-strikethrough",
    code: "editor-text-code",
  },
};

/* ================= TOOLBAR PLUGIN ================= */

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const updateToolbar = React.useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [editor, updateToolbar]);

  return (
    <div style={styles.toolbar}>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        style={{ ...styles.toolbarBtn, ...(isBold ? styles.activeBtn : {}) }}
        title="Bold"
      >
        <span style={{ fontWeight: "bold" }}>B</span>
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        style={{ ...styles.toolbarBtn, ...(isItalic ? styles.activeBtn : {}) }}
        title="Italic"
      >
        <span style={{ fontStyle: "italic" }}>I</span>
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        style={{ ...styles.toolbarBtn, ...(isUnderline ? styles.activeBtn : {}) }}
        title="Underline"
      >
        <span style={{ textDecoration: "underline" }}>U</span>
      </button>
    </div>
  );
}

/* ================= INITIAL CONTENT PLUGIN ================= */

function InitialContentPlugin({ value }: { value: string }) {
  const [editor] = useLexicalComposerContext();
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (isFirstRender && value) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(value, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        $getRoot().clear();
        $getRoot().append(...nodes);
      });
      setIsFirstRender(false);
    }
  }, [editor, value, isFirstRender]);

  return null;
}

/* ================= ONCHANGE PLUGIN ================= */

function OnChangePlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor);
        onChange(html);
      });
    });
  }, [editor, onChange]);
  return null;
}

/* ================= MAIN COMPONENT ================= */

interface LexicalEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function LexicalEditor({ value, onChange }: LexicalEditorProps) {
  const initialConfig = {
    namespace: "CMS-Editor",
    theme,
    onError: (error: Error) => console.error(error),
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      LinkNode,
      AutoLinkNode,
    ],
  };

  return (
    <div style={styles.editorContainer}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div style={styles.editorInner}>
          <RichTextPlugin
            contentEditable={<ContentEditable style={styles.contentEditable} />}
            placeholder={<div style={styles.placeholder}>Start typing...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <InitialContentPlugin value={value} />
          <OnChangePlugin onChange={onChange} />
        </div>
      </LexicalComposer>

      <style>{editorStyles}</style>
    </div>
  );
}

/* ================= STYLES ================= */

const styles: Record<string, React.CSSProperties> = {
  editorContainer: {
    border: "1px solid #e8e8ef",
    borderRadius: "12px",
    background: "#fff",
    position: "relative",
    overflow: "hidden",
  },
  toolbar: {
    display: "flex",
    gap: "0.4rem",
    padding: "0.6rem",
    borderBottom: "1px solid #e8e8ef",
    background: "#fafafa",
  },
  toolbarBtn: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    color: "#333",
    transition: "all 0.2s",
  },
  activeBtn: {
    background: "#f0f0f5",
    color: "#1a1a2e",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
  },
  editorInner: {
    position: "relative",
    minHeight: "420px",
  },
  contentEditable: {
    minHeight: "420px",
    padding: "1.25rem",
    outline: "none",
    fontSize: "0.95rem",
    lineHeight: "1.7",
    fontFamily: "inherit",
    color: "#1a1a2e",
  },
  placeholder: {
    position: "absolute",
    top: "1.25rem",
    left: "1.25rem",
    color: "#a0a0b0",
    pointerEvents: "none",
    fontSize: "0.95rem",
  },
};

const editorStyles = `
  .editor-text-bold { font-weight: 700; }
  .editor-text-italic { font-style: italic; }
  .editor-text-underline { text-decoration: underline; }
  .editor-list-ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
  .editor-list-ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
  .editor-listitem { margin-bottom: 0.5rem; }
  .editor-paragraph { margin-bottom: 1rem; }
  .editor-paragraph:last-child { margin-bottom: 0; }
`;
