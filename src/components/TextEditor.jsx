import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "code",
];

const TextEditor = ({ value, onChange, placeholder }) => {
  return (
    <ReactQuill
      theme="snow"
      value={value || ""}
      modules={modules}
      formats={formats}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};

export default TextEditor;
