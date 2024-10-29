import React, { useState, useCallback } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";
import "./App.css"; // Import the CSS file

const styleMap = {
  HEADING: {
    fontSize: "24px",
    fontWeight: "bold",
  },
  BOLD: {
    fontWeight: "bold",
  },
  RED: {
    color: "red",
  },
  UNDERLINE: {
    textDecoration: "underline",
  },
};

export default function App() {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem("draftEditorContent");
    if (savedContent) {
      return EditorState.createWithContent(
        convertFromRaw(JSON.parse(savedContent))
      );
    }
    return EditorState.createEmpty();
  });

  const handleBeforeInput = useCallback((chars, editorState) => {
    if (chars !== " ") return "not-handled";

    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const block = content.getBlockForKey(selection.getStartKey());
    const text = block.getText();

    if (text === "#") {
      setEditorState(
        RichUtils.toggleBlockType(
          EditorState.push(
            editorState,
            Modifier.replaceText(
              content,
              selection.merge({ anchorOffset: 0, focusOffset: 1 }),
              ""
            ),
            "remove-range"
          ),
          "header-one"
        )
      );
      return "handled";
    } else if (text === "*") {
      setEditorState(
        RichUtils.toggleInlineStyle(
          EditorState.push(
            editorState,
            Modifier.replaceText(
              content,
              selection.merge({ anchorOffset: 0, focusOffset: 1 }),
              ""
            ),
            "remove-range"
          ),
          "BOLD"
        )
      );
      return "handled";
    } else if (text === "**") {
      setEditorState(
        RichUtils.toggleInlineStyle(
          EditorState.push(
            editorState,
            Modifier.replaceText(
              content,
              selection.merge({ anchorOffset: 0, focusOffset: 2 }),
              ""
            ),
            "remove-range"
          ),
          "RED"
        )
      );
      return "handled";
    } else if (text === "***") {
      setEditorState(
        RichUtils.toggleInlineStyle(
          EditorState.push(
            editorState,
            Modifier.replaceText(
              content,
              selection.merge({ anchorOffset: 0, focusOffset: 3 }),
              ""
            ),
            "remove-range"
          ),
          "UNDERLINE"
        )
      );
      return "handled";
    }

    return "not-handled";
  }, []);

  const handleReturn = useCallback((e, editorState) => {
    const newContent = Modifier.splitBlock(
      editorState.getCurrentContent(),
      editorState.getSelection()
    );
    const newEditorState = EditorState.push(
      editorState,
      newContent,
      "split-block"
    );
    setEditorState(EditorState.setInlineStyleOverride(newEditorState, []));
    return "handled";
  }, []);

  const handleSave = useCallback(() => {
    const content = editorState.getCurrentContent();
    localStorage.setItem(
      "draftEditorContent",
      JSON.stringify(convertToRaw(content))
    );
  }, [editorState]);

  return (
    <div className="container">
      <h1 className="heading">Editor by Krutik Maru</h1>
      <div>
        <button onClick={handleSave} className="button">
          Save
        </button>
      </div>
      <div className="editor-container">
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          customStyleMap={styleMap}
          handleBeforeInput={handleBeforeInput}
          handleReturn={handleReturn}
        />
      </div>
    </div>
  );
}
