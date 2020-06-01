import React, { Component } from "react";
import ReactQuill from "react-quill";
import { imageHandlerApi } from "../../helpers/api"
import PropTypes from "prop-types";
// import katex from 'katex';
import "../../css/editor.css"


export default class Editor extends Component {


  
  render() {
    return (
      <div>
        <ReactQuill
          onChange={this.props.onChange}
          value={this.props.html || ''}
          placeholder={this.props.placeholder}
          modules={Editor.modules}
          formats={Editor.formats}
        ></ReactQuill>
      </div>
    );
  }
}





 
Editor.modules = {
    // table:true,
    toolbar: {
      container: [
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ script: "sub" }, { script: "super" }],
        [{ color: [] }, { background: [] }],
        [{ 'align': [] }],
        [ 
          { indent: "-1" },
          { indent: "+1" }
        ],
        [
          { list: "ordered" },
          { list: "bullet" },
        ],
        ["image","link","formula"],
        ["clean"],
        // 'insertStar'
        // ['table']
      ],
      handlers: {
        image: function(file) {
          if (file) {
            const input = document.createElement("input");
  
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.click();
  
            input.onchange = () => {
              // debugger;
              const file = input.files[0];
              const formData = new FormData();
  
              formData.append("file", file);
              formData.append("filetype", "image");
              // Save current cursor state
              const range = this.quill.getSelection(true);
  
              // Insert temporary loading placeholder image
              this.quill.insertEmbed(
                range.index,
                "image",
                `${window.location.origin}/images/loaders/placeholder.gif`
              );
  
              // Move cursor to right side of image (easier to continue typing)
              this.quill.setSelection(range.index + 1);
  
              imageHandlerApi(formData).then(response => {
                this.quill.deleteText(range.index, 1);
                this.quill.insertEmbed(
                  range.index,
                  "image",
                  response.result[0].file_path
                );
              });
            };
          }
        },
        clipboard: {
          // toggle to add extra line breaks when pasting HTML:
          matchVisual: false
        }
      }
    }
  };
  
  Editor.formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "align",
    // "video",
    "color",
    "background",
    "script",
    'formula',
    // 'table'
  ];
  


  
  Editor.propTypes = {
    placeholder: PropTypes.string,
    html:PropTypes.string,
    onChange:PropTypes.func
  };
  